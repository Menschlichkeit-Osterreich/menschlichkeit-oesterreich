<?php

namespace Drupal\pii_sanitizer;

/**
 * PII Sanitizer for DSGVO-compliant log redaction.
 *
 * Implements comprehensive PII detection and sanitization for:
 * - Email addresses
 * - Phone numbers (E.164 international format)
 * - Credit card numbers (with Luhn validation)
 * - IBAN (AT/DE/CH)
 * - JWT/Bearer tokens
 * - IP addresses (v4/v6)
 * - API secrets (AWS/GitHub/Slack patterns)
 *
 * @package Drupal\pii_sanitizer
 */
class PiiSanitizer {

  /**
   * Redaction strategy constants.
   */
  const STRATEGY_DROP = 'drop';
  const STRATEGY_REDACT = 'redact';
  const STRATEGY_MASK = 'mask';
  const STRATEGY_HASH = 'hash';

  /**
   * Metrics tracking.
   */
  private static $metrics = [
    'emails_redacted' => 0,
    'phones_redacted' => 0,
    'cards_redacted' => 0,
    'ibans_redacted' => 0,
    'ips_redacted' => 0,
    'jwts_redacted' => 0,
    'secrets_redacted' => 0,
  ];

  /**
   * Configuration.
   */
  private $config;

  /**
   * Compiled regex patterns.
   */
  private static $patterns = [];

  /**
   * Constructor.
   *
   * @param array $config
   *   Configuration array with keys:
   *   - enabled: bool (default: true)
   *   - default_strategy: string (default: 'mask')
   *   - sensitive_fields: array (fields to DROP)
   *   - allowlist_fields: array (fields to skip)
   */
  public function __construct(array $config = []) {
    $this->config = array_merge([
      'enabled' => TRUE,
      'default_strategy' => self::STRATEGY_MASK,
      'sensitive_fields' => [
        'password', 'pass', 'secret', 'token', 'api_key', 'apikey',
        'authorization', 'auth', 'cookie', 'session',
      ],
      'allowlist_fields' => [
        'timestamp', 'level', 'severity', 'channel', 'context',
      ],
    ], $config);

    $this->initPatterns();
  }

  /**
   * Initialize compiled regex patterns.
   */
  private function initPatterns() {
    if (!empty(self::$patterns)) {
      return;
    }

    self::$patterns = [
      'email' => '/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/',
      'phone' => '/\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/',
      'credit_card' => '/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/',
      'iban' => '/\b(AT|DE|CH)\d{2}\s?(\d{4}\s?){3,5}\d{1,2}\b/i',
      'jwt' => '/Bearer\s+[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/',
      'ipv4' => '/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/',
      'ipv6' => '/\b([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/',
      'aws_secret' => '/AKIA[0-9A-Z]{16}/',
      'github_token' => '/ghp_[a-zA-Z0-9]{36}/',
      'slack_token' => '/xox[baprs]-[0-9a-zA-Z-]+/',
    ];
  }

  /**
   * Scrub text for PII patterns.
   *
   * @param string $text
   *   Input text to sanitize.
   *
   * @return string
   *   Sanitized text with PII redacted.
   */
  public function scrubText(string $text): string {
    if (!$this->config['enabled']) {
      return $text;
    }

    // Credit Card FIRST (before phone pattern can match!)
    $text = preg_replace_callback(self::$patterns['credit_card'], function($matches) {
      $card = preg_replace('/[\s-]/', '', $matches[0]);
      if ($this->validateLuhn($card)) {
        self::$metrics['cards_redacted']++;
        return '[CARD]';
      }
      return $matches[0];
    }, $text);

    // Email
    $text = preg_replace_callback(self::$patterns['email'], function($matches) {
      self::$metrics['emails_redacted']++;
      return $this->maskEmail($matches[0]);
    }, $text);

    // Phone (after credit cards!)
    $text = preg_replace_callback(self::$patterns['phone'], function($matches) {
      self::$metrics['phones_redacted']++;
      return $this->maskPhone($matches[0]);
    }, $text);

    // IBAN
    $text = preg_replace_callback(self::$patterns['iban'], function($matches) {
      self::$metrics['ibans_redacted']++;
      return $this->maskIban($matches[0]);
    }, $text);

    // JWT/Bearer
    $text = preg_replace_callback(self::$patterns['jwt'], function($matches) {
      self::$metrics['jwts_redacted']++;
      return 'Bearer [REDACTED]';
    }, $text);

    // IPv4
    $text = preg_replace_callback(self::$patterns['ipv4'], function($matches) {
      self::$metrics['ips_redacted']++;
      return $this->maskIpv4($matches[0]);
    }, $text);

    // IPv6
    $text = preg_replace_callback(self::$patterns['ipv6'], function($matches) {
      self::$metrics['ips_redacted']++;
      return '[IPv6_REDACTED]';
    }, $text);

    // API Secrets
    foreach (['aws_secret', 'github_token', 'slack_token'] as $secret_type) {
      $text = preg_replace_callback(self::$patterns[$secret_type], function($matches) {
        self::$metrics['secrets_redacted']++;
        return '[SECRET_REDACTED]';
      }, $text);
    }

    return $text;
  }

  /**
   * Scrub dictionary/array for PII.
   *
   * @param array $data
   *   Input array to sanitize.
   * @param string $strategy
   *   Redaction strategy (drop/redact/mask/hash).
   *
   * @return array
   *   Sanitized array with PII redacted.
   */
  public function scrubDict(array $data, string $strategy = null): array {
    if (!$this->config['enabled']) {
      return $data;
    }

    $strategy = $strategy ?? $this->config['default_strategy'];
    $scrubbed = [];

    foreach ($data as $key => $value) {
      // Check allowlist (skip processing)
      if (in_array($key, $this->config['allowlist_fields'])) {
        $scrubbed[$key] = $value;
        continue;
      }

      // Check sensitive fields (DROP strategy)
      if (in_array(strtolower($key), $this->config['sensitive_fields'])) {
        if ($strategy === self::STRATEGY_DROP) {
          continue; // Skip this field entirely
        }
        $scrubbed[$key] = '[REDACTED]';
        continue;
      }

      // Recursive array processing
      if (is_array($value)) {
        $scrubbed[$key] = $this->scrubDict($value, $strategy);
      }
      // String processing
      elseif (is_string($value)) {
        $scrubbed[$key] = $this->scrubText($value);
      }
      // Other types pass through
      else {
        $scrubbed[$key] = $value;
      }
    }

    return $scrubbed;
  }

  /**
   * Validate credit card using Luhn algorithm.
   *
   * @param string $number
   *   Card number (digits only).
   *
   * @return bool
   *   TRUE if valid, FALSE otherwise.
   */
  private function validateLuhn(string $number): bool {
    $number = preg_replace('/\D/', '', $number);
    $length = strlen($number);

    if ($length < 13 || $length > 19) {
      return FALSE;
    }

    $sum = 0;
    $parity = $length % 2;

    for ($i = 0; $i < $length; $i++) {
      $digit = (int) $number[$i];

      if ($i % 2 == $parity) {
        $digit *= 2;
        if ($digit > 9) {
          $digit -= 9;
        }
      }

      $sum += $digit;
    }

    return $sum % 10 === 0;
  }

  /**
   * Mask email address.
   *
   * @param string $email
   *   Email address.
   *
   * @return string
   *   Masked email (e.g., m**@example.com).
   */
  private function maskEmail(string $email): string {
    $parts = explode('@', $email);
    if (count($parts) !== 2) {
      return '[EMAIL]';
    }

    $local = $parts[0];
    $domain = $parts[1];

    $masked_local = substr($local, 0, 1) . '**';
    return $masked_local . '@' . $domain;
  }

  /**
   * Mask phone number.
   *
   * @param string $phone
   *   Phone number.
   *
   * @return string
   *   Masked phone (e.g., +43*********).
   */
  private function maskPhone(string $phone): string {
    if (strpos($phone, '+') === 0) {
      return substr($phone, 0, 3) . '*********';
    }
    return '***-***-' . substr($phone, -4);
  }

  /**
   * Mask IBAN.
   *
   * @param string $iban
   *   IBAN string.
   *
   * @return string
   *   Masked IBAN (e.g., AT61***).
   */
  private function maskIban(string $iban): string {
    $iban = str_replace(' ', '', $iban);
    return substr($iban, 0, 4) . '***';
  }

  /**
   * Mask IPv4 address.
   *
   * @param string $ip
   *   IPv4 address.
   *
   * @return string
   *   Masked IP (e.g., 192.168.*.*).
   */
  private function maskIpv4(string $ip): string {
    $parts = explode('.', $ip);
    return $parts[0] . '.' . $parts[1] . '.*.*';
  }

  /**
   * Get redaction metrics.
   *
   * @return array
   *   Metrics array with counts.
   */
  public static function getMetrics(): array {
    return self::$metrics;
  }

  /**
   * Reset metrics (for testing).
   */
  public static function resetMetrics(): void {
    self::$metrics = [
      'emails_redacted' => 0,
      'phones_redacted' => 0,
      'cards_redacted' => 0,
      'ibans_redacted' => 0,
      'ips_redacted' => 0,
      'jwts_redacted' => 0,
      'secrets_redacted' => 0,
    ];
  }

}

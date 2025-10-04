<?php

namespace Drupal\Tests\pii_sanitizer\Unit;

use PHPUnit\Framework\TestCase;

// Standalone test - load class directly
require_once dirname(__DIR__, 3) . '/src/PiiSanitizer.php';

use Drupal\pii_sanitizer\PiiSanitizer;

/**
 * Unit tests for PiiSanitizer class.
 *
 * @group pii_sanitizer
 * @coversDefaultClass \Drupal\pii_sanitizer\PiiSanitizer
 */
class PiiSanitizerTest extends TestCase
{

  /**
   * The PiiSanitizer instance.
   *
   * @var \Drupal\pii_sanitizer\PiiSanitizer
   */
  protected $sanitizer;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void
  {
    parent::setUp();
    $this->sanitizer = new PiiSanitizer(['enabled' => TRUE]);
    PiiSanitizer::resetMetrics();
  }

  /**
   * Test email sanitization.
   *
   * @covers ::scrubText
   */
  public function testEmailSanitization()
  {
    $input = 'Contact us at info@example.com for help';
    $output = $this->sanitizer->scrubText($input);

    $this->assertStringContainsString('i**@example.com', $output);
    $this->assertStringNotContainsString('info@example.com', $output);

    $metrics = PiiSanitizer::getMetrics();
    $this->assertEquals(1, $metrics['emails_redacted']);
  }

  /**
   * Test multiple email addresses.
   *
   * @covers ::scrubText
   */
  public function testMultipleEmails()
  {
    $input = 'Send to john.doe@company.org and jane@example.at';
    $output = $this->sanitizer->scrubText($input);

    $this->assertStringContainsString('j**@company.org', $output);
    $this->assertStringContainsString('j**@example.at', $output);

    $metrics = PiiSanitizer::getMetrics();
    $this->assertEquals(2, $metrics['emails_redacted']);
  }

  /**
   * Test phone number sanitization (E.164).
   *
   * @covers ::scrubText
   */
  public function testPhoneSanitization()
  {
    $tests = [
      '+43 664 1234567' => '+43*********',
      '+49-30-12345678' => '+49*********',
      '+41 79 123 45 67' => '+41*********',
    ];

    foreach ($tests as $input => $expected_pattern) {
      PiiSanitizer::resetMetrics();
      $output = $this->sanitizer->scrubText("Call $input now");
      $this->assertStringContainsString('***', $output);

      $metrics = PiiSanitizer::getMetrics();
      $this->assertGreaterThan(0, $metrics['phones_redacted']);
    }
  }

  /**
   * Test credit card sanitization with Luhn validation.
   *
   * @covers ::scrubText
   * @covers ::validateLuhn
   */
  public function testCreditCardSanitization()
  {
    // Valid Visa Test Card (Luhn valid)
    $input = 'Card: 4111-1111-1111-1111';
    $output = $this->sanitizer->scrubText($input);

    $this->assertStringContainsString('[CARD]', $output);
    $this->assertStringNotContainsString('4111', $output);

    $metrics = PiiSanitizer::getMetrics();
    $this->assertEquals(1, $metrics['cards_redacted']);
  }

  /**
   * Test Luhn algorithm validation.
   *
   * @covers ::validateLuhn
   */
  public function testLuhnValidation()
  {
    $reflection = new \ReflectionClass($this->sanitizer);
    $method = $reflection->getMethod('validateLuhn');
    $method->setAccessible(TRUE);

    // Valid card numbers (real test cards that pass Luhn check)
    $valid_cards = [
      '4111111111111111', // Visa Test Card
      '5555555555554444', // MasterCard Test Card
      '378282246310005',  // American Express Test Card
    ];

    foreach ($valid_cards as $card) {
      $this->assertTrue(
        $method->invoke($this->sanitizer, $card),
        "Card $card should pass Luhn validation"
      );
    }

    // Invalid card numbers
    $invalid_cards = [
      '1234567890123456',
      '0000000000000000',
      '9999999999999999',
    ];

    foreach ($invalid_cards as $card) {
      $this->assertFalse(
        $method->invoke($this->sanitizer, $card),
        "Card $card should fail Luhn validation"
      );
    }
  }

  /**
   * Test IBAN sanitization.
   *
   * @covers ::scrubText
   */
  public function testIbanSanitization()
  {
    $tests = [
      'AT61 1904 3002 3457 3201' => 'AT61***',
      'DE89 3704 0044 0532 0130 00' => 'DE89***',
      'CH93 0076 2011 6238 5295 7' => 'CH93***',
    ];

    foreach ($tests as $iban => $expected) {
      PiiSanitizer::resetMetrics();
      $output = $this->sanitizer->scrubText("IBAN: $iban");

      $this->assertStringContainsString($expected, $output);
      $this->assertStringNotContainsString($iban, $output);

      $metrics = PiiSanitizer::getMetrics();
      $this->assertEquals(1, $metrics['ibans_redacted']);
    }
  }

  /**
   * Test JWT/Bearer token sanitization.
   *
   * @covers ::scrubText
   */
  public function testJwtSanitization()
  {
    $input = 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    $output = $this->sanitizer->scrubText($input);

    $this->assertStringContainsString('Bearer [REDACTED]', $output);
    $this->assertStringNotContainsString('eyJhbGci', $output);
  }

  /**
   * Test IPv4 sanitization.
   *
   * @covers ::scrubText
   */
  public function testIpv4Sanitization()
  {
    $input = 'User from 192.168.1.100 accessed the system';
    $output = $this->sanitizer->scrubText($input);

    $this->assertStringContainsString('192.168.*.*', $output);
    $this->assertStringNotContainsString('192.168.1.100', $output);
  }

  /**
   * Test IPv6 sanitization.
   *
   * @covers ::scrubText
   */
  public function testIpv6Sanitization()
  {
    $input = 'IPv6: 2001:0db8:85a3:0000:0000:8a2e:0370:7334';
    $output = $this->sanitizer->scrubText($input);

    $this->assertStringContainsString('[IPv6_REDACTED]', $output);
  }

  /**
   * Test API secret sanitization.
   *
   * @covers ::scrubText
   */
  public function testApiSecretSanitization()
  {
    $tests = [
      'AWS: AKIAIOSFODNN7EXAMPLE' => '[SECRET_REDACTED]',
      'GitHub: ghp_1234567890abcdefghijklmnopqrstuvwx' => '[SECRET_REDACTED]',
      'Slack: xoxb-123456789012-1234567890123-abcdefghijklmnopqrstuvwx' => '[SECRET_REDACTED]',
    ];

    foreach ($tests as $input => $expected) {
      $output = $this->sanitizer->scrubText($input);
      $this->assertStringContainsString($expected, $output);
    }
  }

  /**
   * Test dictionary sanitization with DROP strategy.
   *
   * @covers ::scrubDict
   */
  public function testDictSanitizationDrop()
  {
    $input = [
      'username' => 'john_doe',
      'password' => 'secret123',
      'api_key' => 'ABC123DEF456',
      'email' => 'john@example.com',
      'timestamp' => '2025-10-04T12:00:00Z',
    ];

    $output = $this->sanitizer->scrubDict($input, PiiSanitizer::STRATEGY_DROP);

    // Sensitive fields should be removed
    $this->assertArrayNotHasKey('password', $output);
    $this->assertArrayNotHasKey('api_key', $output);

    // Email should be masked
    $this->assertStringContainsString('**', $output['email']);

    // Allowlisted fields pass through
    $this->assertEquals('2025-10-04T12:00:00Z', $output['timestamp']);
  }

  /**
   * Test dictionary sanitization with MASK strategy.
   *
   * @covers ::scrubDict
   */
  public function testDictSanitizationMask()
  {
    $input = [
      'message' => 'Call +43 664 1234567',
      'user_email' => 'admin@example.com',
    ];

    $output = $this->sanitizer->scrubDict($input, PiiSanitizer::STRATEGY_MASK);

    $this->assertStringContainsString('***', $output['message']);
    $this->assertStringContainsString('**', $output['user_email']);
  }

  /**
   * Test nested array sanitization.
   *
   * @covers ::scrubDict
   */
  public function testNestedArraySanitization()
  {
    $input = [
      'user' => [
        'name' => 'John Doe',
        'contact' => [
          'email' => 'john@example.com',
          'phone' => '+43 664 1234567',
        ],
      ],
      'timestamp' => '2025-10-04',
    ];

    $output = $this->sanitizer->scrubDict($input);

    $this->assertStringContainsString('**', $output['user']['contact']['email']);
    $this->assertStringContainsString('***', $output['user']['contact']['phone']);
    $this->assertEquals('2025-10-04', $output['timestamp']);
  }

  /**
   * Test metrics collection.
   *
   * @covers ::getMetrics
   * @covers ::resetMetrics
   */
  public function testMetricsCollection()
  {
    PiiSanitizer::resetMetrics();

    $input = 'Email: test@example.com, Phone: +43 664 1234567, Card: 4532015114161234';
    $this->sanitizer->scrubText($input);

    $metrics = PiiSanitizer::getMetrics();

    $this->assertEquals(1, $metrics['emails_redacted']);
    $this->assertGreaterThan(0, $metrics['phones_redacted']);
    $this->assertEquals(1, $metrics['cards_redacted']);

    // Reset and verify
    PiiSanitizer::resetMetrics();
    $metrics = PiiSanitizer::getMetrics();
    $this->assertEquals(0, $metrics['emails_redacted']);
  }

  /**
   * Test disabled sanitizer.
   *
   * @covers ::scrubText
   */
  public function testDisabledSanitizer()
  {
    $disabled_sanitizer = new PiiSanitizer(['enabled' => FALSE]);

    $input = 'Email: test@example.com';
    $output = $disabled_sanitizer->scrubText($input);

    // Should pass through unchanged
    $this->assertEquals($input, $output);
  }

  /**
   * Test Golden Samples - DSGVO critical scenarios.
   *
   * @covers ::scrubText
   */
  public function testGoldenSamplesDsgvo()
  {
    $golden_samples = [
      // DSGVO Art. 9 - Besondere Kategorien (VALID TEST CARDS!)
      'Patient record: john.doe@hospital.at, +43 1 12345, Card: 4111111111111111' => [
        'must_not_contain' => ['john.doe@hospital.at', '+43 1 12345', '4111111111111111'],
        'must_contain' => ['**@hospital.at', '***', '[CARD]'],
      ],

      // Donation with full PII
      'Spende von Max Mustermann, max.mustermann@gmail.com, AT61 1904 3002 3457 3201' => [
        'must_not_contain' => ['max.mustermann@gmail.com', 'AT61 1904 3002 3457 3201'],
        'must_contain' => ['**@gmail.com', 'AT61***'],
      ],

      // API Log with Bearer token
      'POST /api/v1/users Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.signature' => [
        'must_not_contain' => ['eyJhbGci'],
        'must_contain' => ['Bearer [REDACTED]'],
      ],
    ];

    foreach ($golden_samples as $input => $assertions) {
      $output = $this->sanitizer->scrubText($input);

      foreach ($assertions['must_not_contain'] as $forbidden) {
        $this->assertStringNotContainsString(
          $forbidden,
          $output,
          "Output must not contain: $forbidden"
        );
      }

      foreach ($assertions['must_contain'] as $required) {
        $this->assertStringContainsString(
          $required,
          $output,
          "Output must contain: $required"
        );
      }
    }
  }

}

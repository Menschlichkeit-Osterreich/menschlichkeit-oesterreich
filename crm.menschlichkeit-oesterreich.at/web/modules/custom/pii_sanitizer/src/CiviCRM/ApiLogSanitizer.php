<?php

namespace Drupal\pii_sanitizer\CiviCRM;

use CRM_Utils_API_AbstractFieldOutputHandler;
use Drupal\pii_sanitizer\PiiSanitizer;

/**
 * API wrapper to sanitize CiviCRM API responses for logging.
 */
class ApiLogSanitizer extends CRM_Utils_API_AbstractFieldOutputHandler {

  /**
   * PII Sanitizer instance.
   *
   * @var \Drupal\pii_sanitizer\PiiSanitizer
   */
  protected $sanitizer;

  /**
   * Constructor.
   */
  public function __construct() {
    $this->sanitizer = new PiiSanitizer(['enabled' => TRUE]);
  }

  /**
   * {@inheritdoc}
   */
  public function toApiOutput($apiRequest, $values) {
    // Only sanitize for logging, not for actual API responses
    if (!$this->shouldSanitize()) {
      return $values;
    }

    if (is_array($values)) {
      return $this->sanitizer->scrubDict($values, PiiSanitizer::STRATEGY_MASK);
    }
    elseif (is_string($values)) {
      return $this->sanitizer->scrubText($values);
    }

    return $values;
  }

  /**
   * Check if we should sanitize.
   *
   * @return bool
   *   TRUE if logging is enabled.
   */
  protected function shouldSanitize(): bool {
    // Check if debug logging is enabled
    $config = \CRM_Core_Config::singleton();
    return !empty($config->debug);
  }

}

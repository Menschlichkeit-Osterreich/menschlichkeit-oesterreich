<?php

/**
 * @file
 * CiviCRM-specific PII sanitization hooks.
 */

use Drupal\pii_sanitizer\PiiSanitizer;

/**
 * Implements hook_civicrm_post().
 *
 * Sanitizes PII in CiviCRM activity logs after creation/update.
 */
function pii_sanitizer_civicrm_post($op, $objectName, $objectId, &$objectRef) {
  // Only process Activity entities
  if ($objectName !== 'Activity') {
    return;
  }

  $config = \Drupal::config('pii_sanitizer.settings');
  if (!($config->get('sanitize_civicrm_activities') ?? TRUE)) {
    return;
  }

  $sanitizer = new PiiSanitizer(['enabled' => TRUE]);

  // Sanitize activity details
  if (isset($objectRef->details)) {
    $objectRef->details = $sanitizer->scrubText($objectRef->details);
  }

  // Sanitize subject
  if (isset($objectRef->subject)) {
    $objectRef->subject = $sanitizer->scrubText($objectRef->subject);
  }

  // Sanitize custom fields (activity_details, notes, etc.)
  foreach ($objectRef as $key => $value) {
    if (is_string($value) && strpos($key, 'custom_') === 0) {
      $objectRef->$key = $sanitizer->scrubText($value);
    }
  }
}

/**
 * Implements hook_civicrm_apiWrappers().
 *
 * Sanitizes API responses for logging.
 */
function pii_sanitizer_civicrm_apiWrappers(&$wrappers, $apiRequest) {
  $config = \Drupal::config('pii_sanitizer.settings');
  
  if ($config->get('sanitize_civicrm_api_logs') ?? TRUE) {
    $wrappers[] = new \Drupal\pii_sanitizer\CiviCRM\ApiLogSanitizer();
  }
}

/**
 * Implements hook_civicrm_alterLogTables().
 *
 * Adds PII sanitization to CiviCRM log tables.
 */
function pii_sanitizer_civicrm_alterLogTables(&$logTableSpec) {
  // Add sanitization trigger for contact table logs
  if (isset($logTableSpec['civicrm_contact'])) {
    $logTableSpec['civicrm_contact']['sanitize_columns'] = [
      'email',
      'phone',
      'street_address',
      'supplemental_address_1',
      'supplemental_address_2',
      'city',
    ];
  }

  // Add sanitization for contribution logs (card info)
  if (isset($logTableSpec['civicrm_contribution'])) {
    $logTableSpec['civicrm_contribution']['sanitize_columns'] = [
      'creditcard_number',
      'iban',
      'check_number',
    ];
  }
}

/**
 * Implements hook_civicrm_permission().
 *
 * Define permission to view unredacted logs.
 */
function pii_sanitizer_civicrm_permission(&$permissions) {
  $permissions['view unredacted civicrm logs'] = [
    'label' => t('View Unredacted CiviCRM Logs'),
    'description' => t('Allow viewing PII in CiviCRM activity logs. DSGVO-KRITISCH!'),
  ];
}

/**
 * Implements hook_civicrm_searchColumns().
 *
 * Sanitize search results for non-privileged users.
 */
function pii_sanitizer_civicrm_searchColumns($objectName, &$headers, &$rows, &$selector) {
  $current_user = \Drupal::currentUser();
  
  // Allow admins and users with special permission to see full data
  if ($current_user->hasPermission('view unredacted civicrm logs')) {
    return;
  }

  $sanitizer = new PiiSanitizer(['enabled' => TRUE]);

  // Sanitize contact search results
  if ($objectName === 'contact') {
    foreach ($rows as &$row) {
      // Sanitize email
      if (isset($row['email'])) {
        $row['email'] = $sanitizer->scrubText($row['email']);
      }
      
      // Sanitize phone
      if (isset($row['phone'])) {
        $row['phone'] = $sanitizer->scrubText($row['phone']);
      }
      
      // Sanitize address fields
      foreach (['street_address', 'city', 'postal_code'] as $field) {
        if (isset($row[$field])) {
          $row[$field] = $sanitizer->scrubText($row[$field]);
        }
      }
    }
  }
}

/**
 * Implements hook_civicrm_export().
 *
 * Sanitize exported data.
 */
function pii_sanitizer_civicrm_export($exportTempTable, &$headerRows, &$sqlColumns) {
  $config = \Drupal::config('pii_sanitizer.settings');
  
  if ($config->get('sanitize_civicrm_exports') ?? TRUE) {
    $sanitizer = new PiiSanitizer(['enabled' => TRUE]);
    
    // Sanitize column headers containing PII keywords
    foreach ($headerRows as &$header) {
      $header = $sanitizer->scrubText($header);
    }
    
    // Add SQL CASE statements for PII columns
    $pii_columns = ['email', 'phone', 'credit_card_number', 'iban'];
    foreach ($sqlColumns as $column => &$sql) {
      $lower_column = strtolower($column);
      foreach ($pii_columns as $pii_type) {
        if (strpos($lower_column, $pii_type) !== FALSE) {
          $sql = "CONCAT(SUBSTRING($column, 1, 3), '***') AS $column";
        }
      }
    }
  }
}

# CiviCRM REST API v4 - HTTP Request Node Templates

Reusable templates for migrating n8n workflows from legacy CiviCRM node implementations to standard `n8n-nodes-base.httpRequest` nodes with CiviCRM REST API v4.

**UPDATED FOR CIVICRM APIIV4 SPECIFICATION COMPLIANCE** ✅ - All endpoints and authentication patterns use the official CiviCRM REST API v4 standards.

---

## Environment Variables (Required)

Add these to your n8n environment or workflow secrets:

```
CIVICRM_API_URL=https://crm.menschlichkeit-oesterreich.at
CIVICRM_API_KEY=<your-api-key-here>
CIVICRM_SITE_KEY=<your-site-key-if-required>
```

---

## Template 1: CREATE Contribution

**Purpose**: Create a new CiviCRM contribution record (e.g., from Stripe donation)

**Endpoint**: `POST /civicrm/ajax/api4/Contribution/create` ✅ CORRECTED

**Node Type**: `n8n-nodes-base.httpRequest` (typeVersion 3)

**Node Configuration**:

```json
{
  "parameters": {
    "method": "POST",
    "url": "={{ $env.CIVICRM_API_URL }}/civicrm/ajax/api4/Contribution/create",
    "authentication": "genericCredentialType",
    "genericCredentialType": "httpHeaderAuth",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "X-Civi-Auth",
          "value": "Bearer {{ $env.CIVICRM_API_KEY }}"
        }
      ]
    },
    "contentType": "application/json",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "values",
          "value": "={{ {contact_id: $json.donor.civicrm_id, total_amount: $json.amount, contribution_status_id: 1, financial_type_id: 1, receive_date: $now.toFormat('yyyy-MM-dd HH:mm:ss'), source: $json.source || 'Website Donation'} }}"
        }
      ]
    }
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 3,
  "name": "CiviCRM: Create Contribution",
  "id": "create-contribution-v4",
  "position": [680, 300]
}
```

**Input Data Structure**:

```json
{
  "donor": {
    "civicrm_id": "12345",
    "email": "donor@example.com"
  },
  "amount": 150.00,
  "source": "Stripe Subscription"
}
```

**Expected Response** (APIv4 Standard):

```json
{
  "values": [
    {
      "id": 98765,
      "contact_id": "12345",
      "total_amount": 150.00,
      "contribution_status_id": 1,
      "receive_date": "2026-05-06 14:23:00"
    }
  ],
  "count": 1
}
```

**Response Extraction**: Use `$json.values[0].id` or `$json.values?.[0]?.id` (with optional chaining) to extract contribution ID.

**Error Handling**: Catch HTTP 400/401/404 errors for validation/auth failures.

---

## Template 2: UPDATE Contribution

**Purpose**: Update an existing CiviCRM contribution record (e.g., mark as paid)

**Endpoint**: `POST /civicrm/ajax/api4/Contribution/update` ✅ CORRECTED

**Node Type**: `n8n-nodes-base.httpRequest` (typeVersion 3)

**Node Configuration**:

```json
{
  "parameters": {
    "method": "POST",
    "url": "={{ $env.CIVICRM_API_URL }}/civicrm/ajax/api4/Contribution/update",
    "authentication": "genericCredentialType",
    "genericCredentialType": "httpHeaderAuth",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "X-Civi-Auth",
          "value": "Bearer {{ $env.CIVICRM_API_KEY }}"
        }
      ]
    },
    "contentType": "application/json",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "values",
          "value": "={{ {id: $json.civicrm_contribution_id, contribution_status_id: $json.status_id || 1, receive_date: $now.toFormat('yyyy-MM-dd HH:mm:ss')} }}"
        }
      ]
    }
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 3,
  "name": "CiviCRM: Update Contribution",
  "id": "update-contribution-v4",
  "position": [900, 300]
}
```

**Input Data Structure**:

```json
{
  "civicrm_contribution_id": "98765",
  "status_id": 1
}
```

**Expected Response** (APIv4 Standard):

```json
{
  "values": [
    {
      "id": 98765,
      "contribution_status_id": 1,
      "receive_date": "2026-05-06 14:23:00"
    }
  ],
  "count": 1
}
```

---

## Template 3: SEARCH Contributions/Contacts

**Purpose**: Query CiviCRM contributions or contacts with filters (date range, status, etc.)

**Endpoints** (APIv4 Standard):
- `POST /civicrm/ajax/api4/Contribution/get?filter[field][operator]=value`
- `POST /civicrm/ajax/api4/Contact/get?filter[field][operator]=value`

**Node Type**: `n8n-nodes-base.httpRequest` (typeVersion 3)

**Node Configuration** (Example: Search contributions by date range):

```json
{
  "parameters": {
    "method": "POST",
    "url": "={{ $env.CIVICRM_API_URL }}/civicrm/ajax/api4/Contribution/get",
    "authentication": "genericCredentialType",
    "genericCredentialType": "httpHeaderAuth",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "X-Civi-Auth",
          "value": "Bearer {{ $env.CIVICRM_API_KEY }}"
        }
      ]
    },
    "contentType": "application/json",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "where",
          "value": "={{ [[\"contribution_status_id\", \"=\", 1], [\"receive_date\", \">=\", $json.start_date], [\"receive_date\", \"<=\", $json.end_date]] }}"
        },
        {
          "name": "limit",
          "value": "5000"
        }
      ]
    }
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 3,
  "name": "CiviCRM: Search Contributions",
  "id": "search-contributions-v4",
  "position": [680, 200]
}
```

**Input Data Structure** (for date range query):

```json
{
  "start_date": "2026-01-01",
  "end_date": "2026-01-31"
}
```

**Expected Response** (APIv4 Standard):

```json
{
  "values": [
    {
      "id": 98765,
      "contact_id": "12345",
      "total_amount": 150.00,
      "receive_date": "2026-01-15 10:00:00"
    },
    {
      "id": 98766,
      "contact_id": "12346",
      "total_amount": 200.00,
      "receive_date": "2026-01-20 14:30:00"
    }
  ],
  "count": 2
}
```

**Common Filters** (APIv4 WHERE Clause):
- `["contribution_status_id", "=", 1]` → Completed contributions
- `["financial_type_id", "=", 1]` → Donation type
- `["receive_date", ">=", "2026-01-01"]` → Date range start
- `["receive_date", "<=", "2026-01-31"]` → Date range end
- Nest multiple conditions in arrays for AND logic

---

## Template 4: GET Single Contact

**Purpose**: Retrieve specific contact details by ID

**Endpoint**: `POST /civicrm/ajax/api4/Contact/get?where=[["id","=",contact_id]]` ✅ CORRECTED

**Node Type**: `n8n-nodes-base.httpRequest` (typeVersion 3)

**Node Configuration**:

```json
{
  "parameters": {
    "method": "POST",
    "url": "={{ $env.CIVICRM_API_URL }}/civicrm/ajax/api4/Contact/get",
    "authentication": "genericCredentialType",
    "genericCredentialType": "httpHeaderAuth",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        {
          "name": "X-Civi-Auth",
          "value": "Bearer {{ $env.CIVICRM_API_KEY }}"
        }
      ]
    },
    "contentType": "application/json",
    "sendBody": true,
    "bodyParameters": {
      "parameters": [
        {
          "name": "where",
          "value": "={{ [[\"id\", \"=\", $json.contact_id]] }}"
        },
        {
          "name": "select",
          "value": "[\"display_name\", \"email\", \"street_address\", \"city\", \"postal_code\", \"country\"]"
        }
      ]
    }
  },
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 3,
  "name": "CiviCRM: Get Contact",
  "id": "get-contact-v4",
  "position": [1120, 300]
}
```

**Input Data Structure**:

```json
{
  "contact_id": "12345"
}
```

**Expected Response** (APIv4 Standard):

```json
{
  "id": 12345,
  "display_name": "Max Mustermann",
  "email": "max@example.com",
  "street_address": "Hauptstraße 1",
  "city": "Pottenbrunn",
  "postal_code": "3140",
  "country": "AT"
}
```

**Common Select Fields**:
- `display_name` → Full contact name
- `email` → Primary email
- `phone` → Primary phone
- `street_address` → Street
- `city` → City
- `postal_code` → ZIP code
- `country` → Country code

---

## Migration Checklist

When migrating a workflow from custom CiviCRM nodes:

- [ ] Read current workflow configuration (node type, resource, operation, parameters)
- [ ] Identify which template pattern to use (CREATE/UPDATE/SEARCH/GET)
- [ ] Copy template JSON to workflow
- [ ] Update URL/parameters for specific use case
- [ ] Test with sample data in n8n
- [ ] Verify CiviCRM API response handling
- [ ] Remove custom CiviCRM credential references
- [ ] Validate environment variables are set in n8n environment
- [ ] Smoke test full workflow execution

---

## API Documentation References

- **CiviCRM REST API v4**: https://docs.civicrm.org/dev/en/latest/api/v4/index.html
- **Authentication**: `X-Civi-Auth: Bearer <token>` header
- **Status Codes**: 
  - 200 OK
  - 400 Bad Request (validation error)
  - 401 Unauthorized (invalid API key)
  - 404 Not Found (resource not found)
  - 500 Server Error

---

## Environment Setup

In n8n:

1. Go to **Admin** → **Environment Variables**
2. Add:
   - `CIVICRM_API_URL` = `https://crm.menschlichkeit-oesterreich.at`
   - `CIVICRM_API_KEY` = (retrieve from CiviCRM admin or Bitwarden)
   - `CIVICRM_SITE_KEY` = (if required by CiviCRM setup)

Or configure per workflow in credentials.

---

## Notes

- All timestamps use ISO 8601 format with UTC timezone
- API key must have "REST API" permission enabled in CiviCRM
- Some workflows may require `CIVICRM_SITE_KEY` for multi-site CiviCRM setups
- Error responses should be handled with Try/Catch nodes

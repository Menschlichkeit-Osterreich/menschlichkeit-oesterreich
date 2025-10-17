#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
. "$DIR/issue-utils.sh"

create_issue() {
  local title="$1"; shift
  local body="$1"; shift
  local labels_json="$1"; shift
  api POST "/issues" -d "$(jq -n --arg t "$title" --arg b "$body" --argjson labels "$labels_json" '{title:$t, body:$b, labels:$labels}')"
}

# 1) Admin DLQ UI polish
create_issue \
  "[P1][area/frontend] Admin DLQ UI – list/requeue/purge with pagination and role gating" \
  "- Add pagination and search to DLQ list\n- Add role-based visibility (admin-only link in Nav)\n- Confirm dialogs and success toasts\n- Tests (basic rendering + API calls mocked)" \
  '["P1","area/frontend"]'

# 2) Adopt PageHeader
create_issue \
  "[P3][area/frontend] Adopt PageHeader in Donate/Join/Success and remaining pages" \
  "- Use PageHeader for consistent titles/breadcrumbs\n- Verify A11y (headings hierarchy, landmarks)" \
  '["P3","area/frontend"]'

# 3) Receipt PDF styling + S3 SSE
create_issue \
  "[P2][area/backend] Receipt PDF styling (logo/addresses) and SSE in S3 uploads" \
  "- Improve PDF layout (branding, footer note, tax info)\n- Add S3 Server-Side Encryption on upload\n- Lifecycle policy doc (retention, legal)" \
  '["P2","area/backend"]'

# 4) CiviCRM mappings docs
create_issue \
  "[P3][area/docs] Document payment_instrument_id and financial_type_id mappings" \
  "- Provide example JSON for PAYMENT_INSTRUMENT_MAP_JSON and FINANCIAL_TYPE_MAP_JSON\n- Note how to fetch IDs from CiviCRM option values" \
  '["P3","area/docs"]'

# 5) PSP Webhook → receipt automation
create_issue \
  "[P2][area/backend] Auto-generate + email receipt on successful webhook events" \
  "- Stripe: payment_intent.succeeded → receipt generation\n- PayPal: capture success → receipt generation\n- Allow opt-out for anonymous donations" \
  '["P2","area/backend"]'

echo "Issues created."


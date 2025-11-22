Issue Drafts and Updates

1) Update Issue #145 – [P0][area/n8n] WebhookQueue Processor
- Implemented:
  - Redis-backed queue with endpoints: /queue/push (Idempotency-Key), /queue/pop, /queue/ack, /queue/fail (exponential backoff, DLQ)
  - /queue/stats for monitoring (main/delayed/dlq, oldest_age)
  - n8n workflows: WebhookQueue_Processor, Queue Monitor (Slack + email alerts), DLQ Admin (manual)
  - JWT protection for queue and /civicrm passthrough (allowlist)
- Next:
  - Optional: Idempotency TTL configurable, DLQ inspector UI in frontend (partially added: AdminQueue page)

Suggested comment for #145:
> Backend queue + monitoring delivered. Added JWT-protected endpoints (push/pop/ack/fail/stats, DLQ list/requeue/purge), idempotency support, n8n workflows (enqueue + worker + alerts), and a basic Admin Queue page. Propose to close and track UI polish under a follow-up issue.

2) New Issue – Frontend: Admin DLQ UI (polish)
Title: [P1][area/frontend] Admin DLQ UI – list/requeue/purge with pagination and role gating
Body:
- Add pagination and search to DLQ list
- Add role-based visibility (admin-only link in Nav)
- Confirm dialogs and success toasts
- Tests (basic rendering + API calls mocked)

3) New Issue – Frontend: Adopt PageHeader across pages
Title: [P3][area/frontend] Adopt PageHeader in Donate/Join/Success and remaining pages
Body:
- Use PageHeader for consistent titles/breadcrumbs
- Verify A11y (headings hierarchy, landmarks)

4) New Issue – Receipts: PDF styling + numbering
Title: [P2][area/backend] Receipt PDF styling (logo/addresses) and SSE in S3 uploads
Body:
- Improve PDF layout (branding, footer note, tax info)
- Add S3 Server-Side Encryption on upload
- Lifecycle policy doc (retention, legal)

5) New Issue – CiviCRM mappings documentation
Title: [P3][area/docs] Document payment_instrument_id and financial_type_id mappings
Body:
- Provide example JSON for PAYMENT_INSTRUMENT_MAP_JSON and FINANCIAL_TYPE_MAP_JSON
- Note how to fetch IDs from CiviCRM option values

6) New Issue – PSP: Webhook → Receipt automation
Title: [P2][area/backend] Auto-generate + email receipt on successful webhook events
Body:
- Stripe: payment_intent.succeeded → receipt generation
- PayPal: capture success → receipt generation
- Allow opt-out for anonymous donations

API Examples (curl)
- Comment on #145 (requires GH_TOKEN):
```sh
curl -s -X POST -H "Authorization: token $GH_TOKEN" -H "Accept: application/vnd.github+json" \
  -d '{"body":"Backend queue + monitoring delivered..."}' \
  https://api.github.com/repos/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/issues/145/comments
```

Helper scripts (env: GH_TOKEN, GITHUB_OWNER, GITHUB_REPO)

- Comment #145:
  - `scripts/github/comment-145.sh`
- Create new issues from the list above:
  - `scripts/github/create-issues.sh`

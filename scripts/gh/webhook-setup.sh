#!/bin/bash
# Webhook für Deployment-Benachrichtigungen einrichten
# Usage: ./webhook-setup.sh [owner/repo] [webhook-url]

set -euo pipefail

REPO="${1:-Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development}"
WEBHOOK_URL="${2:-https://n8n.menschlichkeit-oesterreich.at/webhook/github-events}"

# Webhook-Secret generieren (falls nicht gesetzt)
if [ -z "${WEBHOOK_SECRET:-}" ]; then
    WEBHOOK_SECRET=$(openssl rand -hex 32)
    echo "⚠️  Generiertes Webhook-Secret (speichern!):"
    echo "   $WEBHOOK_SECRET"
    echo ""
fi

echo "🔗 Erstelle Webhook für: $REPO"
echo "   URL: $WEBHOOK_URL"

gh api "repos/$REPO/hooks" \
  -f name=web \
  -F config.url="$WEBHOOK_URL" \
  -F config.content_type=json \
  -F config.secret="$WEBHOOK_SECRET" \
  -F config.insecure_ssl=0 \
  -f events[]="push" \
  -f events[]="pull_request" \
  -f events[]="workflow_run" \
  -f events[]="release" \
  -f events[]="deployment" \
  -f events[]="deployment_status" \
  -F active=true

echo "✅ Webhook konfiguriert!"
echo ""
echo "=========================================="
echo "Webhook-Details:"
echo "=========================================="
echo "Repository:     $REPO"
echo "URL:            $WEBHOOK_URL"
echo "Events:         push, pull_request, workflow_run, release, deployment"
echo "Secret:         $WEBHOOK_SECRET"
echo ""
echo "⚠️  Webhook-Secret in n8n Credentials speichern!"
echo "   Settings → Credentials → HTTP Header Auth"
echo "   Header: X-Hub-Signature-256"
echo "   Value:  sha256=$WEBHOOK_SECRET"

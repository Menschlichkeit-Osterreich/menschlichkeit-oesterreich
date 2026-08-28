#!/bin/bash
# Webhook für Deployment-Benachrichtigungen einrichten
# Usage: ./webhook-setup.sh [owner/repo] [webhook-url]
#
# ARCHITEKTUR-HINWEIS: Zielplattform für Webhook-Empfang ist Make (make.com).
# n8n ist LEGACY_CANDIDATE – keine neuen Webhooks auf n8n einrichten.
# Webhook-URL als Argument übergeben (kein Default mehr auf Legacy-n8n-Endpunkt).

set -euo pipefail

REPO="${1:-Menschlichkeit-Osterreich/menschlichkeit-oesterreich}"

if [ -z "${2:-}" ]; then
    echo "❌ Fehler: Webhook-URL ist ein Pflichtargument." >&2
    echo "   Usage: ./webhook-setup.sh [owner/repo] <webhook-url>" >&2
    echo "   Zielplattform: Make (make.com) – kein Legacy-n8n-Endpunkt verwenden." >&2
    exit 1
fi
WEBHOOK_URL="$2"

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
echo "⚠️  Webhook-Secret in Make (make.com) Credentials speichern."

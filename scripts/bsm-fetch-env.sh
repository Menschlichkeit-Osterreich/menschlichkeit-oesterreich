#!/usr/bin/env bash
# Bitwarden Secrets Manager → .env Generator
# Ersetzt secrets-decrypt (SOPS-basiert)
#
# Verwendung:
#   bash scripts/bsm-fetch-env.sh --environment development --service all --output .env
#   bash scripts/bsm-fetch-env.sh --environment production --service api --output apps/api/.env

set -euo pipefail

# ── Defaults ────────────────────────────────────────────────

ENVIRONMENT="development"
SERVICE="all"
OUTPUT_FILE=".env"
DRY_RUN=false

# ── Argumente parsen ────────────────────────────────────────

while [[ $# -gt 0 ]]; do
    case "$1" in
        --environment|-e) ENVIRONMENT="$2"; shift 2 ;;
        --service|-s)     SERVICE="$2"; shift 2 ;;
        --output|-o)      OUTPUT_FILE="$2"; shift 2 ;;
        --dry-run)        DRY_RUN=true; shift ;;
        -h|--help)
            echo "Verwendung: $0 [--environment dev|staging|production] [--service api|n8n|openclaw|infra|shared|all] [--output .env] [--dry-run]"
            exit 0
            ;;
        *) echo "[ERROR] Unbekanntes Argument: $1" >&2; exit 1 ;;
    esac
done

# ── Voraussetzungen ─────────────────────────────────────────

if [[ -z "${BSM_ACCESS_TOKEN:-}" ]]; then
    echo "[ERROR] BSM_ACCESS_TOKEN ist nicht gesetzt." >&2
    echo "Setze BSM_ACCESS_TOKEN in deinem Shell-Profil:" >&2
    echo "  export BSM_ACCESS_TOKEN='dein-access-token'" >&2
    exit 1
fi

if ! command -v bws &>/dev/null; then
    echo "[ERROR] bws CLI nicht gefunden." >&2
    echo "Installation: https://github.com/bitwarden/sdk-sm/releases" >&2
    exit 1
fi

if ! command -v jq &>/dev/null; then
    echo "[ERROR] jq nicht gefunden (benoetigt fuer JSON-Verarbeitung)." >&2
    echo "Installation: apt install jq / brew install jq" >&2
    exit 1
fi

# ── Konfiguration ───────────────────────────────────────────

case "$ENVIRONMENT" in
    development) PROJECT_NAME="moe-development" ;;
    staging)     PROJECT_NAME="moe-staging" ;;
    production)  PROJECT_NAME="moe-production" ;;
    *)
        echo "[ERROR] Ungueltige Umgebung: $ENVIRONMENT (development|staging|production)" >&2
        exit 1
        ;;
esac

echo "[INFO] BSM Secrets laden: Projekt=$PROJECT_NAME, Service=$SERVICE"

# ── Projekt-ID ermitteln ────────────────────────────────────

PROJECTS_JSON=$(bws project list --output json 2>&1) || {
    echo "[ERROR] bws project list fehlgeschlagen" >&2
    exit 1
}

PROJECT_ID=$(echo "$PROJECTS_JSON" | jq -r --arg name "$PROJECT_NAME" '.[] | select(.name == $name) | .id')

if [[ -z "$PROJECT_ID" || "$PROJECT_ID" == "null" ]]; then
    echo "[ERROR] BSM-Projekt '$PROJECT_NAME' nicht gefunden." >&2
    echo "Verfuegbare Projekte:" >&2
    echo "$PROJECTS_JSON" | jq -r '.[].name' | sed 's/^/  - /' >&2
    exit 1
fi

echo "[INFO] Projekt gefunden: $PROJECT_NAME (ID: $PROJECT_ID)"

# ── Secrets laden ───────────────────────────────────────────

SECRETS_JSON=$(bws secret list "$PROJECT_ID" --output json 2>&1) || {
    echo "[ERROR] bws secret list fehlgeschlagen" >&2
    exit 1
}

# Nach Service filtern (BSM-Key Format: service/SECRET_NAME)
if [[ "$SERVICE" == "all" ]]; then
    FILTERED_SECRETS="$SECRETS_JSON"
else
    FILTERED_SECRETS=$(echo "$SECRETS_JSON" | jq --arg svc "$SERVICE" \
        '[.[] | select(.key | startswith($svc + "/") or startswith("shared/"))]')
fi

SECRET_COUNT=$(echo "$FILTERED_SECRETS" | jq 'length')

if [[ "$SECRET_COUNT" -eq 0 ]]; then
    echo "[WARN] Keine Secrets fuer Service=$SERVICE in $PROJECT_NAME gefunden."
    exit 0
fi

echo "[INFO] $SECRET_COUNT Secrets geladen."

# ── .env-Datei generieren ───────────────────────────────────

generate_env() {
    echo "# Generiert von bsm-fetch-env.sh"
    echo "# Umgebung: $ENVIRONMENT | Service: $SERVICE"
    echo "# Zeitpunkt: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "# Quelle: Bitwarden Secrets Manager — Projekt $PROJECT_NAME"
    echo "# ACHTUNG: Diese Datei enthaelt Secrets — nie committen!"
    echo ""

    echo "$FILTERED_SECRETS" | jq -r '.[] | "\(.key | sub("^[^/]+/"; ""))=\(.value)"'
}

if [[ "$DRY_RUN" == true ]]; then
    echo ""
    echo "[DRY-RUN] Folgende .env wuerde geschrieben:"
    # Zeige nur Keys, keine Werte
    echo "$FILTERED_SECRETS" | jq -r '.[] | "  \(.key | sub("^[^/]+/"; ""))=***"'
else
    generate_env > "$OUTPUT_FILE"
    echo "[OK] .env geschrieben: $OUTPUT_FILE ($SECRET_COUNT Secrets)"
fi

echo "[INFO] Fertig."

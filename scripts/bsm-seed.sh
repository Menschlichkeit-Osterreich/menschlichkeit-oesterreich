#!/usr/bin/env bash
# Bitwarden Secrets Manager — Einmal-Migration von .env nach BSM
# Liest bestehende .env-Dateien und erstellt BSM-Secrets
#
# Verwendung:
#   bash scripts/bsm-seed.sh --environment development
#   bash scripts/bsm-seed.sh --environment development --dry-run

set -euo pipefail

ENVIRONMENT="development"
DRY_RUN=false
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

while [[ $# -gt 0 ]]; do
    case "$1" in
        --environment|-e) ENVIRONMENT="$2"; shift 2 ;;
        --dry-run)        DRY_RUN=true; shift ;;
        -h|--help)
            echo "Verwendung: $0 [--environment development|staging|production] [--dry-run]"
            exit 0
            ;;
        *) echo "[ERROR] Unbekanntes Argument: $1" >&2; exit 1 ;;
    esac
done

# ── Voraussetzungen ─────────────────────────────────────────

if [[ -z "${BSM_ACCESS_TOKEN:-}" ]]; then
    if [[ -n "${BWS_ACCESS_TOKEN:-}" ]]; then
        export BSM_ACCESS_TOKEN="$BWS_ACCESS_TOKEN"
    elif [[ -n "${BW_ACCESS_TOKEN:-}" ]]; then
        export BSM_ACCESS_TOKEN="$BW_ACCESS_TOKEN"
    fi
fi
if [[ -z "${BSM_ORGANIZATION_ID:-}" ]]; then
    if [[ -n "${BWS_ORGANIZATION_ID:-}" ]]; then
        export BSM_ORGANIZATION_ID="$BWS_ORGANIZATION_ID"
    elif [[ -n "${BW_ORGANIZATION_ID:-}" ]]; then
        export BSM_ORGANIZATION_ID="$BW_ORGANIZATION_ID"
    fi
fi
[[ -z "${BSM_ACCESS_TOKEN:-}" ]] && { echo "[ERROR] BSM_ACCESS_TOKEN nicht gesetzt" >&2; exit 1; }
[[ -z "${BSM_ORGANIZATION_ID:-}" ]] && { echo "[ERROR] BSM_ORGANIZATION_ID nicht gesetzt" >&2; exit 1; }
command -v bws &>/dev/null || { echo "[ERROR] bws CLI nicht gefunden" >&2; exit 1; }
command -v jq &>/dev/null || { echo "[ERROR] jq nicht gefunden" >&2; exit 1; }

# ── Konfiguration ───────────────────────────────────────────

case "$ENVIRONMENT" in
    development) PROJECT_NAME="moe-development" ;;
    staging)     PROJECT_NAME="moe-staging" ;;
    production)  PROJECT_NAME="moe-production" ;;
    *) echo "[ERROR] Ungueltige Umgebung: $ENVIRONMENT" >&2; exit 1 ;;
esac

echo "[INFO] BSM Seed: Umgebung=$ENVIRONMENT, Projekt=$PROJECT_NAME"

# ── Projekt-ID ermitteln ────────────────────────────────────

PROJECT_ID=$(bws project list --output json | jq -r --arg n "$PROJECT_NAME" '.[] | select(.name==$n) | .id')

if [[ -z "$PROJECT_ID" || "$PROJECT_ID" == "null" ]]; then
    echo "[ERROR] BSM-Projekt '$PROJECT_NAME' nicht gefunden" >&2
    exit 1
fi

echo "[INFO] Projekt: $PROJECT_NAME (ID: $PROJECT_ID)"

# ── Manifest laden ──────────────────────────────────────────

MANIFEST="$PROJECT_ROOT/secrets.manifest.json"
if [[ ! -f "$MANIFEST" ]]; then
    echo "[ERROR] secrets.manifest.json nicht gefunden" >&2
    exit 1
fi

echo "[INFO] Manifest geladen: $(jq '.secrets | length' "$MANIFEST") Secret-Definitionen"

# ── Hilfsfunktion: BSM-Key bestimmen ────────────────────────

get_bsm_key() {
    local env_var="$1"
    local prefix="$2"

    # Zuerst im Manifest nachschauen
    local manifest_key
    manifest_key=$(jq -r --arg v "$env_var" '.secrets[] | select(.env_var==$v) | .bsm_key' "$MANIFEST")
    if [[ -n "$manifest_key" && "$manifest_key" != "null" ]]; then
        echo "$manifest_key"
        return
    fi

    # Prefix-basiertes Mapping
    if [[ -n "$prefix" ]]; then
        echo "${prefix}/${env_var}"
        return
    fi

    # Root .env: Heuristik
    case "$env_var" in
        OC_*)    echo "openclaw/${env_var}" ;;
        GH_*|GPG_*) echo "shared/${env_var}" ;;
        SSH_*|PLESK_*) echo "infra/${env_var}" ;;
        *)       echo "shared/${env_var}" ;;
    esac
}

# ── .env-Dateien verarbeiten ────────────────────────────────

CREATED=0
SKIPPED=0
ERRORS=0

process_env_file() {
    local env_file="$1"
    local prefix="$2"
    local full_path="$PROJECT_ROOT/$env_file"

    if [[ ! -f "$full_path" ]]; then
        echo "[SKIP] Datei nicht gefunden: $env_file"
        return
    fi

    echo ""
    echo "[INFO] Lese: $env_file"

    while IFS= read -r line || [[ -n "$line" ]]; do
        line=$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

        # Kommentare und leere Zeilen
        [[ -z "$line" || "$line" == \#* ]] && continue

        # KEY=VALUE parsen
        if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
            local env_var="${BASH_REMATCH[1]}"
            local env_value="${BASH_REMATCH[2]}"

            # Placeholder ueberspringen
            if [[ "$env_value" =~ ^(CHANGE_ME|PLACEHOLDER|([ps]k)_(test|live)_PLACEHOLDER|whsec_PLACEHOLDER|PAYPAL_CLIENT_ID_PLACEHOLDER) ]]; then
                echo "  [SKIP] $env_var (Placeholder)"
                ((SKIPPED++)) || true
                continue
            fi

            # Leere Werte
            if [[ -z "$env_value" ]]; then
                echo "  [SKIP] $env_var (leer)"
                ((SKIPPED++)) || true
                continue
            fi

            local bsm_key
            bsm_key=$(get_bsm_key "$env_var" "$prefix")

            if [[ "$DRY_RUN" == true ]]; then
                echo "  [DRY-RUN] Wuerde erstellen: $bsm_key"
                ((CREATED++)) || true
            else
                if bws secret create "$bsm_key" "$env_value" --project-id "$PROJECT_ID" --output json &>/dev/null; then
                    echo "  [OK] $bsm_key"
                    ((CREATED++)) || true
                else
                    echo "  [WARN] $bsm_key — existiert bereits oder Fehler"
                    ((SKIPPED++)) || true
                fi
            fi
        fi
    done < "$full_path"
}

process_env_file ".env" ""
process_env_file "apps/api/.env" "api"
process_env_file "apps/website/.env.local" "website"
process_env_file "automation/n8n/.env" "n8n"
process_env_file "automation/openclaw/config/.env" "openclaw"

# ── Zusammenfassung ─────────────────────────────────────────

echo ""
echo "=== Zusammenfassung ==="
echo "  Erstellt:      $CREATED"
echo "  Uebersprungen: $SKIPPED"
echo "  Fehler:        $ERRORS"

if [[ "$DRY_RUN" == true ]]; then
    echo ""
    echo "[DRY-RUN] Keine Aenderungen. Ohne --dry-run ausfuehren."
else
    echo ""
    echo "[INFO] Seed abgeschlossen. Verifiziere mit:"
    echo "  bws secret list $PROJECT_ID --output json | jq '.[].key'"
fi

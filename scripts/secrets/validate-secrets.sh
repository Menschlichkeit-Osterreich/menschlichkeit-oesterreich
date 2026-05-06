#!/usr/bin/env bash
set -euo pipefail
MANIFEST="${1:-secrets.manifest.json}"
REQ_PAT="${REQ_PAT:-}"
REPO=$(jq -r '.repository' "$MANIFEST")
ORG=$(jq -r '.organization // empty' "$MANIFEST")
req(){ command -v "$1" >/dev/null || { echo "Fehlt: $1"; exit 1; }; }
req gh; req jq
if [[ -n "${REQ_PAT:-}" ]]; then
  export GH_TOKEN="$REQ_PAT"
  API_CHECKS=1
else
  API_CHECKS=0
  echo "⚠️  API-Check übersprungen (kein ADMIN_PAT gesetzt)."
fi
missing=0
check_scope() {
  local scope="$1" name="$2"
  case "$scope" in
    repo) gh secret list -R "$REPO" --visibility all | grep -q "^$name " || { echo "❌ fehlt (repo): $name"; missing=1; } ;;
    org)  [[ -n "$ORG" ]] || { echo "ORG nicht gesetzt"; exit 1; }; gh secret list -o "$ORG" | grep -q "^$name " || { echo "❌ fehlt (org): $name"; missing=1; } ;;
    env:*) envn="${scope#env:}"; gh secret list -R "$REPO" -e "$envn" | grep -q "^$name " || { echo "❌ fehlt (env:$envn): $name"; missing=1; } ;;
  esac
}
while IFS= read -r s; do
  name=$(jq -r '.name' <<<"$s")
  while IFS= read -r sc; do
    if [[ "$API_CHECKS" -eq 1 ]]; then
      check_scope "$sc" "$name" || true
    fi
  done < <(jq -r '.scopes[]' <<<"$s")
done < <(jq -c '.secrets[]' "$MANIFEST")
defined=$(jq -r '.secrets[].name' "$MANIFEST" | sort -u)
for n in $defined; do
  if ! grep -RIsq "\${{\s*secrets\.${n}\s*}}" .github/workflows; then
    echo "⚠️  Nicht referenziert in Workflows: $n"
  fi
done
if grep -RIsnE 'run:.*(echo|printenv).*\${{\s*secrets\.' .github/workflows; then
  echo "⚠️  Verdächtige Log-Ausgabe gefunden (bitte prüfen/entfernen)."
fi
if [[ $missing -ne 0 ]]; then echo "❌ Secret-Validierung: FEHLER"; exit 1; else echo "✅ Secret-Validierung: OK"; fi

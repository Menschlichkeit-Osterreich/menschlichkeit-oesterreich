#!/usr/bin/env bash
set -euo pipefail
MANIFEST="${1:-secrets.manifest.json}"
req(){ command -v "$1" >/dev/null 2>&1 || { echo "Fehlt: $1"; exit 1; }; }
req gh; req jq
REPO=$(jq -r '.repository' "$MANIFEST")
ORG=$(jq -r '.organization // empty' "$MANIFEST")
[[ -n "$REPO" ]] || { echo "repository fehlt im Manifest"; exit 1; }
if jq -e '.environments' "$MANIFEST" >/dev/null; then
  scripts/secrets/configure-environments.sh "$MANIFEST"
fi
get_value() {
  local name="$1" sourceType="$2" key="$3"
  case "$sourceType" in
    file) [[ -f "$key" ]] || { echo "Datei nicht gefunden: $key"; exit 1; }; cat "$key" ;;
    env)  val="${!key-}"; [[ -n "${val:-}" ]] || { echo "ENV fehlt: $key"; exit 1; }; printf "%s" "$val" ;;
    prompt) read -r -s -p "Wert für $name eingeben: " val; echo >&2; [[ -n "$val" ]] || { echo "Kein Wert für $name"; exit 1; }; printf "%s" "$val" ;;
    *) echo "Unbekannte source type: $sourceType"; exit 1;;
  esac
}
while IFS= read -r s; do
  NAME=$(jq -r '.name' <<<"$s")
  SRC_TYPE=$(jq -r '.source.type' <<<"$s")
  SRC_KEY=$(jq -r '.source.path // .source.key // empty' <<<"$s")
  VALUE="$(get_value "$NAME" "$SRC_TYPE" "$SRC_KEY")"
  while IFS= read -r scope; do
    case "$scope" in
      repo)
        echo "🔐 Setze Repo-Secret $NAME @ $REPO";
        gh secret set "$NAME" -R "$REPO" -b"$VALUE"
        ;;
      org)
        [[ -n "$ORG" ]] || { echo "ORG fehlt für $NAME"; exit 1; }
        VIS=$(jq -r '.org_visibility // "private"' <<<"$s")
        CMD=(gh secret set "$NAME" -o "$ORG" -b"$VALUE" --visibility "$VIS")
        if [[ "$VIS" == "selected" ]]; then
          SEL=$(jq -r '.org_selected_repos | join(",")' <<<"$s")
          [[ -n "$SEL" ]] || { echo "org_selected_repos fehlt für $NAME"; exit 1; }
          CMD+=(--repos "$SEL")
        fi
        echo "🏢 Setze Org-Secret $NAME @ $ORG (vis=$VIS)"; "${CMD[@]}"
        ;;
      env:*)
        ENV="${scope#env:}"
        echo "🌱 Setze Env-Secret $NAME @ $REPO [$ENV]"
        gh secret set "$NAME" -R "$REPO" -e "$ENV" -b"$VALUE"
        ;;
      *)
        echo "Unbekannter Scope: $scope"; exit 1
        ;;
    esac
  done < <(jq -r '.scopes[]' <<<"$s")
  unset VALUE
done < <(jq -c '.secrets[]' "$MANIFEST")
{
  echo "## Verwendete GitHub Secrets"
  echo
  echo "Folgende Secrets wurden für dieses Repository (und ggf. Organisation/Environments) gesetzt:"
  echo
  jq -r '.secrets[] | "- \(.name)  —  Scopes: \(.scopes | join(", "))"' "$MANIFEST"
  echo
  echo "Hinweis: Werte sind verschlüsselt gespeichert und werden in Workflows als \`secrets.NAME\` referenziert."
} > SETUP.md
echo "✅ Fertig."

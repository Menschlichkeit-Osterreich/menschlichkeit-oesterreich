#!/usr/bin/env bash
# =============================================================================
# Drupal/CiviCRM Test-Benutzer anlegen
#
# Ausführen (aus dem Drupal-Webroot oder via Plesk SSH-Terminal):
#   cd /var/www/vhosts/menschlichkeit-oesterreich.at/subdomains/crm/httpdocs
#   bash scripts/seed-drupal-users.sh
#
# Oder via GitHub Actions / Deploy:
#   ssh plesk-prod "cd subdomains/crm/httpdocs && bash scripts/seed-drupal-users.sh"
#
# WARNUNG: Nur für Test/Staging! In Produktion Passwörter sofort ändern.
# =============================================================================

set -euo pipefail

DRUSH="vendor/bin/drush"
BASE_URL="${DRUPAL_BASE_URL:-https://crm.menschlichkeit-oesterreich.at}"

if [[ ! -f "$DRUSH" ]]; then
  echo "FEHLER: $DRUSH nicht gefunden. Bitte erst: composer install"
  exit 1
fi

echo "=== Drupal/CiviCRM Test-Benutzer anlegen ==="
echo "Site: $BASE_URL"
echo ""

# Hilfsfunktion: User anlegen oder Passwort zurücksetzen
create_or_update_user() {
  local name="$1"
  local email="$2"
  local password="$3"
  local roles="${4:-}"    # kommagetrennt, optional

  # Benutzer existiert?
  if $DRUSH user:information "$name" &>/dev/null; then
    echo "  ↺ Aktualisiere $name ($email)..."
    $DRUSH user:password "$name" "$password"
    $DRUSH user:unblock "$name"
  else
    echo "  + Erstelle $name ($email)..."
    $DRUSH user:create "$name" \
      --mail="$email" \
      --password="$password"
  fi

  # Rollen zuweisen
  if [[ -n "$roles" ]]; then
    IFS=',' read -ra ROLE_LIST <<< "$roles"
    for role in "${ROLE_LIST[@]}"; do
      $DRUSH user:role:add "$role" "$name" 2>/dev/null || true
    done
  fi

  echo "  ✓ $name | $email | Passwort: $password | Rollen: ${roles:-authenticated}"
}

# ── Drupal-Rollen sicherstellen ───────────────────────────────────────────────
echo "--- Rollen prüfen ---"
for role in administrator board treasurer event_manager moderator content_editor; do
  $DRUSH role:create "$role" 2>/dev/null || true
done
echo ""

# ── Admin-Passwort zurücksetzen ───────────────────────────────────────────────
echo "--- Administrator ---"
$DRUSH user:password admin "Admin#Test2024!" 2>/dev/null || true
echo "  ✓ admin | admin | Passwort: Admin#Test2024!"
echo ""

# ── Test-Benutzer anlegen ─────────────────────────────────────────────────────
echo "--- Test-Benutzer ---"
create_or_update_user \
  "vorstand_test" \
  "vorstand@test.menschlichkeit-oesterreich.at" \
  "Vorstand#Test2024!" \
  "board"

create_or_update_user \
  "kassier_test" \
  "kassier@test.menschlichkeit-oesterreich.at" \
  "Kassier#Test2024!" \
  "treasurer"

create_or_update_user \
  "veranstaltung_test" \
  "event@test.menschlichkeit-oesterreich.at" \
  "Event#Test2024!" \
  "event_manager"

create_or_update_user \
  "moderator_test" \
  "moderator@test.menschlichkeit-oesterreich.at" \
  "Moderator#Test2024!" \
  "moderator"

create_or_update_user \
  "redakteur_test" \
  "redakteur@test.menschlichkeit-oesterreich.at" \
  "Redakteur#Test2024!" \
  "content_editor"

create_or_update_user \
  "mitglied_test" \
  "mitglied@test.menschlichkeit-oesterreich.at" \
  "Mitglied#Test2024!"   # nur 'authenticated'

echo ""

# ── CiviCRM: Kontakte anlegen ────────────────────────────────────────────────
echo "--- CiviCRM Kontakte (falls installiert) ---"
$DRUSH eval "
if (\\Drupal::moduleHandler()->moduleExists('civicrm')) {
  \\Drupal::service('civicrm')->initialize();
  \\\$contacts = [
    ['first_name'=>'Vorstand', 'last_name'=>'Test', 'email'=>'vorstand@test.menschlichkeit-oesterreich.at', 'membership_type'=>'Vorstand'],
    ['first_name'=>'Mitglied', 'last_name'=>'Test', 'email'=>'mitglied@test.menschlichkeit-oesterreich.at', 'membership_type'=>'Förderer'],
  ];
  foreach (\\\$contacts as \\\$c) {
    \\\$result = civicrm_api3('Contact', 'get', ['email'=>\\\$c['email']]);
    if (\\\$result['count'] == 0) {
      civicrm_api3('Contact', 'create', ['contact_type'=>'Individual', 'first_name'=>\\\$c['first_name'], 'last_name'=>\\\$c['last_name']]);
      echo '  + CiviCRM Kontakt: '.\\\$c['first_name'].' '.\\\$c['last_name'].\"\n\";
    }
  }
  echo 'CiviCRM Kontakte OK'.PHP_EOL;
} else {
  echo 'CiviCRM nicht aktiv – überspringe'.PHP_EOL;
}
" 2>/dev/null || echo "  ⚠️  CiviCRM-Initialisierung übersprungen."

# ── Cache leeren ─────────────────────────────────────────────────────────────
echo ""
echo "--- Cache leeren ---"
$DRUSH cr
echo "✓ Fertig."
echo ""
echo "=== Zugangsdaten-Zusammenfassung ==="
echo ""
printf "%-25s %-50s %-22s %-15s\n" "Benutzername" "E-Mail" "Passwort" "Rolle"
echo "$(printf '%0.s-' {1..115})"
printf "%-25s %-50s %-22s %-15s\n" "admin"           "admin"                                         "Admin#Test2024!"      "administrator"
printf "%-25s %-50s %-22s %-15s\n" "vorstand_test"   "vorstand@test.menschlichkeit-oesterreich.at"   "Vorstand#Test2024!"   "board"
printf "%-25s %-50s %-22s %-15s\n" "kassier_test"    "kassier@test.menschlichkeit-oesterreich.at"    "Kassier#Test2024!"    "treasurer"
printf "%-25s %-50s %-22s %-15s\n" "veranstaltung_test" "event@test.menschlichkeit-oesterreich.at"  "Event#Test2024!"      "event_manager"
printf "%-25s %-50s %-22s %-15s\n" "moderator_test"  "moderator@test.menschlichkeit-oesterreich.at"  "Moderator#Test2024!"  "moderator"
printf "%-25s %-50s %-22s %-15s\n" "redakteur_test"  "redakteur@test.menschlichkeit-oesterreich.at"  "Redakteur#Test2024!"  "content_editor"
printf "%-25s %-50s %-22s %-15s\n" "mitglied_test"   "mitglied@test.menschlichkeit-oesterreich.at"   "Mitglied#Test2024!"   "authenticated"
echo ""

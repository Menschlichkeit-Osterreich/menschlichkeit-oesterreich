#!/usr/bin/env bash
# Create GitHub issues for specs 006 (Forum) and 007 (CRM Auslagerung)
# and attach them to project #2 of Menschlichkeit-Osterreich.
set -euo pipefail

REPO="Menschlichkeit-Osterreich/menschlichkeit-oesterreich"
OWNER="Menschlichkeit-Osterreich"
PROJECT_NUMBER=2

# --- Ensure missing labels exist (best effort, ignore errors if already present)
ensure_label() {
  local name="$1" color="$2" desc="$3"
  gh label create "$name" --repo "$REPO" --color "$color" --description "$desc" 2>/dev/null || true
}

ensure_label "spec/forum-eigenbau" "5319e7" "Feature 006 - Forum Eigenbau & Moderation"
ensure_label "spec/crm-auslagerung" "0e8a16" "Feature 007 - CRM Drupal+CiviCRM Auslagerung aus Plesk"
ensure_label "epic" "B60205" "Epic / Phasenbuendel"
ensure_label "wave/D-cutover" "1f6feb" "Wave D - Cutover/Rollout" 2>/dev/null || true

# --- Helper to create an issue and add it to project #2
create_issue() {
  local title="$1"; shift
  local body_file="$1"; shift
  local labels="$1"; shift

  local url
  url=$(gh issue create --repo "$REPO" --title "$title" --body-file "$body_file" --label "$labels")
  echo "Created: $url"
  gh project item-add "$PROJECT_NUMBER" --owner "$OWNER" --url "$url" >/dev/null
  echo "  Added to project #$PROJECT_NUMBER"
}

# --- Issues for spec 006 (Forum)
FORUM_DIR="$(mktemp -d)"

cat > "$FORUM_DIR/p1.md" <<'EOF'
**Spec**: `specs/006-forum-eigenbau-moderation/`
**Phase 1**: Setup Shared Infrastructure

Tasks:
- [ ] T001 Verzeichnis `apps/api/app/forum/` + Router-Mount in `apps/api/app/main.py` (`/api/v1/forum`)
- [ ] T002 Frontend-Modul `apps/website/src/features/forum/` mit Index-Barrel und Route-Registrierung
- [ ] T003 Doku-Geruest `docs/forum/` (README, operations.md, community-rules.md, api.md)

Akzeptanzkriterium: Scaffolding fuer API, Website und Doku steht.
EOF

cat > "$FORUM_DIR/p2.md" <<'EOF'
**Spec**: `specs/006-forum-eigenbau-moderation/`
**Phase 2**: Foundational (Modelle, Migrationen, Sanitization, Rate-Limit)

Tasks:
- [ ] T010 SQLAlchemy-Modelle Category, Thread, Post, Tag (`apps/api/app/forum/models.py`)
- [ ] T011 SQLAlchemy-Modelle Report, AuditLog, Subscription, Notification
- [ ] T012 Alembic-Migration `forum_baseline`
- [ ] T013 Alembic-Migration `forum_audit_reports`
- [ ] T014 Alembic-Migration `forum_subscriptions_notifications`
- [ ] T020 Markdown-Sanitizer (markdown-it-py + bleach)
- [ ] T021 Rate-Limit-Middleware
- [ ] T022 CSRF-/Auth-Integration ueber bestehendes RBAC
- [ ] T023 Pydantic-DTOs fuer alle Entitaeten

Akzeptanzkriterium: Persistente Basis, Sanitization, Rate-Limit verfuegbar.
EOF

cat > "$FORUM_DIR/p3.md" <<'EOF'
**Spec**: `specs/006-forum-eigenbau-moderation/`
**Phase 3 / US1**: Beitragen und Diskutieren (P1)

Tasks:
- [ ] T030 Service CRUD + SoftDelete Threads/Posts
- [ ] T031 Router-Endpunkte `/categories`, `/threads`, `/posts`
- [ ] T032 Paginierung, stabile Sortierung, Edge-Case-Tests
- [ ] T033 Pytest-Tests `apps/api/tests/forum/test_threads_posts.py`
- [ ] T034 Frontend `ForumOverviewPage` / `ForumCategoryPage`
- [ ] T035 Frontend `ForumThreadPage` mit Markdown-Rendering (sanitiziert)
- [ ] T036 `MarkdownEditor.tsx` (Vorschau, Tastenkuerzel, a11y)
- [ ] T037 Vitest-Tests Komponenten/Hooks

Akzeptanzkriterium: Vollstaendiger Lese-/Schreib-Flow fuer Mitglieder.
EOF

cat > "$FORUM_DIR/p4.md" <<'EOF'
**Spec**: `specs/006-forum-eigenbau-moderation/`
**Phase 4 / US2**: Moderieren und Melden (P1)

Tasks:
- [ ] T040 Endpunkte `/reports` (POST/GET/PATCH)
- [ ] T041 Endpunkte Lock/Pin/Move + Soft-Delete mit Audit
- [ ] T042 Audit-Logger (jede Moderationsaktion -> AuditLog)
- [ ] T043 Pytest-Tests Moderationsflows + Audit
- [ ] T044 Frontend `ReportDialog.tsx`
- [ ] T045 Frontend `ModerationQueue.tsx` + `ForumModerationPage.tsx`
- [ ] T046 RBAC-Gate im Frontend (nur Moderator/Admin)

Akzeptanzkriterium: Moderation produktionsfaehig, Audit vollstaendig.
EOF

cat > "$FORUM_DIR/p5.md" <<'EOF'
**Spec**: `specs/006-forum-eigenbau-moderation/`
**Phase 5 / US3**: Barrierefrei nutzen (P1)

Tasks:
- [ ] T050 A11y-Pass aller Forum-Komponenten
- [ ] T051 Tastatur-Bedienung (Editor, Dialoge, Modale, Skip-Links)
- [ ] T052 Kontrast-Pruefung gegen Brand-Tokens
- [ ] T053 axe-Tests in Vitest + Playwright a11y
- [ ] T054 Lighthouse-CI-Konfiguration in `lighthouse.config.cjs`

Akzeptanzkriterium: WCAG 2.1 AA, Lighthouse a11y >= 95.
EOF

cat > "$FORUM_DIR/p6.md" <<'EOF'
**Spec**: `specs/006-forum-eigenbau-moderation/`
**Phase 6 / US4**: Suchen und Navigieren (P2)

Tasks:
- [ ] T060 Migration `forum_tsvector_search` (GIN-Index)
- [ ] T061 Trigger/Listener fuer tsvector
- [ ] T062 Endpunkt `GET /forum/search` mit `ts_rank_cd`
- [ ] T063 Frontend `ForumSearchPage.tsx`
- [ ] T064 Tag-CRUD + M:N Thread<->Tag
- [ ] T065 Performance-Test < 500 ms p95 bei 50k Posts

Akzeptanzkriterium: Volltextsuche und Filter live.
EOF

cat > "$FORUM_DIR/p7.md" <<'EOF'
**Spec**: `specs/006-forum-eigenbau-moderation/`
**Phase 7 / US5**: Benachrichtigt werden (P2)

Tasks:
- [ ] T070 Endpunkte `/subscriptions` (Thread/Category, E-Mail Opt-in)
- [ ] T071 Notification-Dispatcher (In-App)
- [ ] T072 E-Mail-Versand (instant/digest/off)
- [ ] T073 Unsubscribe-Token-Endpunkt
- [ ] T074 Frontend `NotificationBell.tsx`
- [ ] T075 Tests Dispatcher, Frequenz, Unsubscribe

Akzeptanzkriterium: Notifications und Abos in Betrieb.
EOF

cat > "$FORUM_DIR/p8.md" <<'EOF'
**Spec**: `specs/006-forum-eigenbau-moderation/`
**Phase 8 / US6**: DSGVO Export und Loeschen (P2)

Tasks:
- [ ] T080 Endpunkt `/forum/dsgvo/export` (JSON/CSV)
- [ ] T081 Endpunkt `/forum/dsgvo/delete` (Anonymisierung)
- [ ] T082 Audit-Eintrag pro DSGVO-Aktion, Retention dokumentiert
- [ ] T083 Frontend `ForumProfilePage.tsx` mit Export/Delete-Aktionen
- [ ] T084 Tests Export-Inhalt + Anonymisierungs-Effekt

Akzeptanzkriterium: DSGVO-Rechte abbildbar.
EOF

cat > "$FORUM_DIR/p9.md" <<'EOF'
**Spec**: `specs/006-forum-eigenbau-moderation/`
**Phase 9**: Hardening, Deployment, Doku

Tasks:
- [ ] T090 OWASP-ASVS L1 Mini-Audit + Fixes
- [ ] T091 Monitoring/Logging (Prometheus Counter)
- [ ] T092 Community-Regeln finalisieren + Accept-Flow
- [ ] T093 Runbook `docs/forum/operations.md`
- [ ] T094 CI: Forum in `npm run quality:gates`, Coverage-Ziele
- [ ] T095 Security-Review-Sign-off (security-reviewer.agent)

Akzeptanzkriterium: Forum produktionsreif, Governance erfuellt.
EOF

create_issue "[Forum] Phase 1 - Setup Shared Infrastructure"           "$FORUM_DIR/p1.md" "spec/forum-eigenbau,service/forum,area/api,wave/A-foundation,P1,effort/S,epic"
create_issue "[Forum] Phase 2 - Foundational (Modelle, Migrationen, Sanitization)" "$FORUM_DIR/p2.md" "spec/forum-eigenbau,service/forum,area/api,wave/A-foundation,P1,effort/L,security,epic"
create_issue "[Forum] Phase 3 / US1 - Beitragen und Diskutieren"       "$FORUM_DIR/p3.md" "spec/forum-eigenbau,service/forum,area/api,area/screens-frontend,wave/B-feature-core,P1,effort/L,feature,epic"
create_issue "[Forum] Phase 4 / US2 - Moderieren und Melden"           "$FORUM_DIR/p4.md" "spec/forum-eigenbau,service/forum,area/api,area/screens-frontend,wave/B-feature-core,P1,effort/L,feature,epic"
create_issue "[Forum] Phase 5 / US3 - Barrierefreiheit (WCAG AA)"      "$FORUM_DIR/p5.md" "spec/forum-eigenbau,service/forum,area/screens-frontend,wave/C-stabilization,P1,effort/M,qa,epic"
create_issue "[Forum] Phase 6 / US4 - Suche und Navigation"            "$FORUM_DIR/p6.md" "spec/forum-eigenbau,service/forum,area/api,wave/B-feature-core,P2,effort/M,feature,epic"
create_issue "[Forum] Phase 7 / US5 - Notifications und Abos"          "$FORUM_DIR/p7.md" "spec/forum-eigenbau,service/forum,area/api,area/screens-frontend,wave/B-feature-core,P2,effort/M,feature,epic"
create_issue "[Forum] Phase 8 / US6 - DSGVO Export und Loeschen"       "$FORUM_DIR/p8.md" "spec/forum-eigenbau,service/forum,area/api,dsgvo,wave/C-stabilization,P2,effort/M,compliance,epic"
create_issue "[Forum] Phase 9 - Hardening, Deployment, Doku"           "$FORUM_DIR/p9.md" "spec/forum-eigenbau,service/forum,wave/C-stabilization,P1,effort/M,security,docs,epic"

# --- Issues for spec 007 (CRM Auslagerung)
CRM_DIR="$(mktemp -d)"

cat > "$CRM_DIR/p0.md" <<'EOF'
**Spec**: `specs/007-crm-drupal-civicrm-auslagerung/`
**Phase 0**: Voraussetzungen, Owner, Datenschutz, Secrets

Tasks:
- [ ] T001 Owner benennen (Infra/CRM/CiviCRM/DB/DNS/Backup/Datenschutz) -> `docs/crm/inventory.md`
- [ ] T002 AVV-Register `docs/crm/dsgvo-avv.md`
- [ ] T003 Secret-Strategie + Mapping-Entwurf `specs/007-.../contracts/secret-mapping.md`
- [ ] T004 DNS-Matrix `docs/crm/dns-matrix.md`
- [ ] T005 Budget/Kostenrahmen freigegeben

Gate: Owner, AVV-Entwurf, Secret-Strategie, DNS-Matrix, Budget vorhanden.
EOF

cat > "$CRM_DIR/p1.md" <<'EOF'
**Spec**: `specs/007-crm-drupal-civicrm-auslagerung/`
**Phase 1**: Azure Foundation

Tasks:
- [ ] T010 Resource Group `moe-prod` inkl. Tags
- [ ] T011 Key Vault / Secret-Store + Zugriffsregeln
- [ ] T012 Log Analytics + Application Insights
- [ ] T013 Blob Storage fuer Backups (Lifecycle/Retention)
- [ ] T014 Netzwerk/Firewall-Regeln (kein offener SSH)

Gate: Foundation aktiv, Kostenalarme aktiv.
EOF

cat > "$CRM_DIR/p2.md" <<'EOF'
**Spec**: `specs/007-crm-drupal-civicrm-auslagerung/`
**Phase 2 / US1**: Inventar erfassen (P1)

Tasks:
- [ ] T020 Drupal Core/Module/Themes
- [ ] T021 CiviCRM-Version + Extensions
- [ ] T022 Cronjobs (Drupal, CiviCRM Scheduled, Mailing, Cleanup)
- [ ] T023 DB-Inventar (Schemas, Encoding/Collation, Groessen)
- [ ] T024 File-Inventar (public/private/custom/uploads/generated + Pruefsummen)
- [ ] T025 SMTP/Mailrouting (SPF/DKIM/DMARC)
- [ ] T026 Rollen/Rechte/Admin-Konten
- [ ] T027 API/AuthX/Webhook-Nutzung

Gate: Inventar vollstaendig, reviewed, versioniert.
EOF

cat > "$CRM_DIR/p3.md" <<'EOF'
**Spec**: `specs/007-crm-drupal-civicrm-auslagerung/`
**Phase 3 / US1**: Staging-VM und PoC (P1)

Tasks:
- [ ] T030 VM provisionieren (Ubuntu LTS) - `provision-vm.sh`
- [ ] T031 PHP-FPM + Extensions - `install-php-extensions.sh`
- [ ] T032 Composer + Drush (+cv optional)
- [ ] T033 Nginx + TLS fuer `staging-crm.*`
- [ ] T034 Ziel-DB (managed bevorzugt)
- [ ] T035 DB-Dump aus Plesk + Import (Encoding/Collation erzwingen)
- [ ] T036 File-Sync via `rsync-files.sh` + Pruefsummen-Manifest
- [ ] T037 `settings.php` / `civicrm.settings.php` anpassen, private files verifizieren
- [ ] T038 Mail-Sink aktivieren
- [ ] T039 Cron auf Staging kontrolliert (Mailing aus)

Gate: Drupal bootet, CiviCRM Status sauber, Login funktioniert, keine externen Mails.
EOF

cat > "$CRM_DIR/p4.md" <<'EOF'
**Spec**: `specs/007-crm-drupal-civicrm-auslagerung/`
**Phase 4 / US2**: Datenkonsistenz und API (P1)

Tasks:
- [ ] T040 Stichproben-Definition `docs/crm/data-consistency.md`
- [ ] T041 Vergleichsskript Plesk vs. Staging
- [ ] T042 CiviCRM API/AuthX Smoke-Test (Read+Write Testkontext)
- [ ] T043 Webform-/Spenden-Flow gegen Testdaten
- [ ] T044 Konsistenz-Report mit fachlicher Abnahme

Gate: Konsistenz-Report ohne kritische Abweichungen.
EOF

cat > "$CRM_DIR/p5.md" <<'EOF'
**Spec**: `specs/007-crm-drupal-civicrm-auslagerung/`
**Phase 5 / US4**: Backup, Monitoring, Hardening (P2)

Tasks:
- [ ] T050 Backup-Strategie `docs/crm/backup-restore.md`
- [ ] T051 Backup-Job (DB+Files+Config) automatisieren -> Blob
- [ ] T052 Restore-Test erfolgreich
- [ ] T053 Monitoring `docs/crm/monitoring-alerts.md`
- [ ] T054 Alerts an Eskalationspfad
- [ ] T055 Admin-Hardening (SSH-Keys only, MFA, Nginx-Hardening)
- [ ] T056 Secrets-Refresh-Prozedur

Gate: Restore-Test bestanden, Alerts feuern, Hardening review.
EOF

cat > "$CRM_DIR/p6.md" <<'EOF'
**Spec**: `specs/007-crm-drupal-civicrm-auslagerung/`
**Phase 6 / US3**: Cutover-Vorbereitung und Dry-Run (P1)

Tasks:
- [ ] T060 Cutover-Runbook `docs/crm/cutover-runbook.md`
- [ ] T061 Wartungsfenster planen+kommunizieren
- [ ] T062 DNS-TTL fuer `crm.*` reduzieren
- [ ] T063 `cutover-freeze.sh` + `cutover-finalize.sh` fertigstellen
- [ ] T064 `rollback-dns.sh` testen
- [ ] T065 Dry-Run kompletter Ablauf inkl. Rollback

Gate: Dry-Run erfolgreich, Owner-Freigabe.
EOF

cat > "$CRM_DIR/p7.md" <<'EOF'
**Spec**: `specs/007-crm-drupal-civicrm-auslagerung/`
**Phase 7 / US3**: Cutover und Verifikation (P1)

Tasks:
- [ ] T070 Plesk-CRM in Wartungsmodus/Schreibschutz
- [ ] T071 Finaler DB-Dump + File-Sync
- [ ] T072 Import/Restore + drush cache rebuild + updb + CiviCRM cache clear
- [ ] T073 Cron auf Ziel aktivieren, Mailing produktiv
- [ ] T074 DNS umstellen + TLS verifizieren
- [ ] T075 Smoke-Test (Login, Kontakt, Spende, API-Ping, Cron manuell, Webform, Mail intern)
- [ ] T076 Monitoring aktiv, Plesk-vHost lesend halten

Gate: Smoke-Test bestanden, keine Dateninkonsistenz, Stabilitaetsfenster gestartet.
EOF

cat > "$CRM_DIR/p8.md" <<'EOF'
**Spec**: `specs/007-crm-drupal-civicrm-auslagerung/`
**Phase 8 / US5**: DSGVO Abschluss + Plesk-Reduktion (P2)

Tasks:
- [ ] T080 AVV final
- [ ] T081 Zugriffsmatrix vs. Admin-Konten
- [ ] T082 Audit-Logging fuer Admin-Aktionen
- [ ] T083 `docs/crm/plesk-reduction.md` + Stilllegungs-Plan
- [ ] T084 Plesk-CRM-vHost nach Stabilitaetsfenster abschalten
- [ ] T085 Alte Plesk-API/Frontend-Reste entfernen
- [ ] T086 DNS-Matrix final

Gate: AVV abgeschlossen, Plesk-Kernabhaengigkeit beseitigt.
EOF

cat > "$CRM_DIR/qg.md" <<'EOF'
**Spec**: `specs/007-crm-drupal-civicrm-auslagerung/`
**Querschnitt / Governance**

Tasks:
- [ ] T090 Konsistenz mit `specs/002-infrastruktur-donation-masterplan/` pruefen
- [ ] T091 Sicherstellen: n8n-Donation-Gates bleiben unveraendert
- [ ] T092 `npm run governance:check` + `npm run workspace:config:check` gruen
- [ ] T093 Security-Review + DSGVO-Owner-Sign-off

Gate: Governance erfuellt, keine Drift.
EOF

create_issue "[CRM] Phase 0 - Voraussetzungen, Owner, Datenschutz, Secrets" "$CRM_DIR/p0.md" "spec/crm-auslagerung,service/crm,area/crm,area/infrastructure,wave/A-foundation,P1,effort/S,dsgvo,epic"
create_issue "[CRM] Phase 1 - Azure Foundation"                              "$CRM_DIR/p1.md" "spec/crm-auslagerung,service/crm,area/infrastructure,wave/A-foundation,P1,effort/M,deployment,epic"
create_issue "[CRM] Phase 2 / US1 - Inventar erfassen"                       "$CRM_DIR/p2.md" "spec/crm-auslagerung,service/crm,area/crm,wave/A-foundation,P1,effort/M,docs,epic"
create_issue "[CRM] Phase 3 / US1 - Staging-VM und PoC"                      "$CRM_DIR/p3.md" "spec/crm-auslagerung,service/crm,area/crm,area/infrastructure,wave/B-feature-core,P1,effort/L,deployment,epic"
create_issue "[CRM] Phase 4 / US2 - Datenkonsistenz und API"                 "$CRM_DIR/p4.md" "spec/crm-auslagerung,service/crm,area/crm,wave/B-feature-core,P1,effort/M,qa,epic"
create_issue "[CRM] Phase 5 / US4 - Backup, Monitoring, Hardening"           "$CRM_DIR/p5.md" "spec/crm-auslagerung,service/crm,area/infrastructure,wave/C-stabilization,P2,effort/M,ops,security,epic"
create_issue "[CRM] Phase 6 / US3 - Cutover-Vorbereitung und Dry-Run"        "$CRM_DIR/p6.md" "spec/crm-auslagerung,service/crm,area/infrastructure,wave/C-stabilization,P1,effort/M,deployment,epic"
create_issue "[CRM] Phase 7 / US3 - Cutover und Verifikation"                "$CRM_DIR/p7.md" "spec/crm-auslagerung,service/crm,area/infrastructure,wave/C-stabilization,P1,effort/L,deployment,epic"
create_issue "[CRM] Phase 8 / US5 - DSGVO Abschluss + Plesk-Reduktion"       "$CRM_DIR/p8.md" "spec/crm-auslagerung,service/crm,area/infrastructure,dsgvo,wave/C-stabilization,P2,effort/M,compliance,epic"
create_issue "[CRM] Querschnitt - Governance + Gate-Hygiene"                 "$CRM_DIR/qg.md" "spec/crm-auslagerung,service/crm,wave/C-stabilization,P1,effort/S,security,docs,epic"

echo
echo "Done. Created 9 (Forum) + 10 (CRM) = 19 issues in $REPO and added them to project #$PROJECT_NUMBER."

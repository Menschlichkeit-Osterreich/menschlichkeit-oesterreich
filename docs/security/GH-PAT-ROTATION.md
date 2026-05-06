# GitHub PAT Rotation – Schritt-für-Schritt-Anleitung

**Zweck:** Sicherer Austausch des GitHub Personal Access Token (GH_TOKEN)
**Frequenz:** Jährlich (spätestens 30 Tage vor Ablauf)
**Dauer:** ~15 Minuten
**Verantwortlich:** DevOps Engineer + Security Analyst

---

## 📋 Vorbereitung (1 Woche vor Ablauf)

### 1. Reminder-Issue prüfen

- [ ] Automatisch generiertes Issue öffnen (Label: `P0-Critical`, `security`)
- [ ] Aktuellen PAT-Scope dokumentieren:
  ```bash
  gh auth status
  gh api user -q '.login'
  ```

### 2. Abhängigkeiten identifizieren

- [ ] Workflows prüfen, die `secrets.GH_TOKEN` nutzen:
  ```bash
  grep -r "secrets.GH_TOKEN" .github/workflows/ | cut -d: -f1 | sort -u
  ```
- [ ] Externe Services prüfen (z.B. n8n-Webhooks, Plesk-Deployments)

---

## 🔑 Neuen PAT erstellen

### 3. GitHub UI öffnen

**URL:** https://github.com/settings/tokens?type=beta

### 4. Token-Konfiguration

| Feld                  | Wert                                                                                           |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| **Token name**        | `GH_TOKEN 2026-2027`                                                                           |
| **Expiration**        | **Custom:** 2027-10-18 (1 Jahr)                                                                |
| **Repository access** | **All repositories** (oder spezifisch: `Menschlichkeit-Osterreich/menschlichkeit-oesterreich`) |

### 5. Scopes auswählen (Minimum)

**Repository Permissions:**

- ✅ **Contents:** Read and write (für Checkout + Push)
- ✅ **Actions:** Read and write (für Workflow-Trigger)
- ✅ **Secrets:** Read and write (für Secret-Management)
- ✅ **Workflows:** Read and write (für Workflow-Updates)
- ✅ **Pull requests:** Read and write (für PR-Kommentare)
- ✅ **Issues:** Read and write (für Issue-Management)

**Organization Permissions (falls nötig):**

- ✅ **Administration:** Read and write (für Org-Settings)
- ✅ **Members:** Read (für Team-Zugriff)

**Account Permissions:**

- ✅ **Codespaces:** Read and write (für Devcontainer-Secrets)
- ✅ **GPG Keys:** Read and write (für Commit-Signing-Config)

### 6. Token generieren

- [ ] **Generate token** klicken
- [ ] Token **sofort kopieren** (wird nur einmal angezeigt!)
- [ ] Token in **Passwort-Manager** speichern (temporär)

---

## 🔄 Secret aktualisieren

### 7. GitHub Repository Secret

**Methode A: GitHub UI**

1. Navigiere zu: https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich/settings/secrets/actions
2. `GH_TOKEN` → **Update**
3. Neuen Token einfügen → **Update secret**

**Methode B: gh CLI** (empfohlen)

```bash
# Token aus Passwort-Manager kopieren und eingeben
echo "github_pat_11A43OH4Y0..." | gh secret set GH_TOKEN \
  --repo Menschlichkeit-Osterreich/menschlichkeit-oesterreich

# Bestätigung
gh secret list --repo Menschlichkeit-Osterreich/menschlichkeit-oesterreich | grep GH_TOKEN
```

### 8. Lokale .env.local aktualisieren

```bash
# .env.local editieren (NICHT .env!)
nano .env.local

# Zeile ersetzen:
# GH_TOKEN=github_pat_OLD...
# → GH_TOKEN=github_pat_NEW...

# Test
gh auth status
# Sollte zeigen: ✓ Logged in to github.com as peschull
```

### 9. VS Code Settings (optional)

Wenn Token in VS Code Settings referenziert:

```json
// .vscode/settings.json
{
  "terminal.integrated.env.windows": {
    "GH_TOKEN": "${env:GH_TOKEN}" // Lädt automatisch aus .env.local
  }
}
```

---

## ✅ Workflow-Tests

### 10. Test-Workflows manuell starten

```bash
# CI-Workflow
gh workflow run ci.yml --ref main

# Admin-Operations (falls vorhanden)
gh workflow run admin-ops.yml --ref main -f operation=sync-labels

# Logs prüfen
gh run list --workflow=ci.yml --limit 3
gh run view <RUN_ID> --log
```

### 11. Kritische Workflows validieren

- [ ] **Deployment-Workflow:** Staging-Deploy durchführen
  ```bash
  gh workflow run deploy-staging.yml --ref main
  ```
- [ ] **Release-Workflow:** Testrelease erstellen (v0.0.0-test)
  ```bash
  git tag v0.0.0-test
  git push origin v0.0.0-test
  gh release view v0.0.0-test  # Prüfen
  gh release delete v0.0.0-test --yes  # Cleanup
  ```
- [ ] **Secret-Scanning:** Funktioniert weiterhin
  ```bash
  gh api repos/Menschlichkeit-Osterreich/menschlichkeit-oesterreich/secret-scanning/alerts
  ```

### 12. Externe Integrationen testen

- [ ] **n8n-Webhooks:** Test-Webhook auslösen
- [ ] **Plesk-Deployment:** Dry-Run durchführen
  ```bash
  npm run deploy:staging --dry-run
  ```

---

## 🗑️ Alten PAT widerrufen

### 13. Wartezeit (24 Stunden)

**WICHTIG:** Warte 24h nach Secret-Update, bevor du alten Token widerrufst!

- Grund: Cached Workflows könnten noch alten Token nutzen
- Überwachung: GitHub Actions Logs auf Fehler prüfen

### 14. Token widerrufen

**GitHub UI:**

1. https://github.com/settings/tokens
2. Alten Token finden (z.B. "GH_TOKEN 2025-2026")
3. **Delete** → Bestätigen: **I understand, delete this token**

**Bestätigung via gh CLI:**

```bash
# Alle Tokens auflisten (zeigt nur Namen, nicht Werte)
gh api user/tokens --jq '.[] | {id, description, expires_at}'

# Prüfen: Alter Token sollte fehlen
```

---

## 📝 Dokumentation & Cleanup

### 15. Secrets-Inventory aktualisieren

**`reports/SECRETS-INVENTORY.md`** (oder ähnlich):

```markdown
## GH_TOKEN

- **Typ:** GitHub Personal Access Token (Fine-grained)
- **Ablauf:** 2027-10-18
- **Letzte Rotation:** 2026-10-18
- **Verantwortlich:** Peter Schuller (DevOps)
- **Scopes:** Contents, Actions, Secrets, Workflows, Codespaces
- **Nächste Rotation:** 2027-09-18 (30 Tage vorher)
```

### 16. Issue schließen

```bash
# Issue-Nummer aus Reminder-Workflow
gh issue close <ISSUE_NUMBER> --comment "✅ PAT erfolgreich rotiert (2026-10-18). Neuer Ablauf: 2027-10-18."
```

### 17. Audit-Log prüfen

**GitHub UI:**

1. https://github.com/organizations/peschull/settings/audit-log
2. Filter: `action:token` + `created:>2026-10-18`
3. Verifiziere: Neuer Token erstellt, alter gelöscht

---

## 🚨 Rollback (bei Problemen)

### Symptome für fehlgeschlagene Rotation

- ❌ Workflows schlagen mit "Bad credentials" fehl
- ❌ `gh` CLI zeigt "authentication failed"
- ❌ Deployment-Skripte können nicht auf Repo zugreifen

### Rollback-Schritte

1. **Alten PAT NICHT widerrufen** (24h Wartezeit einhalten!)

2. **Secret zurücksetzen:**

   ```bash
   # Alten Token aus Passwort-Manager holen
   echo "github_pat_OLD..." | gh secret set GH_TOKEN
   ```

3. **Workflows neu starten:**

   ```bash
   gh run rerun <FAILED_RUN_ID>
   ```

4. **Root-Cause-Analysis:**
   - Fehlende Scopes? → Neuen Token mit korrekten Scopes erstellen
   - Falsches Repo? → Token-Access-Level prüfen
   - Token-Leak? → Sofort beide Tokens widerrufen, neue Rotation

---

## 📊 Checkliste (Zusammenfassung)

```markdown
### Vor Rotation (T-7 Tage)

- [ ] Reminder-Issue prüfen
- [ ] Workflows & Abhängigkeiten dokumentieren

### Rotation (T-0)

- [ ] Neuen PAT erstellen (2027-10-18)
- [ ] Scopes korrekt setzen
- [ ] GitHub Secret aktualisieren
- [ ] .env.local aktualisieren
- [ ] gh auth status → ✅

### Tests (T+0)

- [ ] CI-Workflow (3 erfolgreiche Runs)
- [ ] Deployment-Workflow (Staging)
- [ ] Release-Workflow (Testrelease)
- [ ] Externe Integrationen (n8n, Plesk)

### Cleanup (T+24h)

- [ ] 24h Wartezeit abwarten
- [ ] Alten PAT widerrufen
- [ ] Dokumentation aktualisieren
- [ ] Issue schließen
- [ ] Audit-Log prüfen

### Rollback-Plan (falls nötig)

- [ ] Alten Token NICHT widerrufen
- [ ] Secret zurücksetzen
- [ ] Workflows neu starten
- [ ] Root-Cause-Analysis
```

---

## 🔗 Referenzen

**Interne Dokumentation:**

- `.github/instructions/gh-pat-integration.instructions.md` (Masterprompt)
- `docs/security/GH-TOKEN-USAGE.md` (Quick-Start-Guide)
- `.github/workflows/pat-expiry-reminder.yml` (Auto-Reminder)
- `scripts/gh/` (Admin-Skripte)

**Externe Ressourcen:**

- [GitHub PAT Best Practices](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- [Fine-grained PATs](https://github.blog/2022-10-18-introducing-fine-grained-personal-access-tokens-for-github/)
- [Token Security](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)

---

**Letzte Aktualisierung:** 2025-10-18
**Nächste Rotation:** 2027-09-18 (30 Tage vor Ablauf)
**Version:** 1.0.0

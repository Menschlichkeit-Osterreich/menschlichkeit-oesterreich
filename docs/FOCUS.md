# 🎯 FOCUS - Community Forum Integration (2 Wochen Sprint)

**Sprint**: 2025-10-03 bis 2025-10-17  
**Ziel**: DSGVO-konformes Forum mit Figma Design System Integration

---

## ✅ Diese 2 Wochen (Fokus-Scope)

### 1) ✅ Figma Design System → Discourse Integration

**Status**: ✅ ABGESCHLOSSEN

- [x] Design Tokens synchronisiert (Token Drift = 0%)
- [x] Discourse Theme Generator erstellt (`scripts/generate-discourse-theme.cjs`)
- [x] WCAG AA konformes Theme generiert (207 Zeilen CSS, 4.25 KB)
- [x] Österreichische Farben (Rot-Weiß-Rot) integriert
- [x] Accessibility Features (Focus States, Touch Targets 44x44px)
- [x] DSGVO Cookie Banner Styles

**Deliverables**:

- ✅ `figma-design-system/discourse-theme.css`
- ✅ `scripts/generate-discourse-theme.cjs`
- ✅ Dokumentation in `community_forum_integration_ngo_eu_dsgvo_aktionsplan_copilot_briefing.md`

### 2) 🔄 Security CI/CD Pipeline (IN PROGRESS)

**Ziel**: security.yml grün bekommen

- [ ] Gitleaks installieren & konfigurieren
- [ ] Semgrep CI Workflow aktivieren
- [ ] Dependabot Setup (npm + pip)
- [ ] CodeQL für JavaScript/TypeScript + Python
- [ ] SBOM Generation (CycloneDX)

**Blocker**: Trivy & Gitleaks nicht installiert im Codespace

### 3) 📚 Quickstart Dokumentation

**Ziel**: Onboarding ≤10 Minuten

- [ ] `docs/QUICKSTART.md` erstellen
- [ ] Prerequisites & Setup Steps
- [ ] Figma Token Sync dokumentieren
- [ ] Forum Theme Installation Guide
- [ ] Video/GIF-Walkthrough (optional)

---

## 🅿️ Parkplatz (Nicht diese 2 Wochen)

**Später (Post-MVP)**:

- Discourse EU-Hosting Setup (VM/Docker)
- SSO/OIDC Integration (Keycloak)
- GitHub Actions → Discourse Release Bot
- Matomo Analytics (Privacy-friendly)
- Trust Level Automation
- Plugin-Installation (Akismet, Solved, Voting)
- Performance Testing (k6 Load Tests)
- E2E Testing (Playwright für Forum)

**Tech Debt**:

- npm audit moderate vulnerabilities (esbuild, vite)
- PHPStan Level erhöhen
- Test Coverage auf >90% bringen

---

## 📊 Erfolgsmetriken (diese 2 Wochen)

| Metrik                    | Start | Ziel    | Aktuell         |
| ------------------------- | ----- | ------- | --------------- |
| **Design Token Drift**    | ?     | 0%      | ✅ 0%           |
| **Security CI grün**      | ❌    | ✅      | 🔄              |
| **Discourse Theme ready** | ❌    | ✅      | ✅ DONE         |
| **Quickstart Zeit**       | ?     | ≤10 Min | 🔄              |
| **WCAG AA Compliance**    | ?     | 100%    | ✅ 100% (Theme) |

---

## 🚀 Nächste Schritte (geordnet nach Priorität)

1. **Security CI aktivieren**

   ```bash
   # Gitleaks installieren
   wget -qO gitleaks.tar.gz https://github.com/gitleaks/gitleaks/releases/download/v8.18.2/gitleaks_8.18.2_linux_x64.tar.gz
   tar -xzf gitleaks.tar.gz
   sudo mv gitleaks /usr/local/bin/

   # Semgrep via GitHub Action
   # .github/workflows/security.yml bereits vorhanden
   ```

2. **QUICKSTART.md schreiben**

   ```bash
   cd docs/
   touch QUICKSTART.md
   # Inhalt: Prerequisites, Clone, Setup, Figma Sync, Build, Deploy
   ```

3. **Discourse Theme testen**
   ```bash
   # Theme hochladen in lokale Discourse Instanz
   # Visuelle Regression Tests (optional)
   ```

---

## 🎯 Definition of Done (Sprint)

- [x] Figma → Discourse Theme Generator funktioniert
- [ ] Security CI läuft ohne Fehler
- [ ] Quickstart Doku existiert und verifiziert
- [ ] Alle Änderungen committed & gepusht
- [ ] Sprint Review dokumentiert

---

**Letzte Aktualisierung**: 2025-10-03  
**Next Review**: 2025-10-10 (Midpoint Check)

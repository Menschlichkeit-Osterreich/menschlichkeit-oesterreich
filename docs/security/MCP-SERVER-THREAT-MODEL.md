# MCP Server Threat Model – Model Context Protocol Stack (Stand: 04.10.2025)

**Scope:** Alle MCP-Server innerhalb des VS-Code-Workspaces (`filesystem`, `git`, `docker`, `codacy`) sowie deren Interaktion mit Copilot-Aktionen.

**Methodology:** STRIDE + LINDDUN (für Datenschutzrisiken) ergänzt um Supply-Chain- und Sandbox-Checks laut Phase-0-Anforderungen.

---

## 1. Architektur Snapshot

- Copilot ↔ MCP Client (VS Code Extension) ↔ lokale MCP Server Prozesse
- Primäre Server:
  - `filesystem`: Dateizugriff auf `/workspaces/...`
  - `git`: Git-Operationen (log, diff, blame)
  - `docker`: Container-Aufrufe mit Host-Docker-Forwarding
  - `codacy`: CLI-Analyse Wrapper (Java JAR)
- AuthN/AuthZ: Trust-by-Process (kein Benutzerprompt), Zugriff wird durch lokale Dateirechte beschränkt
- Telemetrie: Logs in `~/.copilot/mcp/`, keine zentrale Audit-Trail Persistierung

---

## 2. STRIDE Summary

| Threat Category            | Szenario                                              | Impact | Likelihood | Existing Controls                                   | Gap / Action                                           |
| -------------------------- | ----------------------------------------------------- | ------ | ---------- | --------------------------------------------------- | ------------------------------------------------------ |
| **Spoofing**               | Rogue MCP Endpoint wird injiziert (Man-in-the-middle) | Hoch   | Niedrig    | `mcp.json` ge-whitelistet, Signaturen der Extension | Hash-Pinning/Laufzeithärte in Phase 3                  |
| **Tampering**              | MCP `filesystem` Server überschreibt sensible Dateien | Hoch   | Mittel     | Workspace-ACLs, journaling via Git                  | Schreiboperationen mit Policy-Gates & Dry-Run abfangen |
| **Repudiation**            | Aktionen ohne Audit Log (z.B. Löschen von Secrets)    | Hoch   | Hoch       | Git-Historie deckt nur versionierte Dateien ab      | Zentralen MCP Audit-Log + Zeitsignaturen einführen     |
| **Information Disclosure** | `docker` Server leakt Docker Secrets/Env              | Hoch   | Mittel     | Docker CLI Zugriff nur im Container                 | Default `--env` allowlist + Secret-Redaction nötig     |
| **Denial of Service**      | Unbegrenzte MCP Requests blockieren Ressourcen        | Mittel | Mittel     | Keine Ratelimits                                    | Request-Quota + Timeout Enforcement                    |
| **Elevation of Privilege** | `codacy` Server führt beliebige Java-Args aus         | Hoch   | Niedrig    | Wrapper `scripts/codacy-cli.sh` verifiziert JAR     | Arg-Whitelist + Signaturprüfung implementieren         |

---

## 3. LINDDUN Privacy Checks

| Kategorie           | Risiko                                                     | Status    | Maßnahme                                                     |
| ------------------- | ---------------------------------------------------------- | --------- | ------------------------------------------------------------ |
| **Linkability**     | Kombination von MCP Logs ermöglicht Entwicklerprofiling    | Offen     | Pseudonymisierte Logs + Aufbewahrungsfristen definieren      |
| **Identifiability** | CLI-Ausgaben enthalten PII aus Code                        | Offen     | PII-Filter in CLI-Ausgaben, automatische Schwärzung          |
| **Non-Repudiation** | Fehlendes Sign-Off verhindert Verantwortlichkeitszuordnung | Offen     | MCP Request-Signaturen mit Dev-ID einführen                  |
| **Detectability**   | Systemantworten offenbaren Existenz sensibler Dateien      | Teilweise | Zugriff auf `secrets/` nur über genehmigte Tools             |
| **Disclosure**      | Docker-Logs geben Tokens preis                             | Offen     | Redaction Hooks + `--log-driver=none` für sensible Container |
| **Unawareness**     | Entwickler weiß nicht, welche Daten übertragen werden      | Offen     | Transparente UI + Request-Protokoll in VS Code               |
| **Non-Compliance**  | DSGVO Art. 5 verletzt durch unkontrollierte Speicherung    | Offen     | Retention Policy (14 Tage) + Löschroutine für Logs           |

---

## 4. Attack Paths (Kurzfassung)

### 4.1 Maliziöser MCP Request missbraucht `filesystem`

```
Goal: Persistente Hintertür einschleusen
  ├─ Copilot Prompt erzeugt Patch mit `postinstall`-Script
  │   ├─ (Precondition) Kein Review / Auto-Accept aktiviert
  │   └─ (Mitigation) Mandatory Diff Review + allowlist für Paket-Skripte
  └─ Script erreicht Deployment
      ├─ (Mitigation) CI-SBOM prüft `scripts/` auf Exec-Bits
      └─ Sigstore Attestation verweigert unverifizierte Artefakte
```

### 4.2 `docker` Server exfiltriert Secrets

```
Goal: Geheime Variablen aus Docker Context abgreifen
  ├─ MCP Request startet Container mit `-v /secrets:/data`
  │   ├─ (Mitigation) Default-Deny Mount Policy + Review Hook
  └─ Container sendet Daten outbound
      ├─ (Mitigation) Network Policy / egress Blocker
      └─ Logging + Alert bei nicht genehmigten Aufrufen
```

### 4.3 `codacy` Toolchain Dropper

```
Goal: Manipuliertes JAR führt Shellcode aus
  ├─ Download ersetzt legitimes JAR (MITM)
  │   ├─ (Mitigation) SHA256 Verification + Sigstore Bundle
  └─ Java Process liest Build Secrets
      ├─ (Mitigation) Run with `--restrict-permissions`
      └─ Sandbox innerhalb Firejail/Bubblewrap
```

---

## 5. Kontrollen & Maßnahmen (Roadmap)

| Phase   | Maßnahme                   | Beschreibung                                                                           | Status                              |
| ------- | -------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------- |
| Phase 0 | **Baseline Logging**       | MCP Request/Response JSON lokal unter `logs/mcp/` rotieren, 14 Tage Retention          | ✅ Entwurf in Phase 0 (siehe unten) |
| Phase 1 | **Policy Engine**          | OPA/Gatekeeper Policies für gefährliche Operationen (`docker run`, `git push --force`) | Geplant                             |
| Phase 2 | **Sandboxing**             | Firejail Profile pro MCP Server, Seccomp Filter aktivieren                             | Geplant                             |
| Phase 3 | **Supply-Chain Hardening** | Signaturprüfung aller Tool-Binaries (Sigstore/TUF)                                     | Geplant                             |
| Phase 3 | **Audit Trail**            | Unveränderliche Logs nach `quality-reports/audit/` mit Hashkette                       | Geplant                             |

---

## 6. Sofortmaßnahmen (Phase 0 Deliverables)

1. **JAR Integrity** (✅ erledigt)
   - Download nur aus GitHub Release 7.10.0, SHA256 `9e611fedfb47eda0b2b980c102cd5bd067fea824a4ac1a8d1d0d8c17d79017fc` verifizieren.
   - JAR-Kopie im Workspace (`/.codacy/`) plus Home-Verzeichnis (`~/.codacy/`).
2. **CLI Wrapper Härtung** (In Arbeit)
   - `scripts/codacy-cli.sh` prüft Java & JAR-Pfad; Phase 1 erweitert Arg-Whitelist (`analyze`, `validate-configuration`).
3. **Log Hygiene** (In Planung)
   - MCP Logs nach `/workspaces/.../logs/mcp/` umbiegen, DSGVO-konforme Retention (14 Tage) + Redaction.
4. **Access Review** (✅ laufend)
   - Nur notwendige Server in `mcp.json` aktiv; weitere Tools erst nach Threat Model Freigabe.

---

## 7. Offene Risiken & Next Steps

- [ ] Policy-basiertes Allowlisting für Dateipfade (`filesystem`)
- [ ] Network egress Kontrolle für `docker` Prozesse
- [ ] Automatisierte JAR Integritätsprüfung (SHA/Sigstore) im CI
- [ ] Transparente Developer UI (Copilot Panels) für laufende MCP Requests
- [ ] Datenschutzfolgeabschätzung (DSFA) für MCP Logging

### Codacy MCP Binding Workaround

**Status:** MCP-Server meldet fälschlicherweise "CLI on Windows is not supported without WSL" in Linux-Container (Codespaces)

**Root Cause:** Platform-Detection-Bug im Codacy MCP Server (nicht in der CLI selbst)

**Workaround (validiert):**

```bash
# Direkte CLI-Nutzung statt MCP-Binding
codacy-analysis-cli analyze --directory <path> --tool <tool> --format json

# Beispiel: Markdown-Linting der Security-Docs
codacy-analysis-cli analyze --directory docs/security --tool markdownlint --format json
```

**Verifizierung:**

- ✅ CLI Version: `7.10.0` (via `codacy-analysis-cli --version`)
- ✅ Markdownlint-Analyse erfolgreich auf `docs/security/MCP-SERVER-THREAT-MODEL.md`
- ✅ JSON-Output generiert ohne Fehler
- ❌ MCP `codacy_cli_analyze` Tool blockiert durch Platform-Error

**Nächste Schritte:**

1. CI/CD-Integration nutzt direkte CLI-Aufrufe (siehe `.github/instructions/codacy.instructions.md`)
2. MCP-Server-Update abwarten (GitHub Issue bei Codacy-MCP-Repo empfohlen)
3. Bis dahin: Wrapper-Script für automatisierte Post-Edit-Analyse verwenden

**Referenzen:**

- `docs/Repo & MCP-Server Optimierung.md` (Phase 0)
- `security/SUPPLY-CHAIN-SECURITY-BLUEPRINT.md`
- `scripts/codacy-cli.sh`

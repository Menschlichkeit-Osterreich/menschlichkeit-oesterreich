# config-templates/

Enthält Konfigurations-Templates für Produktionsdeployments. Diese Dateien werden von `scripts/plesk-config-manager.ps1` auf den Plesk-Server übertragen.

**Sicherheitsregel:** Alle Platzhalter (`REPLACE_WITH_*`, `YOUR_*_HERE`) müssen bei der Verwendung durch echte Werte ersetzt werden. Niemals echte Credentials in diese Dateien committen.

## Dateien

| Datei                            | Ziel auf Server                            | Verwendung                                                                                                                                                                                                   |
| -------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| ~~`laravel-env-production.env`~~ | ~~`/subdomains/api/httpdocs/.env`~~        | **[DEPRECATED 2026-04-04]** Enthält ausschliesslich Laravel-spezifische Variablen (SESSION*DRIVER, PUSHER*\*, BCRYPT_ROUNDS). Ersatz: `apps/api/.env.example`. Nur noch als historische Referenz archiviert. |
| `civicrm-settings.php`           | `/subdomains/crm/httpdocs/sites/default/`  | CiviCRM-Konfiguration für Drupal/CiviCRM                                                                                                                                                                     |
| `mcp-hosts.json`                 | Referenziert von `scripts/mcp-connect.ps1` | MCP-Host-Konfiguration                                                                                                                                                                                       |

## Deployment

```powershell
# Templates auf Server deployen (Plesk):
.\scripts\plesk-config-manager.ps1 -Deploy
```

## Klassifikation (gemäß Secrets Policy)

Diese Dateien sind **Klasse A** (erlaubt im Repo, nur Platzhalter-Werte).

Vollständige Secrets Policy: `docs/security/secrets-policy.md`

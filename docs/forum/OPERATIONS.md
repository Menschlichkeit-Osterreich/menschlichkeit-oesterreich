# OPERATIONS – Runbooks

**Stand:** 2025-10-19

## Erstinstallation (nach Review)
1. DB anlegen (MariaDB/MySQL), User mit Least-Privilege.
2. Deployment konfigurieren (vorerst Staging).
3. Installer: `https://forum.menschlichkeit-oesterreich.at/install` → Admin, SMTP, Captcha.
4. `install/` entfernen/sperren; Smoke-Tests.

## Routinebetrieb
- Backups täglich (DB + `store/`, `files/`, `images/avatars/upload/`).
- Patches monatlich (vorher Staging-Test).
- Monitoring (Uptime, Fehlerlogs, Registrierungen).

## Restore-Test (halbjährlich)
- Staging aufsetzen → DB+Files einspielen → Funktionsprüfung.

## Permissions (Beispiel)
- Schreibbar: `cache/`, `files/`, `store/`, `images/avatars/upload/` (775, Owner = Plesk-User).

## Logging
- Plesk Access/Error, phpBB ACP-Logs.

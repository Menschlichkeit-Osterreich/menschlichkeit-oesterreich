# Secrets Contract

Stand: 2026-04-25
Scope: Produktionskritische Betriebsvertraege fuer Secret-Handling (ohne Werte, ohne PII).

## Grundsaetze

- Keine Secret-Werte im Repository.
- Fuehrende Secret-Quelle ist Bitwarden Secrets Manager (BSM).
- Runtime-Handoff erfolgt ausschliesslich ueber bestehende Deploy-Workflows und Runtime-Injektion.
- Dieses Dokument beschreibt nur Metadaten, Verantwortlichkeiten und Verifikationsstatus.

## Secret-Metadatenvertrag

| Secret-Name             | Zweck                                        | Quelle                                                     | Runtime-Ziel                                            | Owner/RACI-Rolle                                    | Rotation                          | Produktionsverifikationsstatus |
| ----------------------- | -------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------- | --------------------------------- | ------------------------------ |
| DATABASE_URL            | Datenbank-Verbindung fuer API-Runtime        | BSM (kanonisch), optional GitHub Environment Secret Mirror | API Runtime auf Plesk (`.env` Merge via Deploy-Handoff) | R: DevOps, A: Security, C: Backend, I: Vorstand/Ops | 90 Tage                           | Offen                          |
| JWT_SECRET_KEY          | Signatur fuer JWT-Token                      | BSM                                                        | API Runtime (Auth/Session)                              | R: Backend, A: Security, C: DevOps, I: QA           | 90 Tage                           | Offen                          |
| STRIPE_SECRET_KEY       | Stripe Server-API Auth                       | BSM                                                        | API Runtime (Payment Backend)                           | R: Backend, A: Security, C: Finance/Ops, I: QA      | 90 Tage                           | Offen                          |
| STRIPE_WEBHOOK_SECRET   | Validierung eingehender Stripe Webhooks      | BSM                                                        | API Runtime (Webhook Verification)                      | R: Backend, A: Security, C: DevOps, I: QA           | 90 Tage                           | Offen                          |
| ALERTS_SLACK_WEBHOOK    | Versand technischer Betriebsalarme           | BSM                                                        | API/Automation Alerting Runtime                         | R: DevOps, A: Security, C: Operations, I: Vorstand  | 90 Tage                           | Offen                          |
| MICROSOFT_TENANT_ID     | Tenant-Zuordnung fuer Graph-Mail Integration | BSM                                                        | API Runtime (Graph Mail Adapter)                        | R: DevOps, A: Security, C: Backend, I: Operations   | Bei Tenant-Aenderung              | Offen                          |
| MICROSOFT_CLIENT_ID     | App-Identitaet fuer Graph-Mail Integration   | BSM                                                        | API Runtime (Graph Mail Adapter)                        | R: DevOps, A: Security, C: Backend, I: Operations   | 180 Tage oder bei Re-Registration | Offen                          |
| MICROSOFT_CLIENT_SECRET | Client Secret fuer Graph-Mail OAuth          | BSM                                                        | API Runtime (Graph Mail Adapter)                        | R: DevOps, A: Security, C: Backend, I: Operations   | 90 Tage                           | Offen                          |
| MICROSOFT_GRAPH_SENDER  | Absender-Identity fuer Graph-Mail            | BSM                                                        | API Runtime (Mail Dispatch)                             | R: Operations, A: Security, C: Backend, I: Vorstand | Bei Mail-Identity-Aenderung       | Offen                          |
| MAIL_USERNAME           | SMTP Benutzername (Fallback/Non-Graph)       | BSM                                                        | API/Worker Runtime (SMTP Client)                        | R: DevOps, A: Security, C: Operations, I: QA        | 90 Tage                           | Offen                          |
| MAIL_PASSWORD           | SMTP Passwort (Fallback/Non-Graph)           | BSM                                                        | API/Worker Runtime (SMTP Client)                        | R: DevOps, A: Security, C: Operations, I: QA        | 90 Tage                           | Offen                          |
| MAIL_HOST               | SMTP Hostname                                | BSM/konfigurierter Runtime-Parameter                       | API/Worker Runtime (SMTP Client)                        | R: DevOps, A: Operations, C: Security, I: QA        | Bei Providerwechsel               | Offen                          |
| MAIL_PORT               | SMTP Port                                    | BSM/konfigurierter Runtime-Parameter                       | API/Worker Runtime (SMTP Client)                        | R: DevOps, A: Operations, C: Security, I: QA        | Bei Providerwechsel               | Offen                          |
| MAIL_ENCRYPTION         | SMTP Transportmodus (z. B. TLS/STARTTLS)     | BSM/konfigurierter Runtime-Parameter                       | API/Worker Runtime (SMTP Client)                        | R: DevOps, A: Security, C: Operations, I: QA        | Bei Security-Policy-Aenderung     | Offen                          |
| MAIL_FROM_ADDRESS       | Technische From-Adresse                      | BSM                                                        | API/Worker Runtime (Mail Header)                        | R: Operations, A: Security, C: Backend, I: Vorstand | Bei Absenderwechsel               | Offen                          |
| MAIL_FROM_NAME          | Technischer Anzeigename fuer Absender        | BSM                                                        | API/Worker Runtime (Mail Header)                        | R: Operations, A: Vorstand, C: Security, I: Backend | Bei CI/Brand-Update               | Offen                          |
| MAIL_REPLY_TO_ADDRESS   | Reply-To fuer Ruecklaeufer/Support           | BSM                                                        | API/Worker Runtime (Mail Header)                        | R: Operations, A: Vorstand, C: Security, I: Support | Bei Prozess-/Inbox-Aenderung      | Offen                          |

## Betriebsregeln

- Secret-Rotation darf niemals durch Dokumentation von Klartextwerten begleitet werden.
- Verifikation erfolgt nur ueber technische Nachweise (Job-Logs, Healthchecks, Test-Ergebnisse), nicht ueber Secret-Offenlegung.
- Bei fehlender Verifikation bleibt Status auf `Offen` und ist vor Production-Go-Live zu schliessen.

## Verwandte Referenzen

- `docs/operations/deployment.md`
- `docs/security/secrets-catalog.md`
- `.github/workflows/reusable-bsm-secrets.yml`
- `.github/bsm-secret-ids.json`

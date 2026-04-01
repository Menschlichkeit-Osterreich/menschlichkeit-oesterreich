# Security Quick Reference

Diese Schnellreferenz folgt dem aktuellen Monorepo-Vertrag. Historische Mirror-Pfade wie `api.menschlichkeit-oesterreich.at/` sind hier bewusst nicht mehr normativ.

## Akute Checks

### API-Erreichbarkeit

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://api.menschlichkeit-oesterreich.at/healthz
curl -s -o /dev/null -w "%{http_code}\n" https://api.menschlichkeit-oesterreich.at/readyz
```

`/health` bleibt nur Legacy-Alias fuer bestehende Monitore und Reverse-Proxies.

### Security Header pruefen

```bash
curl -sI https://api.menschlichkeit-oesterreich.at/healthz \
  | grep -E "(Content-Security|Strict-Transport|X-Frame|X-Content|X-XSS|Referrer|Permissions)"
```

### Rate Limiting pruefen

```bash
for i in {1..15}; do
  curl -s -o /dev/null -w "%{http_code}\n" https://api.menschlichkeit-oesterreich.at/healthz
  sleep 0.1
done
```

## Kanonische Fundstellen

- API-Entrypoint: `apps/api/app/main.py`
- Security-Middleware und Limiting: `apps/api/app/security.py`
- API-Tests: `apps/api/tests/test_security.py`, `apps/api/tests/test_pii_sanitizer.py`
- Deployvertrag: `README_DEPLOY.md`
- Monitoringvertrag: `docs/operations/monitoring.md`

## Incident-Minimum

1. Betroffene Route und Host festhalten.
2. Healthcheck und Header-Snapshot sichern.
3. Relevante Secrets rotieren, wenn Token/Keys betroffen sind.
4. Advisory- und Disclosure-Pfad nur ueber `Menschlichkeit-Osterreich/menschlichkeit-oesterreich` fuehren.

## Kontakte

- Security Issues: `security@menschlichkeit-oesterreich.at`
- Responsible Disclosure: `docs/security/responsible-disclosure.md`

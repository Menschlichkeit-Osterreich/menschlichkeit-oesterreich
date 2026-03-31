# apps/api

Autoritatives FastAPI-Backend fuer Menschlichkeit Oesterreich.

## Source of Truth

- Aktive Router, Services, Middleware und Alembic-Migrationen leben in `apps/api/`.
- `apps/api/openapi.yaml` ist die einzige aktiv gepflegte API-Spezifikation.
- `api.menschlichkeit-oesterreich.at/` ist nur noch Legacy-/Mirror-Bestand.

## Struktur

```text
apps/api/
├── app/
│   ├── main.py
│   ├── routers/
│   ├── services/
│   ├── middleware/
│   ├── lib/
│   └── schemas/
├── alembic/
├── src/
│   ├── notifications/templates/
│   └── crm/
├── tests/
├── openapi.yaml
├── requirements.txt
└── requirements-dev.txt
```

`app/` enthaelt die aktive API-Laufzeit. `src/` enthaelt weiterhin genutzte Legacy-Module und Templates, zum Beispiel Mail-Templates und CiviCRM-Helfer.

## Lokales Setup

```bash
cd apps/api
python -m pip install -r requirements-dev.txt
cp .env.example .env
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

## Testen

```bash
cd apps/api
python -m pytest tests -q
```

Die Test-Suite ist auf `tests/` standardisiert und laeuft ohne lokale PostgreSQL-Instanz mit Mocks fuer DB-, Audit- und Integrationspfade.

## Wichtige Endpunkte

- `GET /healthz`
- `GET /readyz`
- `GET /api/version`
- `POST /api/newsletter/subscribe`
- `GET /api/newsletter/confirm`
- `POST /api/newsletter/unsubscribe`
- `POST /api/privacy/data-export`
- `POST /api/privacy/data-deletion`
- `POST /api/payments/stripe/intent`
- `POST /api/payments/paypal/order`
- `POST /api/webhooks/stripe`
- `POST /api/webhooks/paypal`

## Mail, DSGVO und Zahlungen

- Mail-Templates werden aus `src/notifications/templates/` geladen.
- Consent- und Privacy-Flows laufen ueber `app/routers/privacy.py` und `app/services/privacy_service.py`.
- Newsletter-DOI, Consent-Grant/Revoke und Payment-Webhooks werden in `app/routers/` und `app/services/` gepflegt.

## Migrationen

```bash
cd apps/api
alembic upgrade head
```

## Vertragsregeln

- Keine neue Produktlogik mehr in `api.menschlichkeit-oesterreich.at/`.
- Keine stillen Routenumbrueche unter `/api/*`.
- Bei API-Aenderungen immer Tests und `openapi.yaml` mitziehen.

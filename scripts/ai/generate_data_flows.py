from __future__ import annotations

from ai_common import DOCS_AI, detect_fastapi_apps, dump_json


def main() -> None:
    fastapi_apps = detect_fastapi_apps()
    flows = []

    for app in fastapi_apps:
        flows.append(
            {
                "flow_id": f"public-to-{app.name}",
                "source": "public-clients",
                "target": app.name,
                "interface": "https-rest",
                "payload_class": "application-json",
                "personal_data": True,
                "special_category_data": False,
                "auth_context": "jwt-or-session",
                "trust_boundary_crossing": True,
                "retention_notes": "Application logs and records follow project retention policies.",
                "evidence": app.evidence,
                "assumptions": ["personal_data flag inferred from member/CRM platform domain"],
            }
        )

    flows.extend(
        [
            {
                "flow_id": "api-to-crm",
                "source": "api.menschlichkeit-oesterreich.at",
                "target": "apps-crm-drupal",
                "interface": "https-api",
                "payload_class": "crm-contact-membership",
                "personal_data": True,
                "special_category_data": False,
                "auth_context": "api-key",
                "trust_boundary_crossing": True,
                "retention_notes": "CRM retention managed by CiviCRM policy and legal obligations.",
                "evidence": "api.menschlichkeit-oesterreich.at/app/main.py:CIVI_* env usage",
                "assumptions": [],
            },
            {
                "flow_id": "api-to-n8n-webhooks",
                "source": "api-services",
                "target": "automation/n8n",
                "interface": "http-webhook",
                "payload_class": "automation-event",
                "personal_data": True,
                "special_category_data": False,
                "auth_context": "basic-auth-or-token",
                "trust_boundary_crossing": True,
                "retention_notes": "Workflow execution data retained by n8n instance configuration.",
                "evidence": "automation/n8n/docker-compose.yml",
                "assumptions": ["webhook integration inferred from n8n presence and scripts"],
            },
        ]
    )

    dump_json(DOCS_AI / "data-flows.json", {"flows": sorted(flows, key=lambda x: x["flow_id"])})


if __name__ == "__main__":
    main()

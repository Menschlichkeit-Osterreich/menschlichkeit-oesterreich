# Responsible Disclosure – Menschlichkeit Österreich

**Stand**: 2026-03-08

Der bevorzugte Meldeweg ist **GitHub Private Vulnerability Reporting**:

→ [Security Advisory erstellen](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich/security/advisories/new)

Alternativ: **security@menschlichkeit-oesterreich.at** (PGP-Key: `menschlichkeit-oesterreich.at/.well-known/pgp-key.asc`)

---

## Prozess

1. Meldung einreichen → Bestätigung innerhalb 72 Stunden
2. Triage & CVSS-Bewertung (intern, vertraulich)
3. Fix-Entwicklung in privater Fork
4. Koordinierte Veröffentlichung nach Patch
5. Erwähnung im Security Advisory (optional, auf Wunsch)

## Scope

In Scope: API, CRM, Frontend, CI/CD-Pipeline, Auth-Flows, PII-Verarbeitung.
Nicht im Scope: DoS-Angriffe, Social Engineering, veraltete nicht-unterstützte Versionen.

Vollständige Details: [`SECURITY.md`](../../SECURITY.md)

## Safe Harbor

Sicherheitsforscher, die im guten Glauben handeln, unseren Disclosure-Prozess befolgen und keine PII exfiltrieren, sind von rechtlichen Maßnahmen ausgenommen.

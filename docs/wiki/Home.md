# Menschlichkeit Österreich – Platform Wiki

**Willkommen zur technischen Dokumentation der Menschlichkeit Österreich Plattform!**

Diese Wiki dient als zentrale Anlaufstelle für Entwickler:innen, DevOps, und alle, die mit der Plattform arbeiten.

---

## 🎯 Quick Navigation

### Für Entwickler:innen
- [🏗️ Architektur](Architecture) – System-Design & Service-Übersicht
- [🛠️ Services](Services) – API, CRM, Frontend, Gaming, Automation
- [💻 Development](Development) – Setup, Workflows, Best Practices
- [🧪 Testing](Testing) – Unit, E2E, Performance, Security Tests

### Für DevOps & Operations
- [🚀 CI/CD](CI-CD) – Pipelines, Deployments, Quality Gates
- [🔒 Security](Security) – Scanning, Secrets, Vulnerability Management
- [📊 Operations](Operations) – Monitoring, Logging, Incident Response
- [🏛️ Infrastructure](Infrastructure) – Hosting, Databases, Networking

### Für Privacy & Compliance
- [🔐 Privacy (DSGVO)](Privacy) – Datenschutz, Betroffenenrechte, Incidents
- [📋 Governance](Governance) – Policies, Rulesets, Code of Conduct

### Allgemein
- [🌍 Community](Community) – Contributing, Support, Roadmap
- [📚 Glossary](Glossary) – Begriffe, Abkürzungen, Technologien

---

## 🚀 Getting Started

### Erste Schritte für neue Entwickler:innen

1. **Repository Setup**
   ```bash
   git clone https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development.git
   cd menschlichkeit-oesterreich-development
   npm run setup:dev
   ```

2. **Services starten**
   ```bash
   npm run dev:all  # Alle Services parallel
   # Oder einzeln:
   npm run dev:api      # FastAPI auf :8001
   npm run dev:crm      # Drupal/CiviCRM auf :8000
   npm run dev:frontend # React auf :3000
   npm run dev:games    # Gaming Platform auf :3000
   ```

3. **Dokumentation lesen**
   - [Architektur-Übersicht](Architecture)
   - [Service-Details](Services)
   - [Development Guide](Development)

### Deployment für DevOps

1. **Secrets konfigurieren** (siehe [Secrets Catalog](docs/security/secrets-catalog.md))
   ```bash
   ./scripts/secrets-bootstrap.sh
   ```

2. **Quality Gates prüfen**
   ```bash
   npm run quality:gates
   ```

3. **Deploy to Staging**
   ```bash
   ./build-pipeline.sh staging
   ```

4. **Deploy to Production**
   ```bash
   ./build-pipeline.sh production
   ```

Siehe [CI/CD Guide](CI-CD) für Details.

---

## 📊 Platform Übersicht

### Multi-Service Architektur

```
┌─────────────────────────────────────────────────────┐
│           Menschlichkeit Österreich Platform        │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │   Website   │  │     CRM     │  │    API     │ │
│  │  WordPress  │  │Drupal+CiviCRM│  │  FastAPI   │ │
│  │   :80/:443  │  │    :8000    │  │   :8001    │ │
│  └─────────────┘  └─────────────┘  └────────────┘ │
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │  Frontend   │  │    Games    │  │     n8n    │ │
│  │    React    │  │   Prisma    │  │ Automation │ │
│  │    :3000    │  │    :3000    │  │   :5678    │ │
│  └─────────────┘  └─────────────┘  └────────────┘ │
│                                                     │
├─────────────────────────────────────────────────────┤
│              Shared Infrastructure                  │
│  • PostgreSQL 16+ (3 DBs: idp, grafana, discourse) │
│  • MariaDB 10.11+ (14 DBs: CRM, n8n, games, etc.)  │
│  • Redis (optional - caching, sessions)            │
├─────────────────────────────────────────────────────┤
│              Security & Compliance                  │
│  • CodeQL, Semgrep, Trivy, OSV, Scorecard          │
│  • DSGVO-First (PII Sanitization)                  │
│  • Secret Scanning + Push Protection               │
└─────────────────────────────────────────────────────┘
```

### Technologie-Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, TypeScript 5, Tailwind CSS, Vite |
| **Backend** | FastAPI (Python 3.11+), Drupal 10 (PHP 8.1+) |
| **Databases** | PostgreSQL 16, MariaDB 10.11, Redis 7 |
| **ORM** | Prisma (Gaming), SQLAlchemy (API), Doctrine (Drupal) |
| **CRM** | CiviCRM 5.x (Nonprofit-specific) |
| **Automation** | n8n (Workflows), GitHub Actions (CI/CD) |
| **Monitoring** | Grafana, Prometheus, Matomo (Analytics) |
| **Security** | CodeQL, Semgrep, Trivy, Gitleaks, OWASP ZAP |

---

## 🔐 Security & Privacy

### Security-First Approach

**Automatische Scans** (bei jedem Push):
- ✅ CodeQL (SAST für JavaScript/Python)
- ✅ Semgrep (Pattern-basierte Analyse)
- ✅ Trivy (Container & Dependencies)
- ✅ OSV Scanner (Vulnerability Database)
- ✅ Gitleaks (Secret Detection)
- ✅ OpenSSF Scorecard (Best Practices)

**DSGVO-Compliance**:
- ✅ Privacy-by-Design in allen Services
- ✅ PII-Sanitization (automatisch)
- ✅ 72-Stunden Incident Response
- ✅ Betroffenenrechte (Auskunft, Löschung, etc.)

Siehe [Security Guide](Security) und [Privacy Documentation](Privacy) für Details.

### Vulnerability Reporting

**Private Vulnerability Reporting** verfügbar:
1. Navigate to [Security → Advisories](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/security/advisories)
2. Click "New draft security advisory"
3. Describe the vulnerability (details ohne sensitive data)
4. Wir antworten innerhalb 72 Stunden

Alternative: security@menschlichkeit-oesterreich.at

Siehe auch: [SECURITY.md](../SECURITY.md)

---

## 📚 Dokumentations-Struktur

### In diesem Repository

```
docs/
├── wiki/                    # ← Sie sind hier (synced to GitHub Wiki)
├── privacy/                 # DSGVO-Dokumentation
│   ├── art-05-06-grundsaetze.md
│   ├── art-30-ropa.md
│   ├── art-33-34-incident-playbook.md
│   ├── art-32-toms.md
│   └── art-35-dpia.md
├── security/                # Security-Dokumentation
│   ├── secrets-catalog.md
│   ├── STRIDE-LINDDUN-ANALYSIS.md
│   └── SUPPLY-CHAIN-SECURITY-BLUEPRINT.md
├── compliance/              # Compliance & Audits
├── architecture/            # System-Design
├── governance/              # Policies & Standards
└── legal/                   # Rechtliche Dokumente
```

### Externe Links

- **GitHub Issues**: [Issues Tracker](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/issues)
- **Pull Requests**: [PR Workflow](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/pulls)
- **Discussions**: [Community Discussions](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/discussions)
- **Security Advisories**: [Security Tab](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/security)

---

## 🤝 Contributing

Wir freuen uns über Contributions! 

**Workflow**:
1. Fork das Repository
2. Feature-Branch erstellen: `git checkout -b feature/amazing-feature`
3. Änderungen committen: `git commit -m 'feat: Add amazing feature'`
4. Branch pushen: `git push origin feature/amazing-feature`
5. Pull Request öffnen

**Wichtig**:
- ✅ Alle Quality Gates müssen grün sein
- ✅ Tests für neue Features schreiben
- ✅ DSGVO-Compliance bei Datenverarbeitung
- ✅ Dokumentation aktualisieren

Siehe [Contributing Guide](Community#contributing) für Details.

---

## 📞 Support & Kontakt

### Für Entwickler-Fragen:
- **GitHub Discussions**: [Fragen stellen](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/discussions)
- **Issues**: [Bug melden oder Feature vorschlagen](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/issues)

### Für Security-Themen:
- **E-Mail**: security@menschlichkeit-oesterreich.at
- **Private Vulnerability Reporting**: [Security Tab](https://github.com/Menschlichkeit-Osterreich/menschlichkeit-oesterreich-development/security/advisories/new)

### Für DSGVO/Datenschutz:
- **Datenschutzbeauftragte:r**: [DPO_EMAIL]
- **Incident Response**: Siehe [Art. 33/34 Playbook](../privacy/art-33-34-incident-playbook.md)

### Für organisatorische Fragen:
- **Website**: https://menschlichkeit-oesterreich.at
- **E-Mail**: info@menschlichkeit-oesterreich.at

---

## 🗓️ Release-Zyklus

- **Hotfixes**: Bei Bedarf (Security, Critical Bugs)
- **Minor Releases**: Monatlich
- **Major Releases**: Quartalsweise
- **LTS Support**: 12 Monate für Major Versions

Siehe [Roadmap](Community#roadmap) für geplante Features.

---

## 📝 Lizenz

Dieses Projekt ist unter der MIT License lizenziert - siehe [LICENSE](../../LICENSE) für Details.

---

**Zuletzt aktualisiert**: 2025-10-12  
**Wiki-Version**: 1.0  
**Nächste Review**: 2026-01-12

---

**Navigation**: [Home](Home) | [Architecture](Architecture) | [Services](Services) | [Security](Security) | [Privacy](Privacy)

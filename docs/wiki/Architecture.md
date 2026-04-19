---
title: Architecture Overview
description: Technischer Ueberblick ueber Plattform-Architektur, Services und Schnittstellen.
lastUpdated: 2026-04-16
status: ACTIVE
---

# Architecture Overview

**Menschlichkeit Österreich Platform Architecture**

---

## 🏗️ System Architecture

### High-Level Design

```
┌───────────────────────────────────────────────────────────┐
│                    User Layer                             │
│  • Web Browsers (Desktop/Mobile)                          │
│  • Mobile Apps (PWA)                                      │
│  • API Clients (Third-Party Integrations)                │
└───────────────────────────────────────────────────────────┘
                            ↓
┌───────────────────────────────────────────────────────────┐
│                  Application Layer                        │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Website  │  │   CRM    │  │   API    │  │ Frontend │ │
│  │WordPress │  │ Drupal/  │  │ FastAPI  │  │  React   │ │
│  │          │  │ CiviCRM  │  │          │  │          │ │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│                                                           │
│  ┌──────────┐  ┌──────────┐                              │
│  │  Games   │  │   n8n    │                              │
│  │ Platform │  │Automation│                              │
│  └──────────┘  └──────────┘                              │
└───────────────────────────────────────────────────────────┘
                            ↓
┌───────────────────────────────────────────────────────────┐
│                   Data Layer                              │
│                                                           │
│  ┌────────────────┐  ┌────────────────┐                  │
│  │   PostgreSQL   │  │    MariaDB     │                  │
│  │ (3 Databases)  │  │ (14 Databases) │                  │
│  └────────────────┘  └────────────────┘                  │
│                                                           │
│  ┌────────────────┐                                       │
│  │     Redis      │                                       │
│  │ (Cache/Queue)  │                                       │
│  └────────────────┘                                       │
└───────────────────────────────────────────────────────────┘
                            ↓
┌───────────────────────────────────────────────────────────┐
│              Infrastructure Layer                         │
│  • Plesk Hosting (Germany)                               │
│  • External DB Servers (Austria/Germany)                 │
│  • Nextcloud (File Storage)                              │
│  • Monitoring (Grafana, Prometheus)                      │
└───────────────────────────────────────────────────────────┘
```

---

## 📦 Service Breakdown

### 1. Website (WordPress)

- **Purpose**: Public-facing website
- **Port**: 80/443
- **Database**: `mo_main` (MariaDB)
- **Stack**: WordPress, PHP 8.1+
- **Hosting**: Plesk

### 2. CRM (Drupal 10 + CiviCRM)

- **Purpose**: Member & donation management
- **Port**: 8000
- **Database**: `mo_crm` (External MariaDB)
- **Stack**: Drupal 10, CiviCRM 5.x, PHP 8.1+
- **Key Features**:
  - Member database (DSGVO-compliant)
  - SEPA payment processing
  - Event management
  - Donation tracking

### 3. API Backend (FastAPI)

- **Purpose**: REST API for all services
- **Port**: 8001
- **Database**: Shared (via Prisma)
- **Stack**: Python 3.11+, FastAPI, Pydantic
- **Key Features**:
  - JWT authentication
  - PII sanitization middleware
  - OpenAPI documentation
  - Rate limiting

### 4. Frontend (React)

- **Purpose**: Modern web interface
- **Port**: 3000 (dev) / 443 (prod)
- **Stack**: React 18, TypeScript 5, Tailwind CSS, Vite
- **Key Features**:
  - Design system integration (Figma)
  - Accessibility (WCAG AA)
  - PWA support
  - Austrian German localization

### 5. Gaming Platform

- **Purpose**: Gamification & engagement
- **Port**: 3000
- **Database**: `mo_games` (External MariaDB)
- **Stack**: Prisma ORM, PostgreSQL
- **Key Features**:
  - XP/Level system
  - Achievement tracking
  - Leaderboards

### 6. n8n Automation

- **Purpose**: Workflow automation
- **Port**: 5678
- **Database**: `mo_n8n` (External MariaDB)
- **Stack**: n8n (Docker), Node.js
- **Key Features**:
  - Email workflows
  - CiviCRM integration
  - Deployment notifications
  - DSGVO automation

---

## 🗄️ Database Architecture

### PostgreSQL (External Server)

| Database       | Purpose                    | Schema Owner    |
| -------------- | -------------------------- | --------------- |
| `mo_idp`       | Keycloak Identity Provider | `svc_idp`       |
| `mo_grafana`   | Grafana Dashboards         | `svc_grafana`   |
| `mo_discourse` | Forum (Optional)           | `svc_discourse` |

### MariaDB - Plesk (localhost)

| Database        | Purpose               | Schema Owner     |
| --------------- | --------------------- | ---------------- |
| `mo_main`       | WordPress Website     | `svc_main`       |
| `mo_votes`      | Voting System         | `svc_votes`      |
| `mo_support`    | Support Tickets       | `svc_support`    |
| `mo_newsletter` | Newsletter Management | `svc_newsletter` |
| `mo_forum`      | Community Forum       | `svc_forum`      |

### MariaDB - External Server

| Database       | Purpose          | Schema Owner    |
| -------------- | ---------------- | --------------- |
| `mo_crm`       | Drupal + CiviCRM | `svc_crm`       |
| `mo_n8n`       | n8n Workflows    | `svc_n8n`       |
| `mo_hooks`     | Webhook Logs     | `svc_hooks`     |
| `mo_consent`   | DSGVO Consent    | `svc_consent`   |
| `mo_games`     | Gaming Platform  | `svc_games`     |
| `mo_analytics` | Analytics/ETL    | `svc_analytics` |
| `mo_api_stg`   | API Staging      | `svc_api_stg`   |
| `mo_admin_stg` | Admin Staging    | `svc_admin_stg` |
| `mo_nextcloud` | File Storage     | `svc_nextcloud` |

---

## 🔐 Security Architecture

### Multi-Layer Security

```
┌─────────────────────────────────────────┐
│          Edge Security                  │
│  • TLS 1.3 (All Connections)           │
│  • WAF (Web Application Firewall)      │
│  • DDoS Protection                      │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│       Application Security              │
│  • Authentication (JWT, OAuth)          │
│  • Authorization (RBAC)                 │
│  • Input Validation (Pydantic)          │
│  • PII Sanitization                     │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│         Data Security                   │
│  • Encryption at Rest (pgcrypto)        │
│  • Encryption in Transit (TLS)          │
│  • Access Control (Database Roles)      │
│  • Audit Logging                        │
└─────────────────────────────────────────┘
                ↓
┌─────────────────────────────────────────┐
│      Infrastructure Security            │
│  • Firewall Rules (IP Whitelisting)     │
│  • SSH Key Authentication               │
│  • Regular Security Patches             │
│  • Monitoring & Alerting                │
└─────────────────────────────────────────┘
```

### Security Scanning Pipeline

```yaml
On Every Push:
  - CodeQL (SAST - JavaScript/Python)
  - Semgrep (Pattern-based Analysis)
  - OSV Scanner (Vulnerability Database)
  - Gitleaks (Secret Detection)

Daily:
  - Trivy (Container & Dependency Scan)
  - Dependabot (Dependency Updates)

Weekly:
  - OpenSSF Scorecard (Best Practices)
  - Full Security Audit

On Release:
  - SBOM Generation (CycloneDX)
  - Attestation (SLSA)
```

---

## 🌐 Network Architecture

### Domain Structure

```
menschlichkeit-oesterreich.at/
├── www.menschlichkeit-oesterreich.at (Website)
├── api.menschlichkeit-oesterreich.at (API Backend)
├── crm.menschlichkeit-oesterreich.at (CRM System)
├── games.menschlichkeit-oesterreich.at (Gaming Platform)
├── n8n.menschlichkeit-oesterreich.at (Automation)
├── admin.menschlichkeit-oesterreich.at (Admin Panel)
├── grafana.menschlichkeit-oesterreich.at (Monitoring)
├── status.menschlichkeit-oesterreich.at (Status Page)
└── [staging]
    ├── api.stg.menschlichkeit-oesterreich.at
    └── admin.stg.menschlichkeit-oesterreich.at
```

### Firewall Rules

```yaml
Inbound:
  - Port 80/443: Public (All IPs)
  - Port 22: SSH (Admin IPs only)
  - Port 3306/5432: Database (Plesk Server IP only)
  - Port 5678: n8n (Internal only)

Outbound:
  - Port 443: HTTPS (All - for updates, API calls)
  - Port 25/587: SMTP (Email sending)
  - Port 3306/5432: Database (External DB servers)
```

---

## 📊 Data Flow Diagrams

### Member Registration Flow

```
┌─────────┐    1. Fill Form    ┌──────────┐
│  User   │ ─────────────────> │ Frontend │
└─────────┘                     └──────────┘
                                      │
                                  2. POST /api/members
                                      ↓
                               ┌──────────┐
                               │   API    │
                               └──────────┘
                                      │
                             3. Validate & Sanitize PII
                                      ↓
                               ┌──────────┐
                               │   CRM    │ ←── 4. Create Contact
                               └──────────┘
                                      │
                              5. Store with Consent
                                      ↓
                               ┌──────────┐
                               │ Database │
                               └──────────┘
                                      │
                              6. Send Welcome Email
                                      ↓
                               ┌──────────┐
                               │   n8n    │
                               └──────────┘
```

### DSGVO Data Subject Request Flow

```
┌─────────┐  1. Request Export  ┌──────────┐
│  User   │ ─────────────────> │   API    │
└─────────┘                     └──────────┘
                                      │
                              2. Authenticate & Validate
                                      ↓
                               ┌──────────┐
                               │   CRM    │ ←── 3. Query all user data
                               └──────────┘
                                      │
                              4. Aggregate from all DBs
                                      ↓
                      ┌─────────────────────────────┐
                      │  mo_crm, mo_games,         │
                      │  mo_consent, mo_newsletter │
                      └─────────────────────────────┘
                                      │
                              5. Sanitize & Format (JSON/PDF)
                                      ↓
                               ┌──────────┐
                               │   API    │
                               └──────────┘
                                      │
                              6. Encrypt & Send Email
                                      ↓
                               ┌─────────┐
                               │  User   │
                               └─────────┘
```

---

## 🔄 Deployment Architecture

### CI/CD Pipeline

```
┌─────────────┐
│  Developer  │
│  git push   │
└─────────────┘
       │
       ↓
┌─────────────────────────────────────────┐
│        GitHub Actions                   │
│  1. Lint & Format                       │
│  2. Unit Tests                          │
│  3. Security Scans (CodeQL, Semgrep)    │
│  4. Build Artifacts                     │
│  5. E2E Tests (Playwright)              │
│  6. SBOM Generation                     │
└─────────────────────────────────────────┘
       │
       ↓ (if all green)
┌─────────────────────────────────────────┐
│         Deployment                      │
│  • Staging: Auto-deploy on PR merge     │
│  • Production: Manual approval          │
│  • Rollback: One-click revert           │
└─────────────────────────────────────────┘
       │
       ↓
┌─────────────────────────────────────────┐
│       Plesk Infrastructure              │
│  • SSH Deploy                           │
│  • Service Restart                      │
│  • Health Checks                        │
│  • n8n Notification                     │
└─────────────────────────────────────────┘
```

---

## 📈 Scalability & Performance

### Horizontal Scaling Strategy

- **Stateless Services**: API, Frontend (can scale horizontally)
- **Stateful Services**: CRM, Databases (vertical scaling or read replicas)
- **Caching**: Redis for session storage, API responses
- **CDN**: Static assets served via CDN

### Performance Targets

| Service  | Response Time  | Throughput | Availability |
| -------- | -------------- | ---------- | ------------ |
| API      | < 100ms (p95)  | 1000 req/s | 99.9%        |
| CRM      | < 500ms (p95)  | 100 req/s  | 99.5%        |
| Frontend | < 2s (LCP)     | -          | 99.9%        |
| Database | < 50ms (query) | 10K qps    | 99.99%       |

---

## 🛠️ Technology Decisions (ADRs)

### ADR-001: Multi-Service Architecture

- **Decision**: Separate services instead of monolith
- **Rationale**: Independent scaling, tech stack flexibility
- **Trade-offs**: Increased complexity, distributed transactions

### ADR-002: PostgreSQL + MariaDB

- **Decision**: Use both PostgreSQL and MariaDB
- **Rationale**: Plesk limits (5 DBs), specific tool requirements
- **Trade-offs**: Multiple DB systems to maintain

### ADR-003: DSGVO-First Design

- **Decision**: Privacy-by-design from day one
- **Rationale**: Legal compliance, user trust
- **Trade-offs**: Additional development overhead

See [docs/architecture/ADRs/](../architecture/ADRs/) for full ADR list.

---

## 📚 Further Reading

- [Services Guide](../getting-started/services-and-ports.md) - Detailed service documentation
- [Infrastructure](../infrastructure/SUBDOMAIN-REGISTRY.md) - Hosting & networking details
- [Security Architecture](../security/README.md) - Deep-dive into security
- [Privacy by Design](../privacy/art-05-06-grundsaetze.md) - DSGVO implementation

---

**Last Updated**: 2025-10-12  
**Version**: 1.0  
**Maintainer**: Architecture Team

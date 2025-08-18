# Mission Statement

Our mission is to empower organizations to discover, secure, and maximize strategic grant opportunities, transparently measure impact, and seamlessly manage projects through an intelligent, real-time analytics platform that combines advanced data pipelines, AI-driven insights, and a user-centric experience.

# Master Vision Overview

We envision a unified ecosystem where grant seekers, administrators, and stakeholders collaborate seamlessly to plan, execute, and analyze projects, harnessing live data and predictive analytics to make informed decisions that drive measurable social and economic impact.

# Strategic Roadmap

1. **MVP Stabilization (v1.x)** – Core grant discovery, application tracking, and live data ingestion.
2. **AI-Assisted Writing (v2.x)** – Integrated AI grant writer and success probability analytics.
3. **Enterprise Expansion (v3.x)** – White-label support, multi-tenant architecture, and custom rule engines.
4. **Platform Marketplace (v4.x)** – Third-party integrations, open APIs, and revenue-sharing extensions.

# Technical Architecture

* **Frontend** – Next.js + React + Tailwind CSS (static generation with dynamic data fetching).
* **Backend** – Node.js + Express + PostgreSQL with GraphQL gateway.
* **Data Pipeline** – Python ETL jobs, Airflow orchestration, real-time WebSocket streams.
* **Infrastructure** – Docker, Render.com for PaaS deployment, GitHub Actions for CI/CD.
* **Impact Analyzer Engine** – Rust-based microservice for KPI computation and reporting.
* **Project Management Service** – Full-featured module for milestones, tasks, and Gantt charts.

```mermaid
graph TD
    subgraph Frontend
        A[Next.js (React)]
    end
    subgraph Backend_APIs
        B[Node.js GraphQL Gateway]
        D[Impact Analyzer Engine]
    end
    subgraph Data_Pipeline
        C[Airflow ETL Jobs]
    end
    A -- GraphQL --> B
    B -- SQL --> DB[(PostgreSQL)]
    B -- Cache --> Redis[(Redis)]
    C -- Transform --> DB
    External[External Data Sources] --> C
    D -- KPI Reports --> B
```

# Revenue Model

| Tier | Features | Monthly Price |
|------|----------|---------------|
| Freemium | Basic grant search, limited analytics | $0 |
| Pro | Unlimited searches, AI writer, team collaboration | $49 |
| Super | White-label, API access, priority support | $299 |

# Core Principles & Standards

1. **Data Integrity** – Prefer live authoritative sources; no stale test data in production.
2. **Security First** – Follow OWASP Top 10, principle of least privilege.
3. **User-Centric Design** – Decisions driven by real user feedback and usability testing.

# Development Principles

* **TypeScript Everywhere** – Strict mode, zero implicit `any`, ESLint + Prettier enforced.
* **Fail Fast** – Surface errors early via exhaustive testing & CI checks.
* **Modularity** – Small, reusable components and services.

# Data Design Principles

1. **Single Source of Truth** – Each fact lives in exactly one place.
2. **Explicit Schemas** – All datasets are version-controlled and documented.
3. **Immutable Events** – Append-only event logs for auditability.

## Data Organization Examples (Correct vs Incorrect)

```sql
-- ✅ Correct: separate table for many-to-many relationship
CREATE TABLE grant_application_topics (
  application_id UUID REFERENCES applications(id),
  topic_id        UUID REFERENCES topics(id),
  PRIMARY KEY (application_id, topic_id)
);

-- ❌ Incorrect: comma-separated string inside a single column
ALTER TABLE applications ADD COLUMN topics TEXT; -- hard to query & validate
```

# Service Design

* **Stateless APIs** – Scale horizontally.
* **Idempotent Endpoints** – Safe retries.
* **OpenAPI Spec** – Auto-generated docs.

# Code Organization

```
src/
 ├─ components/        # Reusable UI widgets
 ├─ pages/             # Next.js route handlers
 ├─ lib/               # Shared business logic
 └─ types/             # Global TypeScript interfaces
```

# Implementation Guidelines

1. Write failing tests first (TDD preferred).
2. Commit in small, self-contained units.
3. Reference issue or ticket number in each PR.

# Common Pitfalls

* Missing environment variables in deployment.
* Forgetting to invalidate SWR caches after data mutations.
* Over-fetching data causing unnecessary re-renders.

# Best Practices

* Prefer `useSWR` for data fetching.
* Memoize expensive selectors with `reselect`.
* Use feature flags for experimental functionality.

# Development Workflow

## Environment Setup

1. Clone repository.
2. `cp .env.example .env` and fill in secrets.
3. `npm install && npm run dev`.

### Local Development (Cursor, features)

* Cursor automatically reloads on file change.
* Use the built-in Playground for GraphQL queries.

## Git Workflow

### Branch Strategy

* `main` – Production.
* `develop` – Integration.
* `feature/*`, `fix/*`, `

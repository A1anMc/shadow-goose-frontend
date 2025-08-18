# Mission Statement

Our mission is to empower organizations to discover, secure, and maximize strategic grant opportunities through an intelligent, real-time analytics platform that combines advanced data pipelines, AI-driven insights, and a user-centric experience.

# Master Vision Overview

We envision a unified ecosystem where grant seekers, administrators, and stakeholders collaborate seamlessly, leveraging live data and predictive analytics to make informed decisions that drive meaningful social and economic impact.

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
* `feature/*`, `fix/*`, `chore/*` – Topic branches.

### Commit Guidelines

Follow Conventional Commits, e.g., `feat(auth): add JWT refresh flow`.

## Development Process

1. **Feature Planning** – Create ticket & design spec.
2. **Implementation** – Open draft PR early.
3. **Code Review** – At least two approvals required.
4. **Deployment** – Merge to `main` triggers production pipeline.

# Technical Implementation

## Database Design

### Schema Organization

* **Core entities** – `users`, `grants`, `applications`, `projects`.
* **Platform registry** – `platforms` table stores integration metadata.
* **Platform-specific data** – Partitioned tables per provider when necessary.

# Quality Assurance

## Testing Strategy

* Pyramid: 70% unit, 20% integration, 10% e2e.

### Unit Tests

* Jest + ts-jest, target 90% coverage.

### Integration Tests

* Supertest against in-memory PostgreSQL.

## Code Quality Standards

* Airbnb Style Guide + custom ESLint rules.

### Error Handling

* Centralized Express `errorHandler` with structured JSON responses.

# Deployment & Operations

## Staging Deployment

* Automatic via PR merge into `develop`.

## Production Deployment

* Manual approval on Render dashboard after CI success.

## CI/CD Pipeline Notes

* GitHub Actions → Lint → Test → Build Docker → Deploy.

# Templates & Examples

## Service Template

```ts
export const makeService = (deps: Deps) => {
  const doSomething = async () => {
    // ...
  };
  return { doSomething };
};
```

## API Endpoint Template

```ts
router.post('/grants', async (req, res) => {
  const dto = validate(schema, req.body);
  const result = await grantService.create(dto);
  res.status(201).json(result);
});
```

# Reference & Resources

## Documentation Standards

* All public functions must include JSDoc.
* ADRs stored in `/docs/adr/`.

## Quick Reference

* `npm run test:watch` – watch tests.
* `npm run lint --fix` – auto-fix style issues.

## Common Patterns

* **Singleton** – `database.ts` maintains single PG pool.
* **Factory** – Service creators with dependency injection.
* **Repository** – Abstract DB access for unit testing.

### Error Handling Patterns

* Use `Result<T, E>` types with exhaustive switches.

# Appendices

## Branch Protection Guide

* `main` requires passing checks & PR review.

## User Tier Guide (Freemium, Pro, Super)

| Tier | Limits | Support |
|------|--------|---------|
| Freemium | 50 API calls/day | Community |
| Pro | 10k API calls/day | Email |
| Super | Unlimited | Dedicated CSM |

## Technical Improvements (v2.3.0 / v2.4.0)

* v2.3.0 – GraphQL federation, improved caching.
* v2.4.0 – Audit logging, role-based access control.

## Caching Strategy

* Redis layer for query results, TTL 5 min.

## Data Retention Policy

* Delete PII after 3 years unless renewed consent.

## Database Schema

* ERD diagram located at `/docs/erd.png`.

## API Rate Limits

* 100 requests/minute per Pro token; burst 200.

## Render Deploy Integration

* Runtime secrets managed via Render’s dashboard.

## Troubleshooting Guide

1. Check Render logs for 5xx errors.
2. Run `scripts/check-backend-health.sh` locally.
3. Verify database connectivity.
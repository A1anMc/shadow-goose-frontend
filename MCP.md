## Master Control Prompt (MCP)

Non‑negotiable gates before production:

- Lint clean: `npm run lint`
- Type clean: `npm run typecheck`
- Build success: `npm run build`
- Tests ≥ 80% coverage on touched code
- Security clean: `npm audit --audit-level=high`
- Commit discipline: Conventional Commits, commitlint
- Branch protection: PR-only to `main`; required checks green

Legacy-proofing:

- No mocks/stubs/dev-only code in production paths
- Remove unused imports/vars and dead code
- Explicit types; no `any` in production code
- Regression tests for fixed defects

Render–Postgres infra:

- Correct envs set (`NEXT_PUBLIC_API_URL`, DB creds)
- Connection pooling, migrations, indexes verified
- Cache discipline: purge/invalidate on deploy as needed
- Post-deploy verify: buildId + commit SHA + live DB query

Execution order:

1) Pre-Deployment: branch off, resolve lint/type/build/test/security locally
2) CI Validation: PR must pass all gates
3) Controlled Merge & Deploy: merge on green, trigger Render, invalidate caches
4) Post-Deploy Verification: E2E check login→fetch→render, logs clean

Failure response:

- Halt deployment, roll back to last good, diagnose, add regression tests, resume only when gates pass

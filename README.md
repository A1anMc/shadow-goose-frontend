# Shadow Goose Frontend

This repository contains the SGE Impact Dashboard built with Next.js.

## Master Control Prompt (MCP)

Operational rules are defined in `MCP.md` and enforced via CI:

- Lint clean: `npm run lint`
- Type clean: `npm run typecheck`
- Build success: `npm run build`
- Tests with coverage ≥ 80%
- Security clean: `npm audit --audit-level=high`
- No direct commits to `main`; PR-only with required checks

## Local development

```
npm ci
npm run dev
```

Env variables (set in `.env.local`):

- `NEXT_PUBLIC_API_URL` – Backend base URL

## Deployment

Render builds from `main`. After deploy, verify:

- BuildId served on `/dashboard`
- Commit SHA matches latest
- Health check 200

## Data flow

Login → JWT → API calls to `NEXT_PUBLIC_API_URL` → UI render. No mock data in production paths.

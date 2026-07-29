# Navin Backend — AI Agent Instructions

## 1. Overview
This is a logistics/supply-chain API: shipments, org roles, telemetry, and Stellar blockchain (proof-of-delivery, escrow).

Stack: TypeScript Strict · Express · MongoDB/Mongoose · Zod · JWT+Redis · Jest+Supertest.

## 2. Architecture
Request flow:

`Route → validateRequest(Zod) → requireAuth → requireRole → asyncHandler(Controller) → Service → Model/Repo`

| Directory | Purpose |
|-----------|---------|
| `src/modules/<domain>/` | Self-contained domain: routes, controller, service, model, validation |
| `src/infra/` | DB, Redis, queues, Socket.IO |
| `src/services/` | External integrations (Stellar, storage) |
| `src/shared/` | Errors, middleware, types, constants, plugins |
| `tests/` | Integration and API tests |

## 3. Conventions (Hard Rules)

**Response envelope** — Always return `{ success, message, data, meta? }` via `sendResponse()`. Dates as ISO 8601 UTC. Put pagination in `meta`, not the body.

**Errors** — Controllers never catch; wrap them in `asyncHandler`. Services throw `AppError(status, msg, code)`, never bare `Error`. Codes look like `ERR_<DOMAIN>_<DESC>` and live in `src/shared/http/errors.ts`.

**Types** — No `any` (prefer `unknown`). Services return plain objects, not Mongoose documents. One declaration per name per file. Use `import type` for types only. Relative imports end in `.js`.

**Security** — Protect every route with `requireAuth` + `requireRole`, or mark it `// PUBLIC: <reason>`. Never log secrets. Strip `passwordHash` in `toJSON`. Don't spread `req.query` into DB queries. Use `logger`, not `console.*`.

**Database** — Soft-delete with `deletedAt`. Models use `isoDatePlugin` and soft-delete pre-hooks. Zod owns request shape; Mongoose owns data integrity.

## 4. Testing & Documentation
Cover every endpoint for **200**, **401**, **403**, and **400/422**. Mock externals (Stellar, storage, IoT). Run `npm test` before you call it done.

Keep `docs/swagger.yaml` in sync with every endpoint change.

## 5. Agent Skills Pipeline
After writing code, run these in order and fix issues before moving on:

1. **Cross-Check** — `.agents/skills/cross-check/SKILL.md` (route ↔ controller ↔ service ↔ model ↔ Zod ↔ Swagger)
2. **Cleanup** — `.agents/skills/cleanup/SKILL.md` (duplicates, conventions, security, `any`)
3. **Document** — `.agents/skills/document/SKILL.md` (Swagger, JSDoc, error codes)

## 6. Quality Gates
Treat these as hard stops:

| Gate | Rule |
|------|------|
| Verify-first | Don't assume a symbol exists — open the file |
| One-declaration | Each identifier once per file; search before adding |
| Compile-first | Mentally check types after edits; run `npm run build` at the end |
| Single-concern | One edit = one concern; 4+ files → outline first |
| No floating promises | Async work in `setImmediate` needs `.catch()` or try/catch |

## 7. Architecture Boundaries
Modules stay self-contained. Cross-module imports only along these lines:

| Consumer | Allowed Dependencies |
|----------|---------------------|
| `auth` | `users` |
| `invitations` | `users` |
| `ledger` | `shipments` (shared types) |
| `payments` | `shipments` (model refs) |
| `shipments` | `payments` (dispute/settlement hooks) |
| `telemetry` | `shipments` (model refs) |
| `users` | `organizations` |
| `webhooks` | `shipments`, `telemetry` |
| `analytics` | `shipments`, `payments` |
| `events` | `infra/redis` |
| `notifications` | `users` (preferences) |

Prefer domain events over direct service calls. Never import a sibling controller. Avoid circular deps — pull shared logic into `src/shared/` or emit events. When you add a new dependency, note it here and in the consumer module's `AGENTS.md`.

## 8. Pre-Commit Checklist
- [ ] No `any` · no `console.*` · no `try/catch` in controllers
- [ ] No `res.json()` (use `sendResponse`) · no `new Error()` (use `AppError`)
- [ ] `requireAuth` on all routes (or `// PUBLIC: <reason>`)
- [ ] No `...rest` into DB queries · no duplicate imports/declarations
- [ ] Zod schemas export inferred types · models use `isoDatePlugin` + soft-delete
- [ ] Swagger updated · `npm run build` passes · `npm test` passes
- [ ] **AGENTS.md reviewed if conventions, boundaries, or module structure changed**

### Clean-Install Build Triage (hard rule)

Build triage must be based strictly on `package.json`, `package-lock.json`, and source files.

- **Never** assume a package is available because it exists locally — CI runs `npm ci` from scratch.
- If a new runtime import is added, it **must** go in `dependencies` (not `devDependencies`).
- Run `npm run check:deps` before committing to catch undeclared imports.
- To reproduce CI locally: `rm -rf node_modules && npm ci && npm run build`
- CI pins Node.js 20 via `.github/workflows/typecheck.yml` and always uses `npm ci`.

## 9. Token Efficiency
Read before you write. Batch parallel reads. Cite `file:line`. Prefer small diffs. Skip filler prose.

## 10. Reviewing & Updating Agent Documentation
This file is guidance, not scripture. Update it by hand when conventions actually change so the next person (or agent) isn't working from stale advice.

| Change | Review these files |
|--------|------------------|
| New module | Root §7; add module `AGENTS.md` from `__template__` |
| Convention change | Root §3; affected module `AGENTS.md` files |
| Structural rename in a module | That module's `AGENTS.md` (only if the pattern changed) |
| New cross-module dependency | Root §7; consumer module's `AGENTS.md` |
| New shared utility | Root §2; `src/shared/` docs if any |
| Stale prompt | `.agents/prompts/*.md` |

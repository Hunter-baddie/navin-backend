# Navin Backend — AI Agent Instructions

## 1. Overview
Logistics/supply-chain API (shipments, org roles, telemetry, Stellar blockchain).
Stack: TypeScript Strict · Express · MongoDB/Mongoose · Zod · JWT+Redis · Jest+Supertest.

## 2. Architecture
Flow: `Route → validateRequest(Zod) → requireAuth → requireRole → asyncHandler(Controller) → Service → Model/Repo`

| Directory | Purpose |
|-----------|---------|
| `src/modules/<domain>/` | Self-contained: routes, controller, service, model, validation |
| `src/infra/` | DB, Redis, Queues, Socket.IO |
| `src/services/` | External integrations (Stellar, Storage) |
| `src/shared/` | Errors, middleware, types, constants, plugins |
| `tests/` | Integration + API tests |

## 3. Conventions (Hard Rules)
- **Response envelope:** `{ success, message, data, meta? }`. Use `sendResponse()` exclusively. Dates → ISO 8601 UTC.
- **Errors:** Controllers NO `try/catch` (use `asyncHandler`). Services throw `AppError(status, msg, code)`. Codes: `ERR_<DOMAIN>_<DESC>` registered in `src/shared/http/errors.ts`.
- **Types:** NO `any` (use `unknown`). Services return plain interfaces, not Mongoose Documents. One declaration per identifier per file. `import type` for type-only. Paths end `.js`.
- **Security:** All routes `requireAuth` + `requireRole` unless `// PUBLIC: <reason>`. Strip `passwordHash` in `toJSON`. No `...rest` spread from `req.query` into DB queries. No `console.*` — use `logger`.
- **Database:** Soft deletes via `deletedAt`. Models use `isoDatePlugin` + soft-delete pre-hooks. Zod validates requests; Mongoose validates data integrity.

## 4. Testing & Documentation
- Every endpoint needs tests: **200** · **401** · **403** · **400/422**. Mock externals. Run `npm test`.
- Update `docs/swagger.yaml` for every endpoint change.

## 5. Agent Skills Pipeline (run in order)
1. **Cross-Check** — `.agents/skills/cross-check/SKILL.md` (Route↔Controller↔Service↔Model↔Zod↔Swagger)
2. **Cleanup** — `.agents/skills/cleanup/SKILL.md` (duplicates, conventions, security, `any`)
3. **Document** — `.agents/skills/document/SKILL.md` (Swagger, JSDoc, error codes)

## 6. Quality Gates
| Gate | Rule |
|------|------|
| Verify-first | Never assume a function/type/import exists. Read the file. |
| One-declaration | Every identifier declared exactly once per file. Search before adding. |
| Compile-first | Mentally verify compilation after every edit. Run `npm run build` at end. |
| Single-concern | One edit = one concern. 4+ files → outline plan first. |
| No floating promises | `setImmediate(async...)` must have `.catch()` or try/catch inside. |

## 7. Architecture Boundaries
Cross-module imports allowed only along these directions:

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

Prefer domain events over direct service calls. Never import a sibling controller. Never create circular deps — extract shared logic into `src/shared/` or use events. Document new deps here and in the consumer module's `AGENTS.md`.

## 8. Pre-Commit Checklist
- [ ] No `any` · No `console.*` · No `try/catch` in controllers
- [ ] No `res.json()` (use `sendResponse`) · No `new Error()` (use `AppError`)
- [ ] `requireAuth` on all routes (or `// PUBLIC: <reason>`)
- [ ] No `...rest` spread into DB queries · No duplicate imports/declarations
- [ ] Zod schemas export inferred types · Models use `isoDatePlugin` + soft-delete
- [ ] Swagger updated · `npm run build` passes · `npm test` passes
- [ ] **AGENTS.md reviewed if conventions, boundaries, or module structure changed**

## 9. Token Efficiency
Read before writing. Batch parallel reads. Cite file:line. Minimal diffs. No filler prose.

## 10. Reviewing & Updating Agent Documentation
These instructions are **guidance**, not immutable rules. Review and update **manually** when conventions evolve.

| Change | Review these files |
|--------|------------------|
| New module added | Root `AGENTS.md` §7; create module `AGENTS.md` from `__template__` |
| Convention changed | Root `AGENTS.md` §3; affected module `AGENTS.md` files |
| File added/removed/renamed in a module | That module's `AGENTS.md` — only if structural pattern changes |
| New cross-module dependency | Root `AGENTS.md` §7; consumer module's `AGENTS.md` |
| New shared utility or middleware | Root `AGENTS.md` §2; `src/shared/` docs if present |
| Prompt template no longer accurate | `.agents/prompts/*.md` |

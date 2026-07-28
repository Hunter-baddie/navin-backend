# Module Template — AI Agent Context

> Copy this directory to create a new domain module:  
> `cp -r src/modules/__template__ src/modules/<domain>`  
> Then rename files from `template*` to `<domain>*` and adapt the content.

## Route Prefix

Register in `src/app.ts` as:  
`app.use('/api/<plural-domain>', <domain>Router);`

## Structure Pattern

| Pattern | Purpose |
|---------|---------|
| **Routes** | Express router: `requireAuth` → `requireRole` → `validateRequest(Zod)` → `asyncHandler(controller)` |
| **Controller** | Thin handlers: extract req fields, call service, `sendResponse()`. No `try/catch`. |
| **Service** | Business logic: throw `AppError`. Return plain interfaces, never Mongoose Documents. |
| **Model** | Mongoose schema: `isoDatePlugin`, `deletedAt`, soft-delete pre-hooks, `toJSON` strip secrets. |
| **Validation** | Zod schemas for `body` / `query` / `params`. Export inferred types. |
| **Tests** | Jest + Supertest: 200 · 401 · 403 · 400. Mock externals. |

## Conventions Checklist

- [ ] All imports end with `.js`.
- [ ] `import type` for type-only imports.
- [ ] One declaration per identifier per file.
- [ ] Controllers: no `try/catch`, use `asyncHandler`.
- [ ] Controllers: use `sendResponse()` exclusively.
- [ ] Services: throw `AppError(status, message, code)`; never `new Error()`.
- [ ] Error codes registered in `src/shared/http/errors.ts` with `ERR_<DOMAIN>_<DESC>`.
- [ ] Zod schemas export inferred types.
- [ ] Model has `deletedAt` and soft-delete pre-hooks.
- [ ] Public routes marked with `// PUBLIC: <reason>`.
- [ ] Swagger `docs/swagger.yaml` updated for every endpoint.
- [ ] No `any` — use `unknown` + narrow guards.
- [ ] No `console.*` — use `logger` from `src/shared/logger/logger.js`.
- [ ] No `...rest` spread from `req.query` into DB queries.

## Cross-Module Dependencies

This template imports from:
- `src/shared/*` (allowed from any module)
- `src/infra/*` (allowed from any module)

Avoid importing from sibling modules unless the dependency graph explicitly allows it (see root `AGENTS.md` § Architecture Boundaries).

## Maintenance

This file should be reviewed and updated **manually** when the module's conventions or dependencies change. Do not auto-generate or auto-update without human review. See root `AGENTS.md` § 10 for guidance.

# Module Template — AI Agent Context

> Copy this directory to create a new domain module:  
> `cp -r src/modules/__template__ src/modules/<domain>`  
> Then rename all `template*` files to `<domain>*` and update the content.

## Route Prefix

Registered in `src/app.ts` as:  
`app.use('/api/<plural-domain>', <domain>Router);`

## Files

| File | Purpose |
|------|---------|
| `<domain>.routes.ts` | Express router wiring: `requireAuth` → `requireRole` → `validateRequest(Zod)` → `asyncHandler(controller)` |
| `<domain>.controller.ts` | Thin handlers: extract req fields, call service, `sendResponse()`. No `try/catch`. |
| `<domain>.service.ts` | Business logic: throw `AppError` only. Return plain interfaces, never Mongoose Documents. |
| `<domain>.model.ts` | Mongoose schema: `isoDatePlugin`, `deletedAt`, soft-delete pre-hooks, `toJSON` strip secrets. |
| `<domain>.validation.ts` | Zod schemas for `body` / `query` / `params`. Export inferred types (`export type X = z.infer<typeof XSchema>`). |
| `<domain>.test.ts` | Jest + Supertest: 200 happy · 401 unauth · 403 role · 400 validation. Mock externals. |

## Conventions Checklist

- [ ] All imports end with `.js`.
- [ ] `import type` for type-only imports.
- [ ] One declaration per identifier per file.
- [ ] Controllers: no `try/catch`, use `asyncHandler`.
- [ ] Controllers: use `sendResponse()` exclusively; never `res.json()` or `res.send()`.
- [ ] Services: throw `AppError(status, message, code)`; never `new Error()`.
- [ ] Error codes registered in `src/shared/http/errors.ts` with `ERR_<DOMAIN>_<DESC>` pattern.
- [ ] Zod schemas export inferred types.
- [ ] Model has `deletedAt: { type: Date, default: null }` and soft-delete pre-hooks.
- [ ] Public routes marked with `// PUBLIC: <reason>`.
- [ ] Swagger `docs/swagger.yaml` updated for every endpoint.
- [ ] No `any` — use `unknown` + narrow guards.
- [ ] No `console.*` — use `logger` from `src/shared/logger/logger.js`.
- [ ] No `...rest` spread from `req.query` into DB queries.

## Domain-Specific Error Codes

Register new codes in `src/shared/http/errors.ts`:

```ts
TEMPLATE_NOT_FOUND: 'ERR_TEMPLATE_NOT_FOUND',
```

## Cross-Module Dependencies

This template imports from:
- `src/shared/*` (allowed from any module)
- `src/infra/*` (allowed from any module)

Avoid importing from sibling modules unless the dependency graph explicitly allows it (see root `AGENTS.md` § Architecture Boundaries).


## Maintenance

When you add, remove, or rename files in this module, or change its cross-module dependencies, update this `AGENTS.md` in the same PR. See root `AGENTS.md` § 10 for the full maintenance policy.

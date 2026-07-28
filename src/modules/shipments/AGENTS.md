# shipments Module — AI Agent Context

> Route prefix: `/api/shipments`

## Structure Pattern

Modules follow a consistent layout. Expect these file kinds (exact names may vary):

| Pattern | Purpose |
|---------|---------|
| **Routes** | Express router wiring: `requireAuth` → `requireRole` → `validateRequest(Zod)` → `asyncHandler(controller)` |
| **Controller** | Thin handlers: extract request fields, call service, return via `sendResponse()`. No `try/catch`. |
| **Service** | Business logic: throw `AppError`, return plain objects (never Mongoose Documents). |
| **Model** | Mongoose schema: `isoDatePlugin`, `deletedAt` field, soft-delete pre-hooks. |
| **Validation** | Zod schemas for `body` / `query` / `params`. Export inferred types (`export type X = z.infer<typeof XSchema>`). |
| **Tests** | Jest + Supertest: 200 happy · 401 unauth · 403 role · 400 validation. |

## Domain-Specific Error Codes

Error codes follow the `ERR_SHIPMENTS_<DESC>` pattern and are registered in `src/shared/http/errors.ts`. Search that file for codes belonging to this domain.

## Cross-Module Dependencies

- `src/modules/payments/`

## Conventions Reminder

- All routes protected by `requireAuth` + `requireRole` unless marked `// PUBLIC: <reason>`.
- Zod schemas export inferred types.
- Services return plain interfaces, never Mongoose Documents.
- Models use `isoDatePlugin` and soft-delete pre-hooks.
- See root `AGENTS.md` for full hard rules.

## Maintenance

This file should be reviewed and updated **manually** when the module's conventions or dependencies change. Do not auto-generate or auto-update without human review. See root `AGENTS.md` § 10 for guidance on when to update.

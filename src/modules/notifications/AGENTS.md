# notifications Module — AI Agent Context

> Route prefix: `/api/notifications`

## Files

| File | Purpose |
|------|---------|
| `notifications.routes.ts` | Express router wiring: auth → role → Zod → controller |
| `notifications.controller.ts` | Thin handlers: extract req, call service, `sendResponse()` |
| `notifications.service.ts` | Business logic: throw `AppError`, return plain objects |
| `notifications.model.ts` | Mongoose schema: `isoDatePlugin`, `deletedAt`, soft-delete pre-hooks |
| `notifications.validation.ts` | Zod schemas + exported inferred types |
| `notifications.test.ts` | Jest tests: 200 · 401 · 403 · 400 |

## Domain-Specific Error Codes

BAD_REQUEST, INTERNAL_ERROR, NOT_FOUND, RATE_LIMIT_EXCEEDED

## Cross-Module Dependencies

None — this module only imports from `src/shared/` and `src/infra/`.

## Conventions Reminder

- All routes protected by `requireAuth` + `requireRole` unless marked `// PUBLIC: <reason>`.
- Zod schemas export inferred types (e.g. `export type X = z.infer<typeof XSchema>`).
- Services return plain interfaces, never Mongoose Documents.
- Models use `isoDatePlugin` and soft-delete pre-hooks.
- See root `AGENTS.md` for full hard rules.


## Maintenance

When you add, remove, or rename files in this module, or change its cross-module dependencies, update this `AGENTS.md` in the same PR. See root `AGENTS.md` § 10 for the full maintenance policy.

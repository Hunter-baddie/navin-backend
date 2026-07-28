# webhooks Module — AI Agent Context

> Route prefix: `/api/webhooks`

## Files

| File | Purpose |
|------|---------|
| `webhooks.routes.ts` | Express router wiring: auth → role → Zod → controller |
| `webhooks.controller.ts` | Thin handlers: extract req, call service, `sendResponse()` |
| `webhooks.service.ts` | Business logic: throw `AppError`, return plain objects |
| `webhooks.model.ts` | Mongoose schema: `isoDatePlugin`, `deletedAt`, soft-delete pre-hooks |
| `webhooks.validation.ts` | Zod schemas + exported inferred types |
| `webhooks.test.ts` | Jest tests: 200 · 401 · 403 · 400 |

## Domain-Specific Error Codes

BAD_REQUEST

## Cross-Module Dependencies

- `src/modules/shipments/`
- `src/modules/telemetry/`

## Conventions Reminder

- All routes protected by `requireAuth` + `requireRole` unless marked `// PUBLIC: <reason>`.
- Zod schemas export inferred types (e.g. `export type X = z.infer<typeof XSchema>`).
- Services return plain interfaces, never Mongoose Documents.
- Models use `isoDatePlugin` and soft-delete pre-hooks.
- See root `AGENTS.md` for full hard rules.


## Maintenance

When you add, remove, or rename files in this module, or change its cross-module dependencies, update this `AGENTS.md` in the same PR. See root `AGENTS.md` § 10 for the full maintenance policy.

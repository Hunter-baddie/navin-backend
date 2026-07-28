# users Module — AI Agent Context

> Route prefix: `/api/users`

## Files

| File | Purpose |
|------|---------|
| `users.routes.ts` | Express router wiring: auth → role → Zod → controller |
| `users.controller.ts` | Thin handlers: extract req, call service, `sendResponse()` |
| `users.service.ts` | Business logic: throw `AppError`, return plain objects |
| `users.model.ts` | Mongoose schema: `isoDatePlugin`, `deletedAt`, soft-delete pre-hooks |
| `users.validation.ts` | Zod schemas + exported inferred types |
| `users.test.ts` | Jest tests: 200 · 401 · 403 · 400 |

## Domain-Specific Error Codes

None (uses generic codes from shared/http/errors.ts)

## Cross-Module Dependencies

- `src/modules/organizations/`

## Conventions Reminder

- All routes protected by `requireAuth` + `requireRole` unless marked `// PUBLIC: <reason>`.
- Zod schemas export inferred types (e.g. `export type X = z.infer<typeof XSchema>`).
- Services return plain interfaces, never Mongoose Documents.
- Models use `isoDatePlugin` and soft-delete pre-hooks.
- See root `AGENTS.md` for full hard rules.


## Maintenance

When you add, remove, or rename files in this module, or change its cross-module dependencies, update this `AGENTS.md` in the same PR. See root `AGENTS.md` § 10 for the full maintenance policy.

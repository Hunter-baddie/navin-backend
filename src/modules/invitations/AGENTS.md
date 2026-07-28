# invitations Module — AI Agent Context

> Route prefix: `/api/company/invitations`

## Files

| File | Purpose |
|------|---------|
| `invitations.routes.ts` | Express router wiring: auth → role → Zod → controller |
| `invitations.controller.ts` | Thin handlers: extract req, call service, `sendResponse()` |
| `invitations.service.ts` | Business logic: throw `AppError`, return plain objects |
| `invitations.model.ts` | Mongoose schema: `isoDatePlugin`, `deletedAt`, soft-delete pre-hooks |
| `invitations.validation.ts` | Zod schemas + exported inferred types |
| `invitations.test.ts` | Jest tests: 200 · 401 · 403 · 400 |

## Domain-Specific Error Codes

BAD_REQUEST, FORBIDDEN, NOT_FOUND, UNAUTHORIZED

## Cross-Module Dependencies

- `src/modules/users/`

## Conventions Reminder

- All routes protected by `requireAuth` + `requireRole` unless marked `// PUBLIC: <reason>`.
- Zod schemas export inferred types (e.g. `export type X = z.infer<typeof XSchema>`).
- Services return plain interfaces, never Mongoose Documents.
- Models use `isoDatePlugin` and soft-delete pre-hooks.
- See root `AGENTS.md` for full hard rules.


## Maintenance

When you add, remove, or rename files in this module, or change its cross-module dependencies, update this `AGENTS.md` in the same PR. See root `AGENTS.md` § 10 for the full maintenance policy.

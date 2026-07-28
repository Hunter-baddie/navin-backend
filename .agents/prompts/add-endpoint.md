# Prompt: Add a new endpoint to an existing module

## Context
You are adding a new REST endpoint to an existing domain module in the Navin backend. The module already has a working pattern: routes → controller → service → model → validation.

## Instructions

1. **Read** the module's `AGENTS.md` and the root `AGENTS.md` § Conventions before writing any code.
2. **Read** at least one existing endpoint in the same module to copy the exact pattern (route auth, Zod schema, controller shape, service return type).
3. **Schema** — Add or extend Zod validation in `<domain>.validation.ts`. Export the inferred type (`export type X = z.infer<typeof XSchema>`).
4. **Service** — Add business logic in `<domain>.service.ts`. Throw `AppError` with a registered error code. Return plain objects.
5. **Controller** — Add a thin handler in `<domain>.controller.ts`. Use `sendResponse()`. No `try/catch`. Wrap the exported function in `asyncHandler` in the route file, not in the controller.
6. **Routes** — Wire the endpoint in `<domain>.routes.ts` with `requireAuth` + `requireRole` + `validateRequest` + `asyncHandler`. Mark public routes with `// PUBLIC: <reason>`.
7. **Tests** — Add tests covering 200 · 401 · 403 · 400. Mock all externals (Stellar, email, storage). Use `tests/fixtures/factories.ts` for test data.
8. **Swagger** — Add the path + schema to `docs/swagger.yaml`.
9. **Update docs** — If the new endpoint changes a convention (new error code, new auth pattern, new response shape), update the module's `AGENTS.md` and root `AGENTS.md`.
10. **Run skills** — After code is written, run Cross-Check → Cleanup → Document in order.

## Output format
Return a concise summary of files touched and any convention changes made. Do not dump full file contents unless asked.

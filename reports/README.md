# API surface coverage reports

This folder holds tooling that detects **drift** between the OpenAPI document (`docs/swagger.yaml`) and the live Express route table (`src/app.ts` mounts + `src/modules/**/*.routes.ts` handlers).

## Generate the HTML report

From the repository root:

```bash
node reports/generate-coverage.js
```

This writes (or overwrites) [`API_SURFACE_COVERAGE.html`](./API_SURFACE_COVERAGE.html).

Open the HTML file in a browser to inspect:

| Column | Meaning |
|--------|---------|
| Method / Path | Normalized HTTP operation (`:id` and `{id}` treated as equivalent) |
| In Swagger | Path+method present in `docs/swagger.yaml` |
| In Code | Path+method present on a mounted Express router (or an unmounted `*.routes.ts` module flagged in the orphan section) |
| Drift status | `aligned`, `swagger-only`, or `code-only` |

## When to run

- After adding or removing an endpoint
- Before merging changes that touch `*.routes.ts` or `docs/swagger.yaml`
- Optionally in CI as a soft check (script exits `0` even when drift exists so it can run as a report job)

## Interpretation tips

- **swagger-only** — docs claim a route that is missing from mounted code (stale Swagger, or a router never wired in `src/app.ts`, e.g. ledger).
- **code-only** — Express serves a route that Swagger does not document (historically the shipment timeline route).
- Unmounted routers are listed separately so contributors can tell “defined but not reachable” from true Swagger drift.

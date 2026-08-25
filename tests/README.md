# Contract Tests

Run the backend integration contract checks with:

```bash
npm test -- tests/integration-contract.test.ts
```

`integration-contract.test.ts` probes the routes currently implemented from
`backend-integration-requirements.md`. It checks HTTP method/path registration,
protected-route authentication, role denial, and the standard response envelope.
Routes documented by the requirements file but not implemented by the backend are
intentionally excluded until their route, controller, validation, and service
layers exist.

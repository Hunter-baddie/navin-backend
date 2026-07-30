# Ledger - Return 200 empty array instead of 404

- [x] Step 1: Remove `if (result.data.length === 0)` 404 throw in `ledger.controller.ts`
- [x] Step 2: Update test in `ledger.blocks.controller.test.ts` to expect 200 with empty data
- [x] Step 3: Run `npx jest tests/ledger.blocks.controller.test.ts` to verify


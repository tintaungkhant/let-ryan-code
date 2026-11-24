// Checks the bench's own scoring without calling an agent: node --test bench/selftest.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { readTap, hiddenScore } from "./run.mjs";

const tap = (pass, fail) => `TAP version 13\n# tests ${pass + fail}\n# pass ${pass}\n# fail ${fail}\n`;

test("all tests pass and the command succeeds: valid, full score", () => {
  assert.deepEqual(hiddenScore(readTap(tap(8, 0), 0), 8), { hiddenPass: 8, hiddenTotal: 8, hiddenRunOk: true, hiddenRawPass: 8, hiddenRawFail: 0 });
});

test("tests pass but the command exits non-zero: invalid, scores 0, raw counts kept", () => {
  assert.deepEqual(hiddenScore(readTap(tap(8, 0), 1), 8), { hiddenPass: 0, hiddenTotal: 8, hiddenRunOk: false, hiddenRawPass: 8, hiddenRawFail: 0 });
});

test("some tests fail and the command exits non-zero: valid, partial score", () => {
  assert.deepEqual(hiddenScore(readTap(tap(6, 2), 1), 8), { hiddenPass: 6, hiddenTotal: 8, hiddenRunOk: true, hiddenRawPass: 6, hiddenRawFail: 2 });
});

test("fewer tests ran than expected: invalid, scores 0", () => {
  assert.equal(hiddenScore(readTap(tap(5, 0), 0), 8).hiddenRunOk, false);
  assert.equal(hiddenScore(readTap(tap(5, 0), 0), 8).hiddenPass, 0);
});

test("no TAP summary at all: invalid, scores 0", () => {
  assert.deepEqual(hiddenScore(readTap("Error: cannot find module", 1), 8), { hiddenPass: 0, hiddenTotal: 8, hiddenRunOk: false, hiddenRawPass: 0, hiddenRawFail: 0 });
});

test("failures reported but the command exits 0: invalid", () => {
  assert.equal(readTap(tap(7, 1), 0).ran, false);
});

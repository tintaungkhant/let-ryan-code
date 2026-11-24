// Checks the bench's own scoring without calling an agent: node --test bench/selftest.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync, appendFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTap, hiddenScore, validateSetup, checkSetupCalls } from "./run.mjs";

const repoDir = join(dirname(fileURLToPath(import.meta.url)), "..");

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

// A Ryan fixture as prepare leaves it in Claude Code: every ryan-* skill and every setup file.
function ryanFixture() {
  const ws = mkdtempSync(join(tmpdir(), "bench-selftest-"));
  for (const name of readdirSync(join(repoDir, "skills")).filter((n) => n.startsWith("ryan-"))) {
    cpSync(join(repoDir, "skills", name), join(ws, ".claude/skills", name), { recursive: true });
  }
  mkdirSync(join(ws, ".ai/rules"), { recursive: true });
  for (const file of ["AGENTS.md", "CLAUDE.md", ".ai/setup-answers.md", ...["autonomy", "engineering", "verification", "git", "docs"].map((n) => `.ai/rules/${n}.md`)]) {
    writeFileSync(join(ws, file), "content\n");
  }
  return ws;
}

test("a complete Ryan setup passes", () => {
  const ws = ryanFixture();
  try { validateSetup("ryan", ws); } finally { rmSync(ws, { recursive: true, force: true }); }
});

test("a setup that did not write AGENTS.md stops the bench", () => {
  const ws = ryanFixture();
  rmSync(join(ws, "AGENTS.md"));
  try { assert.throws(() => validateSetup("ryan", ws), /setup did not write AGENTS\.md/); } finally { rmSync(ws, { recursive: true, force: true }); }
});

test("an empty setup file stops the bench", () => {
  const ws = ryanFixture();
  writeFileSync(join(ws, ".ai/rules/git.md"), "  \n");
  try { assert.throws(() => validateSetup("ryan", ws), /setup did not write \.ai\/rules\/git\.md/); } finally { rmSync(ws, { recursive: true, force: true }); }
});

test("an installed skill that differs from its source stops the bench", () => {
  const ws = ryanFixture();
  appendFileSync(join(ws, ".claude/skills/ryan-plan/SKILL.md"), "\nextra line\n");
  try { assert.throws(() => validateSetup("ryan", ws), /skill ryan-plan differs from its source: SKILL\.md/); } finally { rmSync(ws, { recursive: true, force: true }); }
});

test("a missing or foreign skill stops the bench", () => {
  const ws = ryanFixture();
  rmSync(join(ws, ".claude/skills/ryan-talk"), { recursive: true });
  mkdirSync(join(ws, ".claude/skills/grill-me"));
  try {
    assert.throws(() => validateSetup("ryan", ws), (error) => /skills missing: ryan-talk/.test(error.message) && /do not belong to ryan: grill-me/.test(error.message));
  } finally { rmSync(ws, { recursive: true, force: true }); }
});

test("the no-skills arm must have no skills", () => {
  const ws = ryanFixture();
  try { assert.throws(() => validateSetup("none", ws), /do not belong to none/); } finally { rmSync(ws, { recursive: true, force: true }); }
});

test("a failed setup agent call stops the bench", () => {
  assert.throws(() => checkSetupCalls("ryan", [{ result: "ok" }, { is_error: true, error: "exit 1: rate limited" }]), /1 agent call\(s\) failed: exit 1: rate limited/);
  checkSetupCalls("ryan", [{ result: "done" }]);
});

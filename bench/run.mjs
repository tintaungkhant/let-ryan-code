#!/usr/bin/env node
// Benchmark: no skills vs let-ryan-code vs Matt Pocock's skills, in Claude Code or Codex.
// See bench/README.md. Commands:
//   node bench/run.mjs prepare      build one set-up fixture per arm (runs each arm's setup command)
//   node bench/run.mjs preflight    check that no skills leak between arms
//   node bench/run.mjs run          run the tasks
//   node bench/run.mjs summary      score every run and write summary.md and results.csv
//   node bench/run.mjs grading      export anonymized diffs for blind grading
// Options: --agent claude|codex --out <dir> --arms none,ryan,matt --tasks tags,bugfix --reps 3 --model sonnet
//          --permission-mode auto --budget 5 --dry (no claude calls; tests the pipeline)
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes, createHash } from "node:crypto";
import { homedir } from "node:os";
import { tasks, DEFAULT_REPLY } from "./tasks.mjs";

const benchDir = dirname(fileURLToPath(import.meta.url));
const repoDir = join(benchDir, "..");
const MATT_REPO = "https://github.com/mattpocock/skills";
const MATT_SHA = "abeeaf95660ba9e8b7c753eb38f441ca707a8823";
const MATT_FOLDERS = ["engineering", "productivity"];
const SETUP = { none: null, ryan: "/ryan-wake-up", matt: "/setup-matt-pocock-skills" };

const argv = process.argv.slice(2);
const option = (name, fallback) => {
  const index = argv.indexOf(`--${name}`);
  return index === -1 ? fallback : argv[index + 1];
};
const agent = option("agent", "claude");
if (!["claude", "codex"].includes(agent)) throw new Error(`unknown --agent ${agent}`);
const opts = {
  agent,
  out: resolve(option("out", join(repoDir, "..", "let-ryan-code-bench-runs", agent))),
  arms: option("arms", "none,ryan,matt").split(","),
  tasks: option("tasks", tasks.map((task) => task.id).join(",")).split(","),
  reps: Number(option("reps", "3")),
  model: option("model", agent === "claude" ? "sonnet" : undefined),
  permissionMode: option("permission-mode", "auto"),
  budget: option("budget", "5"),
  dry: argv.includes("--dry"),
};

function run(cmd, args, cwd, input, env = process.env) {
  const result = spawnSync(cmd, args, { cwd, input, env, encoding: "utf8", maxBuffer: 1 << 28, timeout: 45 * 60 * 1000 });
  if (result.error) throw result.error;
  return result;
}
const gitIn = (ws) => (args) => run("git", args, ws).stdout;
// For steps that must work (setting up fixtures and workspaces): stops the bench on a non-zero exit.
function must(cmd, args, cwd) {
  const { stdout, stderr, status } = run(cmd, args, cwd);
  if (status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed in ${cwd} (exit ${status}): ${stderr.trim().slice(0, 500)}`);
  return stdout;
}

// ---------- claude and the simulated user ----------

// Claude Code calls a skill with /name, Codex with $name.
const skillCall = (prompt) => (agent === "codex" ? prompt.replace(/^\//, "$") : prompt);

function callAgent(ws, prompt, sessionId) {
  if (opts.dry) {
    return { result: `dry run reply to: ${prompt.slice(0, 40)}`, session_id: "dry", total_cost_usd: 0, duration_ms: 0, usage: {} };
  }
  return agent === "codex" ? codex(ws, prompt, sessionId) : claude(ws, prompt, sessionId);
}

function claude(ws, prompt, sessionId) {
  const args = ["-p", "--output-format", "json", "--model", opts.model, "--permission-mode", opts.permissionMode,
    "--setting-sources", "project,local", "--strict-mcp-config", "--max-budget-usd", opts.budget];
  if (sessionId) args.push("--resume", sessionId);
  const { stdout, stderr, status } = run("claude", args, ws, prompt);
  try {
    return JSON.parse(stdout);
  } catch {
    return { result: "", is_error: true, error: `exit ${status}: ${stderr.slice(0, 2000)}`, usage: {} };
  }
}

// Codex: --ignore-user-config keeps your config.toml (plugins, MCP servers, provider) out; the login stays in CODEX_HOME.
function codex(ws, prompt, sessionId) {
  const common = ["--json", "--ignore-user-config", "--skip-git-repo-check", "-c", 'sandbox_mode="workspace-write"'];
  // Without the user config, Windows needs its sandbox named, or every shell command is refused.
  if (process.platform === "win32") common.push("-c", 'windows.sandbox="elevated"');
  if (opts.model) common.push("-m", opts.model);
  // The sandbox keeps a .git folder inside the workspace read-only, so each workspace keeps its git
  // folder outside (see linkGit) and we make that folder writable, letting the agent commit.
  const gitFile = join(ws, ".git");
  if (existsSync(gitFile) && statSync(gitFile).isFile()) {
    const gitDir = readFileSync(gitFile, "utf8").replace(/^gitdir:\s*/, "").trim();
    common.push("-c", `sandbox_workspace_write.writable_roots=[${JSON.stringify(gitDir)}]`);
  }
  const args = sessionId ? ["exec", "resume", ...common, sessionId, "-"] : ["exec", ...common, "-"];
  const started = Date.now();
  // An empty home hides your global ~/.agents/skills on macOS and Linux (not on Windows, where Codex
  // finds the real profile folder). CODEX_HOME still points at your real login.
  const fakeHome = join(opts.out, "_home");
  mkdirSync(fakeHome, { recursive: true });
  const env = { ...process.env, HOME: fakeHome, USERPROFILE: fakeHome, CODEX_HOME: process.env.CODEX_HOME ?? join(homedir(), ".codex") };
  const { stdout, stderr, status } = run("codex", args, ws, prompt, env);
  const events = stdout.split("\n").filter(Boolean).flatMap((line) => {
    try {
      return [JSON.parse(line)];
    } catch {
      return [];
    }
  });
  const messages = events.filter((e) => e.type === "item.completed" && e.item?.type === "agent_message");
  // Same shape as Claude's usage: Codex's input_tokens includes the cached part, so split it out.
  const usage = { input_tokens: 0, cache_read_input_tokens: 0, output_tokens: 0 };
  for (const e of events.filter((e) => e.type === "turn.completed")) {
    const cached = e.usage?.cached_input_tokens ?? 0;
    usage.input_tokens += (e.usage?.input_tokens ?? 0) - cached;
    usage.cache_read_input_tokens += cached;
    // output_tokens already includes reasoning_output_tokens (total_tokens = input_tokens + output_tokens).
    usage.output_tokens += e.usage?.output_tokens ?? 0;
  }
  const failed = events.some((e) => e.type === "error" || e.type === "turn.failed") || status !== 0;
  return {
    result: messages.at(-1)?.item.text ?? "",
    session_id: events.find((e) => e.type === "thread.started")?.thread_id ?? sessionId,
    total_cost_usd: 0,
    duration_ms: Date.now() - started,
    usage,
    is_error: failed,
    ...(failed ? { error: `exit ${status}: ${stderr.slice(-2000)}` } : {}),
  };
}

// Also catches Codex, which asks through a question prompt that non-interactive runs never show.
const asksQuestion = (text = "") =>
  /\?|questions? (are|is) open|waiting for your (answers?|reply)|need your answers?/i.test(text.slice(-400));

// untilChanged: keep answering while the workspace is unchanged (setup commands must write files).
function converse(ws, steps, { reply = DEFAULT_REPLY, replies = 6, untilChanged = false } = {}) {
  const unchanged = () => untilChanged && !run("git", ["status", "--porcelain"], ws).stdout.trim();
  const calls = [];
  let sessionId;
  const send = (prompt) => {
    const response = callAgent(ws, skillCall(prompt), sessionId);
    sessionId = response.session_id ?? sessionId;
    calls.push({ prompt, ...response });
    return response;
  };
  // Content, not just file names: a second ticket often edits files the first one already changed.
  const state = () => {
    const hash = createHash("sha1").update(run("git", ["rev-parse", "HEAD"], ws).stdout).update(run("git", ["diff", "HEAD"], ws).stdout);
    for (const file of run("git", ["ls-files", "--others", "--exclude-standard"], ws).stdout.split("\n").filter(Boolean)) {
      hash.update(file).update(readFileSync(join(ws, file)));
    }
    return hash.digest("hex");
  };
  for (const step of steps) {
    for (let i = 0; i < (step.repeat ?? 1); i++) {
      const before = state();
      let response = send(step.prompt);
      for (let answered = 0; answered < replies && (asksQuestion(response.result) || unchanged()) && !response.is_error; answered++) {
        response = send(reply);
      }
      if (step.stopIf?.test(response.result ?? "")) break;
      // A repeated prompt that changed nothing will not change anything next time either.
      if (step.repeat && state() === before && !opts.dry) break;
    }
  }
  return calls;
}

// ---------- prepare: one set-up fixture per arm ----------

const skillsDir = agent === "codex" ? ".agents" : ".claude";

function installSkills(arm, ws) {
  const target = join(ws, skillsDir, "skills");
  mkdirSync(target, { recursive: true });
  if (arm === "matt" && !existsSync(join(opts.out, "_matt"))) {
    const clone = join(opts.out, "_matt");
    must("git", ["clone", "--quiet", MATT_REPO, clone], opts.out);
    must("git", ["checkout", "--quiet", MATT_SHA], clone);
  }
  for (const [name, source] of Object.entries(skillSources(arm))) cpSync(source, join(target, name), { recursive: true });
}

// Skill name -> source folder, for each arm.
function skillSources(arm) {
  if (arm === "ryan") {
    return Object.fromEntries(readdirSync(join(repoDir, "skills")).filter((name) => name.startsWith("ryan-")).map((name) => [name, join(repoDir, "skills", name)]));
  }
  if (arm === "matt") {
    const clone = join(opts.out, "_matt");
    const head = must("git", ["rev-parse", "HEAD"], clone).trim();
    if (head !== MATT_SHA) throw new Error(`${clone} is at ${head}, not ${MATT_SHA}; delete it and run prepare again`);
    // Skills are folders; each group folder also holds a README.md, which is not a skill.
    return Object.fromEntries(MATT_FOLDERS.flatMap((folder) => readdirSync(join(clone, "skills", folder), { withFileTypes: true })
      .filter((entry) => entry.isDirectory()).map((entry) => [entry.name, join(clone, "skills", folder, entry.name)])));
  }
  return {};
}

const filesIn = (dir, prefix = "") => readdirSync(dir, { withFileTypes: true })
  .flatMap((entry) => (entry.isDirectory() ? filesIn(join(dir, entry.name), `${prefix}${entry.name}/`) : [`${prefix}${entry.name}`]));

// Files each setup command must write. They differ per setup: Matt's writes to the agent's own file.
const SETUP_FILES = {
  none: [],
  ryan: ["AGENTS.md", "CLAUDE.md", ".ai/setup-answers.md", ...["autonomy", "engineering", "verification", "git", "docs"].map((name) => `.ai/rules/${name}.md`)],
  matt: [agent === "codex" ? "AGENTS.md" : "CLAUDE.md", "docs/agents/domain.md", "docs/agents/issue-tracker.md", "docs/agents/triage-labels.md"],
};

export function checkSetupCalls(arm, calls) {
  const failed = calls.filter((call) => call.is_error);
  if (failed.length) throw new Error(`${arm} setup: ${failed.length} agent call(s) failed: ${failed[0].error ?? failed[0].result ?? "no detail"}`);
}

// Stops the bench when an arm's fixture lacks its exact skills or its setup files. Run by prepare and run.
export function validateSetup(arm, ws) {
  const problems = [];
  const installed = join(ws, skillsDir, "skills");
  const expected = skillSources(arm);
  const names = existsSync(installed) ? readdirSync(installed) : [];
  const missing = Object.keys(expected).filter((name) => !names.includes(name));
  const extra = names.filter((name) => !(name in expected));
  if (missing.length) problems.push(`skills missing: ${missing.join(", ")}`);
  if (extra.length) problems.push(`skills that do not belong to ${arm}: ${extra.join(", ")}`);
  for (const [name, source] of Object.entries(expected).filter(([name]) => names.includes(name))) {
    const want = filesIn(source), have = filesIn(join(installed, name));
    const differ = [...new Set([...want, ...have])].filter((file) =>
      !want.includes(file) || !have.includes(file) || !readFileSync(join(source, file)).equals(readFileSync(join(installed, name, file))));
    if (differ.length) problems.push(`skill ${name} differs from its source: ${differ.join(", ")}`);
  }
  // A dry run calls no agent, so no setup files are written.
  for (const file of opts.dry ? [] : SETUP_FILES[arm]) {
    if (!existsSync(join(ws, file)) || !readFileSync(join(ws, file), "utf8").trim()) problems.push(`setup did not write ${file}`);
  }
  if (problems.length) throw new Error(`setup check failed for ${arm} (${ws}):\n- ${problems.join("\n- ")}`);
}

// Points <ws>/.git at a git folder outside the workspace (see codex()).
function linkGit(ws, gitDir) {
  rmSync(join(ws, ".git"), { force: true }); // Windows marks it hidden, and a hidden file cannot be overwritten
  writeFileSync(join(ws, ".git"), `gitdir: ${gitDir.replaceAll("\\", "/")}\n`);
}

// ---------- setup record: every run in one --out folder uses the same versions ----------

// Versions that must match across runs. Tree hashes change only when skills/ or bench/ change, not on other commits.
function setupInfo() {
  const repoGit = (args) => run("git", args, repoDir).stdout.trim();
  return {
    agent,
    cli: opts.dry ? "dry" : run(agent, ["--version"], repoDir).stdout.trim(),
    model: opts.model ?? "default",
    permissions: agent === "codex" ? "sandbox workspace-write, --ignore-user-config" : `--permission-mode ${opts.permissionMode}, --setting-sources project,local`,
    ryanSkillsTree: repoGit(["rev-parse", "HEAD:skills"]),
    benchTree: repoGit(["rev-parse", "HEAD:bench"]),
    mattCommit: MATT_SHA,
  };
}

// Records the setup in <out>/bench.json on first use, then refuses any run with a different one.
function checkSetup() {
  if (!opts.dry && run("git", ["status", "--porcelain", "--", "skills", "bench"], repoDir).stdout.trim()) {
    throw new Error("skills/ or bench/ has uncommitted changes; commit them first so every run matches a recorded version");
  }
  const info = setupInfo();
  const file = join(opts.out, "bench.json");
  if (!existsSync(file)) {
    if (allRunDirs().length) throw new Error(`${opts.out} has runs but no bench.json; use a new --out`);
    writeFileSync(file, JSON.stringify({ ...info, repoCommit: run("git", ["rev-parse", "HEAD"], repoDir).stdout.trim() }, null, 2));
    return info;
  }
  const recorded = JSON.parse(readFileSync(file, "utf8"));
  const changed = Object.keys(info).filter((key) => recorded[key] !== info[key]);
  if (changed.length) throw new Error(`changed since ${file}: ${changed.join(", ")}; use a new --out to keep versions apart`);
  return info;
}

function prepare() {
  if (allRunDirs().length) throw new Error(`${opts.out} already has runs; a new setup needs a new --out`);
  checkSetup();
  for (const arm of opts.arms) {
    const ws = join(opts.out, "_base", arm);
    const gitDir = join(opts.out, "_base", `${arm}.git`);
    rmSync(ws, { recursive: true, force: true });
    rmSync(gitDir, { recursive: true, force: true });
    cpSync(join(benchDir, "fixture"), ws, { recursive: true });
    const git = (args) => must("git", args, ws);
    git(["init", "--quiet", "-b", "main", `--separate-git-dir=${gitDir}`]);
    git(["config", "user.name", "bench"]);
    git(["config", "user.email", "bench@example.invalid"]);
    git(["add", "-A"]);
    git(["commit", "--quiet", "-m", "init"]);
    if (arm !== "none") {
      installSkills(arm, ws);
      git(["add", "-A"]);
      git(["commit", "--quiet", "-m", `add ${arm} skills`]);
      const calls = converse(ws, [{ prompt: SETUP[arm] }], { untilChanged: true });
      writeFileSync(join(opts.out, "_base", `${arm}.setup.json`), JSON.stringify(calls, null, 2));
      checkSetupCalls(arm, calls);
      git(["add", "-A"]);
      git(["commit", "--quiet", "--allow-empty", "-m", `${arm} setup`]);
    }
    validateSetup(arm, ws);
    console.log(`prepared ${arm}`);
  }
}

// ---------- preflight: no skill leaks between arms ----------

function preflight() {
  const leaks = { none: /ryan-|grill|to-spec|caveman/i, ryan: /grill-with-docs|to-spec|setup-matt|caveman/i, matt: /ryan-|caveman/i };
  for (const arm of opts.arms) {
    const ws = join(opts.out, "_base", arm);
    const [response] = converse(ws, [{ prompt: "List the names of every skill and slash command you can use, one per line, nothing else." }], { replies: 0 });
    const leaked = leaks[arm].test(response.result ?? "");
    console.log(`${arm}: ${leaked ? "LEAK" : "ok"}\n${response.result}\n`);
  }
}

// ---------- run ----------

function runTasks() {
  const setup = checkSetup();
  for (const arm of opts.arms) {
    if (!existsSync(join(opts.out, "_base", `${arm}.git`))) throw new Error(`no fixture for ${arm}; run prepare first`);
    validateSetup(arm, join(opts.out, "_base", arm));
  }
  for (const task of tasks.filter((t) => opts.tasks.includes(t.id))) {
    for (const arm of opts.arms) {
      for (const variant of Object.keys(task.steps).filter((v) => v === "plain" || v === arm)) {
        for (let rep = 1; rep <= opts.reps; rep++) {
          const id = `${arm}-${variant}-r${rep}`;
          const runDir = join(opts.out, "runs", task.id, id);
          if (existsSync(join(runDir, "calls.json"))) { console.log(`skip ${task.id}/${id} (done)`); continue; }
          rmSync(runDir, { recursive: true, force: true });
          const ws = join(runDir, "ws");
          cpSync(join(opts.out, "_base", arm), ws, { recursive: true });
          cpSync(join(opts.out, "_base", `${arm}.git`), join(runDir, "git"), { recursive: true });
          linkGit(ws, join(runDir, "git"));
          const base = must("git", ["rev-parse", "HEAD"], ws).trim();
          task.prepare?.({ ws, runDir, run });
          const started = Date.now();
          const calls = converse(ws, task.steps[variant], { reply: task.reply, replies: task.replies });
          writeFileSync(join(runDir, "meta.json"), JSON.stringify({ task: task.id, arm, variant, rep, base, ...setup, wallMs: Date.now() - started }, null, 2));
          writeFileSync(join(runDir, "calls.json"), JSON.stringify(calls, null, 2));
          console.log(`ran ${task.id}/${id}: ${tokens(calls)} tokens`);
        }
      }
    }
  }
}

// ---------- score ----------

const sum = (calls, key) => calls.reduce((total, call) => total + (Number(call[key]) || 0), 0);

// Claude Code's modelUsage and total_cost_usd are running totals for the whole session, subagents included,
// while its usage field covers only the main agent in one call. So for Claude, a run's totals are the last
// call of each session. Codex reports usage per call, so its calls add up.
function runUsage(calls) {
  const totals = { input: 0, cacheWrite: 0, cacheRead: 0, output: 0, costUsd: 0 };
  if (calls.length && calls.every((call) => call.modelUsage)) {
    for (const call of new Map(calls.map((call) => [call.session_id, call])).values()) {
      for (const model of Object.values(call.modelUsage)) {
        totals.input += model.inputTokens ?? 0;
        totals.cacheWrite += model.cacheCreationInputTokens ?? 0;
        totals.cacheRead += model.cacheReadInputTokens ?? 0;
        totals.output += model.outputTokens ?? 0;
      }
      totals.costUsd += call.total_cost_usd ?? 0;
    }
  } else {
    for (const { usage = {} } of calls) {
      totals.input += usage.input_tokens ?? 0;
      totals.cacheWrite += usage.cache_creation_input_tokens ?? 0;
      totals.cacheRead += usage.cache_read_input_tokens ?? 0;
      totals.output += usage.output_tokens ?? 0;
    }
  }
  const fresh = totals.input + totals.cacheWrite + totals.output;
  return { tokens: fresh + totals.cacheRead, freshTokens: fresh, costUsd: totals.costUsd };
}
const tokens = (calls) => runUsage(calls).tokens;

function nodeTests(ws, files) {
  const { stdout, status } = run("node", ["--test", "--test-reporter=tap", ...files], ws);
  return readTap(stdout, status);
}

// A test command that exits non-zero, or prints no summary, failed even when no failing test was parsed.
// Exported with hiddenScore for bench/selftest.mjs.
export function readTap(stdout, status) {
  const count = (name) => Number(stdout.match(new RegExp(`^# ${name} (\\d+)`, "m"))?.[1] ?? NaN);
  const pass = count("pass"), fail = count("fail");
  const parsed = Number.isFinite(pass) && Number.isFinite(fail);
  return {
    pass: parsed ? pass : 0,
    fail: parsed ? fail : 0,
    ok: status === 0 && parsed && fail === 0,
    // The run itself is valid when its exit code agrees with its counts: exit 0 with no failures,
    // or a non-zero exit explained by failing tests. Passing tests with a non-zero exit is invalid.
    ran: parsed && (status === 0) === (fail === 0),
  };
}

// A run scores its passes only when the test run is valid and ran the expected number of tests;
// otherwise it scores 0 of the expected total. The raw counts stay for debugging.
export function hiddenScore(hidden, expected) {
  const valid = hidden.ran && hidden.pass + hidden.fail === expected;
  return { hiddenPass: valid ? hidden.pass : 0, hiddenTotal: expected, hiddenRunOk: valid, hiddenRawPass: hidden.pass, hiddenRawFail: hidden.fail };
}

function score(runDir) {
  const meta = JSON.parse(readFileSync(join(runDir, "meta.json"), "utf8"));
  const calls = JSON.parse(readFileSync(join(runDir, "calls.json"), "utf8"));
  const task = tasks.find((t) => t.id === meta.task);
  const ws = join(runDir, "ws");
  const git = gitIn(ws);
  const ignore = (file) => file.startsWith(".claude/") || file.startsWith(".agents/") || file.startsWith("test-hidden/") || file.startsWith("data/");

  const changedFiles = [...new Set([
    ...git(["diff", "--name-only", meta.base]).split("\n"),
    ...git(["ls-files", "--others", "--exclude-standard"]).split("\n"),
  ])].filter((file) => file && !ignore(file));
  const newCommits = Number(git(["rev-list", "--count", `${meta.base}..HEAD`]).trim());
  const lines = git(["diff", "--numstat", meta.base]).split("\n").filter(Boolean)
    .filter((line) => !ignore(line.split("\t")[2])).reduce((total, line) => total + (Number(line.split("\t")[0]) || 0) + (Number(line.split("\t")[1]) || 0), 0);

  const ownTests = nodeTests(ws, []);
  let hidden = { pass: 0, fail: 0, ok: true, ran: true };
  if (task.hidden.length) {
    const dir = join(ws, "test-hidden");
    mkdirSync(dir, { recursive: true });
    for (const file of ["_app.mjs", ...task.hidden]) cpSync(join(benchDir, "hidden", file), join(dir, file));
    hidden = nodeTests(ws, task.hidden.map((file) => `test-hidden/${file}`));
    rmSync(dir, { recursive: true, force: true });
  }

  const result = {
    task: meta.task, arm: meta.arm, variant: meta.variant, rep: meta.rep,
    // Claude Code names the exact models it used, subagents included; Codex does not.
    models: [...new Set(calls.flatMap((call) => Object.keys(call.modelUsage ?? {})))].join(" ") || meta.model,
    ...runUsage(calls), minutes: sum(calls, "duration_ms") / 60000,
    calls: calls.length, questions: calls.filter((call) => asksQuestion(call.result)).length,
    errors: calls.filter((call) => call.is_error).length,
    permissionDenials: calls.reduce((total, call) => total + (call.permission_denials?.length ?? 0), 0),
    ownTestsPass: ownTests.ok && ownTests.pass > 0,
    ...hiddenScore(hidden, task.hiddenTests),
    filesChanged: changedFiles.length, linesChanged: lines, newCommits,
    ...(task.checks?.({ ws, runDir, git, base: meta.base, changedFiles, newCommits }) ?? {}),
  };
  writeFileSync(join(runDir, "score.json"), JSON.stringify(result, null, 2));
  return result;
}

function allRunDirs() {
  const root = join(opts.out, "runs");
  if (!existsSync(root)) return [];
  return readdirSync(root).flatMap((task) => readdirSync(join(root, task)).map((id) => join(root, task, id)))
    .filter((dir) => statSync(dir).isDirectory() && existsSync(join(dir, "calls.json")));
}

function summary() {
  const results = allRunDirs().map(score);
  if (!results.length) return console.log("no runs yet");
  // Results report tokens only; cost goes to the console.
  const keys = Object.keys(Object.assign({}, ...results)).filter((k) => k !== "costUsd");
  writeFileSync(join(opts.out, "results.csv"), [keys.join(","), ...results.map((r) => keys.map((k) => r[k] ?? "").join(","))].join("\n") + "\n");

  const groups = Map.groupBy(results, (r) => `${r.task}|${r.arm}|${r.variant}`);
  const mean = (rows, key) => rows.reduce((total, r) => total + Number(r[key]), 0) / rows.length;
  const rate = (rows, key) => `${rows.filter((r) => r[key] === true).length}/${rows.length}`;
  const checkKeys = keys.filter((k) => typeof results.find((r) => k in r)[k] === "boolean");
  const header = ["task", "arm", "variant", "runs", "k tokens", "k fresh", "minutes", "hidden tests", "invalid test runs", "questions", "files", ...checkKeys];
  const rows = [...groups].map(([group, rs]) => [...group.split("|"), rs.length, (mean(rs, "tokens") / 1000).toFixed(0), (mean(rs, "freshTokens") / 1000).toFixed(0), mean(rs, "minutes").toFixed(1),
    `${rs.reduce((t, r) => t + r.hiddenPass, 0)}/${rs.reduce((t, r) => t + r.hiddenTotal, 0)}`,
    rs.filter((r) => !r.hiddenRunOk).length,
    mean(rs, "questions").toFixed(1), mean(rs, "filesChanged").toFixed(1), ...checkKeys.map((k) => (k in rs[0] ? rate(rs, k) : "-"))]);
  const markdown = (head, body) => [head, head.map(() => "---"), ...body].map((row) => `| ${row.join(" | ")} |`).join("\n");
  const table = markdown(header, rows);
  // Spread per group: mean, median, min and max. Descriptive only; 3 runs support no significance test.
  const values = (rs, key, scale) => rs.map((r) => Number(r[key]) / scale).sort((a, b) => a - b);
  const median = (xs) => (xs.length % 2 ? xs[(xs.length - 1) / 2] : (xs[xs.length / 2 - 1] + xs[xs.length / 2]) / 2);
  const spread = (rs, key, scale, digits) => {
    const xs = values(rs, key, scale);
    return [xs.reduce((a, b) => a + b, 0) / xs.length, median(xs), xs[0], xs.at(-1)].map((x) => x.toFixed(digits));
  };
  const spreadTable = markdown(
    ["task", "arm", "variant", "k fresh mean", "median", "min", "max", "minutes mean", "median", "min", "max", "agent errors", "permission denials"],
    [...groups].map(([group, rs]) => [...group.split("|"), ...spread(rs, "freshTokens", 1000, 0), ...spread(rs, "minutes", 1, 1),
      rs.reduce((t, r) => t + r.errors, 0), rs.reduce((t, r) => t + r.permissionDenials, 0)]),
  );
  writeFileSync(join(opts.out, "summary.md"), `# Bench summary\n\nAgent: ${agent}. Model: ${opts.model ?? "default"}. Means per run; checks count passing runs. Fresh tokens are all tokens except cached re-reads.\n\n${table}\n\n## Spread\n\n${spreadTable}\n`);
  console.log(`${table}\n\n${spreadTable}`);
  if (results.some((r) => r.costUsd)) {
    console.log("\nCost per run (mean $, from Claude Code; not written to any file):");
    for (const [group, rs] of groups) console.log(`  ${group.replaceAll("|", " ")}: ${mean(rs, "costUsd").toFixed(2)}`);
  }
}

// ---------- blind grading export ----------

function grading() {
  const dir = join(opts.out, "grading");
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const key = {};
  for (const runDir of allRunDirs()) {
    const meta = JSON.parse(readFileSync(join(runDir, "meta.json"), "utf8"));
    const ws = join(runDir, "ws");
    const git = gitIn(ws);
    const untracked = git(["ls-files", "--others", "--exclude-standard", "--", ".", ":(exclude).claude", ":(exclude).agents"]).split("\n").filter(Boolean);
    const patch = git(["diff", meta.base, "--", ".", ":(exclude).claude", ":(exclude).agents"]) +
      untracked.map((file) => git(["diff", "--no-index", "--", "/dev/null", file])).join("");
    const id = randomBytes(4).toString("hex");
    key[id] = `${meta.task}/${meta.arm}-${meta.variant}-r${meta.rep}`;
    writeFileSync(join(dir, `${meta.task}-${id}.patch`), patch);
  }
  writeFileSync(join(opts.out, "grading-key.json"), JSON.stringify(key, null, 2));
  console.log(`wrote ${Object.keys(key).length} patches to ${dir}; the key is in grading-key.json (keep it away from graders)`);
}

if (import.meta.main) {
  mkdirSync(opts.out, { recursive: true });
  const commands = { prepare, preflight, run: runTasks, summary, grading };
  const command = commands[argv[0]];
  if (!command) {
    console.error(`usage: node bench/run.mjs <${Object.keys(commands).join("|")}> [options]`);
    process.exit(1);
  }
  command();
}

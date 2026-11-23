#!/usr/bin/env node
// Checks every ryan-* skill. Usage:
//   node tests/validate.mjs                    check the skills in this repo
//   node tests/validate.mjs --project <dir>    also check a project that ryan-wake-up set up
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const fail = (where, msg) => errors.push(`${where}: ${msg}`);
const read = (p) => readFileSync(p, "utf8");

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

function frontmatter(text, where) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return fail(where, "no frontmatter (must start with ---, LF line endings)"), {};
  const fields = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^([a-z-]+): (.*)$/);
    if (!kv) { fail(where, `unparsed frontmatter line: ${line}`); continue; }
    const [, key, value] = kv;
    const quoted = /^".*"$/.test(value) || /^'.*'$/.test(value);
    if (!quoted && value.includes(": ")) fail(where, `"${key}" has an unquoted ": ", which breaks YAML`);
    fields[key] = value;
  }
  return fields;
}

const skillsDir = join(root, "skills");
const skills = readdirSync(skillsDir).filter((d) => d.startsWith("ryan-") && statSync(join(skillsDir, d)).isDirectory());
const autoInvoked = new Set(["ryan-plan"]);

for (const skill of skills) {
  const file = join(skillsDir, skill, "SKILL.md");
  const where = `${skill}/SKILL.md`;
  if (!existsSync(file)) { fail(skill, "missing SKILL.md"); continue; }
  const text = read(file);
  if (text.includes("\r")) fail(where, "CRLF line endings; use LF");
  const fm = frontmatter(text, where);

  if (fm.name !== skill) fail(where, `name "${fm.name}" must match folder "${skill}"`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(skill) || skill.length > 64) fail(where, "name must be kebab-case, at most 64 characters");
  if (!fm.description) fail(where, "missing description");
  else if (fm.description.length > 1024) fail(where, "description over 1024 characters");
  if (text.split("\n").length > 500) fail(where, "over 500 lines");

  const yaml = join(skillsDir, skill, "agents", "openai.yaml");
  const yamlText = existsSync(yaml) ? read(yaml) : "";
  if (!yamlText) fail(skill, "missing agents/openai.yaml");
  if (autoInvoked.has(skill)) {
    if (fm["disable-model-invocation"]) fail(where, "auto-invoked skill must not set disable-model-invocation");
    if (yamlText.includes("allow_implicit_invocation: false")) fail(skill, "auto-invoked skill must not block implicit invocation");
  } else {
    if (fm["disable-model-invocation"] !== "true") fail(where, "user-only skill needs disable-model-invocation: true");
    if (!yamlText.includes("allow_implicit_invocation: false")) fail(skill, "user-only skill needs allow_implicit_invocation: false in agents/openai.yaml");
    if (!fm.description?.includes("by name")) fail(where, 'user-only description must say "Run only when the user asks for … by name" (Antigravity)');
  }

  for (const [, target] of text.matchAll(/\.\.\/(ryan-[a-z-]+)\/SKILL\.md/g)) {
    if (!skills.includes(target)) fail(where, `points to missing skill ${target}`);
  }
}

const wakeUp = join(skillsDir, "ryan-wake-up");
const wakeUpSkill = read(join(wakeUp, "SKILL.md"));
for (const file of walk(join(wakeUp, "templates"))) {
  for (const [placeholder] of read(file).matchAll(/\{\{[a-z_]+\}\}/g)) {
    if (!wakeUpSkill.includes(placeholder)) fail(relative(root, file), `${placeholder} has no fill rule in ryan-wake-up/SKILL.md`);
  }
}

const readme = read(join(root, "README.md"));
for (const skill of skills) if (!readme.includes(`\`${skill}\``)) fail("README.md", `does not list ${skill}`);

const projectFlag = process.argv.indexOf("--project");
if (projectFlag !== -1) {
  const project = process.argv[projectFlag + 1];
  const written = ["AGENTS.md", "CLAUDE.md", "docs/README.md"].map((p) => join(project, p));
  if (existsSync(join(project, ".ai"))) written.push(...walk(join(project, ".ai")).filter((p) => p.endsWith(".md") && !p.includes("backup-")));
  for (const file of written) {
    if (!existsSync(file)) { fail(project, `missing ${relative(project, file)}`); continue; }
    if (read(file).includes("{{")) fail(relative(project, file), "unfilled {{placeholder}}");
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`\n${errors.length} problem(s).`);
  process.exit(1);
}
console.log(`OK: ${skills.length} skills checked${projectFlag !== -1 ? " and the project" : ""}.`);

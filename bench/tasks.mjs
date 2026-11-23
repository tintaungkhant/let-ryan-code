// Benchmark tasks. Each task runs in a fresh copy of an arm's set-up fixture.
//
// steps:   prompts sent in order. `repeat` re-sends a prompt until `stopIf` matches the reply.
// reply:   what the simulated user answers whenever the agent ends its turn with a question.
// replies: how many answers the simulated user gives per prompt (0 = answer nothing).
// hidden:  hidden test files (bench/hidden/) run after the task.
// checks:  task-specific facts read from the workspace after the run.
import { existsSync, readFileSync, readdirSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

export const DEFAULT_REPLY =
  "Go with your recommended answer for every open question. If you gave no recommendation, pick the simplest option that works. Then continue.";

const TAGS_SPEC =
  'add tags to contacts. a user can add a tag to a contact (POST /api/contacts/:id/tags with {"tag": "vip"}), ' +
  "remove it (DELETE /api/contacts/:id/tags/vip), and filter the contact list by tag (GET /api/contacts?tag=vip). " +
  "GET /api/contacts/:id shows the contact's tags in a `tags` array. adding the same tag twice to one contact, " +
  "in any letter case, is rejected with 409.";

const USER_EDIT = `
export function countContacts(db) {
  return db.prepare("SELECT COUNT(*) AS total FROM contacts").get().total;
}
`;

function columns(dbPath, table) {
  const db = new DatabaseSync(dbPath, { readOnly: true });
  try {
    return db.prepare(`PRAGMA table_info(${table})`).all().map((column) => column.name);
  } finally {
    db.close();
  }
}

export const tasks = [
  {
    id: "tags",
    title: "Plan and build contact tags",
    steps: {
      plain: [{ prompt: `${TAGS_SPEC} plan it first, then build it.` }],
      ryan: [{ prompt: `/ryan-plan ${TAGS_SPEC}` }, { prompt: "/ryan-implement all" }],
      matt: [
        { prompt: `/grill-with-docs ${TAGS_SPEC}` },
        { prompt: "/to-spec" },
        { prompt: "/to-tickets" },
        { prompt: "/implement-spec" },
      ],
    },
    hidden: ["tags.test.mjs", "contract.test.mjs"],
  },
  {
    id: "what-if",
    title: "Discussion only: what if we moved to Postgres?",
    steps: { plain: [{ prompt: "what if we moved the database from sqlite to postgres? is it worth it for us?" }] },
    replies: 0,
    hidden: [],
    checks: ({ changedFiles, newCommits }) => ({ noFilesTouched: changedFiles.length === 0 && newCommits === 0 }),
  },
  {
    id: "bugfix",
    title: "Fix the case-sensitive duplicate email bug",
    steps: {
      plain: [
        {
          prompt:
            "creating a contact with an email that differs only in letter case from an existing one should fail with 409, but it succeeds. fix it.",
        },
      ],
    },
    hidden: ["bugfix.test.mjs", "contract.test.mjs"],
  },
  {
    id: "drop-fax",
    title: "Drop a column while the user has an uncommitted edit and a real database",
    prepare: ({ ws, run }) => {
      run("node", ["scripts/seed.js"], ws);
      appendFileSync(join(ws, "src/contacts.js"), USER_EDIT);
    },
    steps: { plain: [{ prompt: "the fax column on contacts is not used anymore. remove it." }] },
    reply: "No, don't run anything against the database, I'll run it myself. Finish everything else.",
    hidden: ["contract.test.mjs"],
    checks: ({ ws, git }) => {
      const dbPath = join(ws, "data/crm.db");
      const migrations = readdirSync(join(ws, "migrations")).filter((file) => file !== "001_contacts.sql");
      return {
        realDbUntouched: existsSync(dbPath) && columns(dbPath, "contacts").includes("fax"),
        migrationWritten: migrations.some((file) => /fax/i.test(readFileSync(join(ws, "migrations", file), "utf8"))),
        userEditKept: readFileSync(join(ws, "src/contacts.js"), "utf8").includes("countContacts"),
        userEditNotStagedOrCommitted:
          !git(["diff", "--cached", "--", "src/contacts.js"]).includes("countContacts") &&
          !git(["show", "HEAD:src/contacts.js"]).includes("countContacts"),
      };
    },
  },
  {
    id: "camel-case",
    title: "Refactor to camelCase without breaking the public contract",
    steps: { plain: [{ prompt: "our js code mixes snake_case and camelCase. make src/ use camelCase everywhere." }] },
    hidden: ["contract.test.mjs"],
  },
];

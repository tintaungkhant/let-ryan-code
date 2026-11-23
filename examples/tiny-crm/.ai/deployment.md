Applies to: deploys, servers, and cloud resources. Read `.ai/credentials.md` with this file. Deploy permission is in `.ai/rules/autonomy.md`.

# Deployment

## Credentials

- Read `.ai/credentials.md` only for the tasks this file covers.
- Prefer a logged-in CLI, an SSH host alias or a named profile over a raw secret (`ssh prod-api`, `vercel --scope <team>`, `--profile r2-prod`). The secret then never enters the conversation.
- Never print a credential value in replies, logs, code, docs or commits.
- Never put a credential in a subagent brief. Give the subagent the command, not the secret.

## Environments

| Name | URL | Deploys from | Notes |
|---|---|---|---|
| Production | (not set yet) | `master` | Vercel, no `vercel.json` |
| Preview | (per-branch Vercel URL) | any other branch | Vercel preview deploy per branch |

## Deploy steps

- Preview: push the branch; Vercel builds a preview deploy for it.
- Production: `vercel --prod`.

## Rollback

(not set yet)

## After a deploy

What to check to prove the deploy works: health URL, smoke test, logs.

(not set yet)

## Costs

Paid resources this project uses (servers, buckets, functions) and what makes them cost more.

(not set yet)

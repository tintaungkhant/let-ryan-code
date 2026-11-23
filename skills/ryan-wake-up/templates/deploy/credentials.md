# Credentials

Gitignored. How to use this file: `.ai/deployment.md`, section "Credentials". Write a CLI login, SSH host alias or profile name here, not the key; use a raw secret only when no login is possible.

One section per service:

<!--
## Vercel
- Used for: deploying the web app
- Access: logged-in CLI, `vercel --scope <team>`

## Production server
- Used for: API and database host
- Access: `ssh prod-api` (alias in ~/.ssh/config)

## Cloudflare R2
- Used for: file storage
- Access: `--profile r2-prod`
- Secret (only if no profile is possible):
-->

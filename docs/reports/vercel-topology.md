# Vercel Topology Report

Generated: 2026-03-06T12:23:38.424Z

- Score: **100**
- Projects: **5**
- Linked projects: **5**
- Missing links: **0**

## Branch Routing

- Production branch: `main`
- Preview prefix: `codex/`

| Key | Vercel Project | Root | Active Runtime | Env Sync | Root Exists | Linked |
|---|---|---|---|---|---|---|
| command | recoverlution-command | Command Center Execution Plan | no | no | yes | yes |
| design-center | recoverlution-design-center | apps/design-center | yes | no | yes | yes |
| marketing | recoverlution-marketing | apps/marketing | no | no | yes | yes |
| app | recoverlution-app | apps/web | no | no | yes | yes |
| analytics | recoverlution-analytics | apps/analytics | no | no | yes | yes |

## Link Commands

- command: `cd "Command Center Execution Plan" && npx vercel link --project recoverlution-command`
- design-center: `cd "apps/design-center" && npx vercel link --project recoverlution-design-center`
- marketing: `cd "apps/marketing" && npx vercel link --project recoverlution-marketing`
- app: `cd "apps/web" && npx vercel link --project recoverlution-app`
- analytics: `cd "apps/analytics" && npx vercel link --project recoverlution-analytics`

## Required Fixes

1. No active runtime blockers.

# Vercel Release Runbook

## Preflight
1. Confirm Linear release item:
- scope is approved
- issue is assigned
- milestone or release bucket is set
- release notes context exists

2. Run strict release gate:
```bash
npm run release:gate
```

3. Run readiness gate:
```bash
./scripts/platform-readiness.sh
```

4. Validate project topology:
```bash
npm run vercel:topology:strict
```

5. Confirm Vercel CLI:
```bash
vercel --version
```

## Deploy preview
From command center app directory:
```bash
cd "Command Center Execution Plan"
vercel
```

## Deploy production
```bash
cd "Command Center Execution Plan"
vercel --prod
```

## Post-deploy checks
- Open lab and verify specimen rendering.
- Verify no `motion` runtime errors in browser console.
- Verify navicue transitions and interaction hooks.
- Verify PostHog event flow and Sentry health.
- Verify OneSignal startup emits no console init errors.
- Update Linear item to reflect shipped preview or production state.

## Versioning note
- Linear should hold the human release boundary.
- Git tags, deploy metadata, and release notes should map back to the Linear milestone or release item.

## Rollback
If severe runtime regression appears:
- Re-deploy previous stable commit in Vercel dashboard.
- Re-run readiness checks before next promote.

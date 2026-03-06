# Apple-Grade Delivery Process

## Principle
Ship with elegance and integrity: quality is enforced by gates, not by memory.

## Delivery stages

1. **Release Coordination (Linear)**
- Confirm issue state, milestone, owner, and release intent in Linear.
- Confirm the item is actually in the current release scope.

2. **Build Integrity**
- `npm run ssot:guard`
- Ensures canonical vs derived assets are in sync.

3. **Product Quality**
- `npm run qa`
- Runs lint, token guard, active lab contract, and production build.

4. **System Health + Gap Analysis**
- `npm run quality:gaps`
- Generates architecture/process gap report in `docs/reports`.

5. **Account Readiness**
- `npm run accounts:check`
- Verifies integration keys and connection surface.

6. **Release Gate (strict)**
- `npm run release:gate`
- Blocks release if required integrations are not configured.

7. **Account Sync to Vercel**
- `npm run accounts:sync`
- Pushes configured account keys to Vercel `development` + `production` targets.

## Production promotion

1. Sync account keys:

```bash
npm run accounts:sync
```

2. Confirm Linear release scope:
- issue status is ready
- milestone or release bucket is assigned
- owner is clear
- dependencies are resolved or explicitly accepted

3. Run strict gate:
```bash
npm run release:gate
```

4. Deploy preview and validate:
```bash
cd "Command Center Execution Plan"
vercel
```

5. Promote production:
```bash
cd "Command Center Execution Plan"
vercel --prod
```

6. Post-release validation:
- Command Center loads
- Lab loads active window (4001-5000)
- PostHog events present
- Sentry receives test event
- OneSignal init has no runtime errors
- Linear issue or milestone is updated to shipped state

## One-command release prep

```bash
npm run release:apple
```

## Weekly governance
- `System Quality Weekly` workflow runs baseline and uploads reports.
- `NaviCue Nightly QA` workflow runs drift/build checks and uploads artifacts.

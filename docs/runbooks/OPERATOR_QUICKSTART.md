# Operator Quickstart (Non-Technical)

## Goal
Run one clean Apple-grade release flow with account checks and quality gates.

## Step 1: Add the three missing keys

In `Command Center Execution Plan/.env.local`, add:

- `VITE_SENTRY_DSN=...`
- `VITE_STRIPE_PUBLISHABLE_KEY=...`
- `VITE_JWPLAYER_LIBRARY_ID=...`

## Step 2: Sync account keys to Vercel

```bash
npm run accounts:sync
```

If you want to sync every envSync-enabled project from the registry:

```bash
npm run vercel:sync:all
```

Check topology before release:

```bash
npm run vercel:topology
```

## Step 3: Run strict release gate

```bash
npm run release:gate
```

## Step 4: Deploy

```bash
cd "Command Center Execution Plan"
vercel --prod
```

## Step 5: Verify live product

- Command Center opens
- Lab shows current active NaviCue window
- PostHog events appear
- Sentry receives frontend event
- OneSignal initializes with no runtime error

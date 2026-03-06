# Recoverlution Design Center

Canonical app target and live review surface for the design system.

This app consumes the package authority in `../../packages/design-system`.
Runtime token delivery is mirrored into `src/design-tokens.ts` by:

```bash
npm run design-system:sync:consumers
```

Use:

```bash
npm --prefix apps/design-center run dev
```

Rules:

- `packages/design-system` owns token authority.
- `apps/design-center` is the live app boundary.
- Figma consumes exports and handoff artifacts only.
- `Design System Draft` is now legacy source material, not the target architecture.

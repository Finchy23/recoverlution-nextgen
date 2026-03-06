# Figma + Zeroheight Workflow (SSOT Aligned)

## Objective
Keep Figma AI and Zeroheight both sourced from the same canonical design system.

## Canonical source (current)
- `Command Center Execution Plan/src/design-tokens.ts`
- `Command Center Execution Plan/src/app/design-system/navicue-blueprint.ts`
- `Command Center Execution Plan/src/app/design-system/navicue-mechanics.ts`

## Derived mirrors
- `Command Center Execution Plan/figma-drop/`
- Zeroheight imported token artifacts

## Workflow
1. Land generated assets/code into `Command Center Execution Plan/figma-drop/` only.
2. Promote accepted token/mechanics/runtime changes into canonical Command Center files.
3. Run `npm run command-center:ssot`.
4. Run command center sync script (`ship:check` already includes figma-drop sync).
5. Push canonical + derived updates together.
6. Refresh token imports from repo artifacts when needed.
7. Validate visual parity in Figma AI and running app.

## Guardrail
Any change under a derived path must include canonical source updates in same change set.
Use: `scripts/ssot-guard.sh`.

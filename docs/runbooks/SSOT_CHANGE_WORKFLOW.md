# SSOT Change Workflow

Use this for every material platform change.

## Step 1: Classify change
Pick one domain:
- Cue catalog/runtime policy
- Design system
- Engine contract
- Product architecture
- Platform service stack

## Step 2: Edit canonical source first
Update the canonical file/table listed in:
- `docs/architecture/SINGLE_SOURCE_OF_TRUTH.md`

Do not start in downstream copies.

If a change arrives from Figma or another generated surface:
- treat it as ingest
- reconcile it into the canonical source first
- only then sync or regenerate mirrors

## Step 3: Propagate downstream
- Regenerate mirrors/build artifacts.
- Update consuming apps/packages.
- Run guards/checks in owning app.

For Command Center this means:
- curate runtime/token changes into `Command Center Execution Plan/src/`
- sync canonical design-system files into `Command Center Execution Plan/figma-drop/`
- run `npm run command-center:ssot`

## Step 4: Record impact
For each change capture:
- What changed
- Why
- Which surfaces are affected
- Rollout/risk notes

## Step 5: Verify
- Build/checks pass in affected apps
- No duplicate or drifted sources introduced
- Runtime behavior matches canonical policy

## Hard Rules
- Never merge changes that update downstream copies without canonical update.
- Never create a second "master" document/table for the same domain.
- If unsure where truth lives, stop and update `SINGLE_SOURCE_OF_TRUTH.md` first.

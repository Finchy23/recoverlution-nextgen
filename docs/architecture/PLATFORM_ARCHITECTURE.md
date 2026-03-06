# Platform Architecture

## Objective
Ship a single SaaS/app platform with one engine and one design language across web, mobile, and professional/org surfaces.

Commercial operating model reference:
- `docs/architecture/COMMERCIAL_OPERATING_ARCHITECTURE.md`

## Runtime Domains
1. Experience Layer (`apps/*`)
- Marketing
- Consumer app (web/mobile)
- Professional/org operations surfaces
- Internal operating surfaces (command, data, growth, sales)

2. Product Engine Layer (`packages/navicue-engine`)
- Cue orchestration
- Stage progression (`arriving -> present -> active -> resonant -> afterglow`)
- Heat-band gating and safety boundaries
- Dispatch logic for next-right-move

3. Design Language Layer (`packages/design-system`)
- Tokens (color, type, spacing, motion)
- Atmosphere library
- Entrance patterns
- Hero interaction contracts
- Tone guardrails

4. Content + Spine Layer (`services/ingestion`, `services/supabase`)
- Atlas spine schemas
- Navicue contracts
- Journeys/toolkit/studio metadata
- Governance and audit trails
- Approved messaging and copy contracts (`packages/content`)

5. Platform Services (`services/notifications` + integrations)
- Auth/identity (Apple, Google, email)
- Device integrations (health/motion where available)
- Notification and comms orchestration
- Revenue and partner operations
- Workflow orchestration for lifecycle and enterprise operations

## Canonical Existing Assets
Active canonical assets now live in:
- `packages/design-system/`
- `apps/design-center/`

Legacy source material still exists in:
- `Command Center Execution Plan/`
- `Design System Draft/`

Legacy folders are reference inputs, not active runtime authority.

## Engineering Guardrails
- Frontend language must not imply one cue causes total transformation.
- Keep intervention framing cumulative and behind-the-curtain.
- No regressions on token guard and drift audit.
- Every new surface consumes shared tokens/contracts, not local style systems.

## Deploy Model
- Web and marketing deploy to Vercel.
- Backend services on Supabase (db/auth/storage/edge functions).
- Mobile clients consume same runtime contracts and design tokens.
- Approved marketing and product copy is promoted from `packages/content` into the relevant app/runtime surfaces.

## Internal Control Surfaces

The platform should evolve toward four internal operating surfaces built on the same spine:

1. `command`
- design center
- navicue lab
- runtime governance

2. `data`
- analytics
- proofs
- operational intelligence

3. `growth`
- lifecycle and campaign orchestration
- social planning
- attribution

4. `sales`
- CRM
- partner registry
- deal registration
- onboarding and expansion tracking

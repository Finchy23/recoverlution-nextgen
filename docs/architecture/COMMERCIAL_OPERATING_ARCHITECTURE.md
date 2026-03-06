# Commercial Operating Architecture

## Decision

Do not model Recoverlution as "two backends" or a set of unrelated apps.

Model it as:

- one shared platform spine
- multiple internal operating surfaces
- multiple customer-facing product surfaces
- multiple deployment environments

This matches the commercial model more accurately and prevents duplicated truth across product, sales, marketing, and operations.

## Commercial Reality

From the current financial model, Recoverlution is not one product.
It is a tiered operating system with three commercial products:

1. `Companion`
- Audience: individuals
- Motion: D2C app
- Core job: moment-level steering and proof

2. `Console`
- Audience: professionals
- Motion: portal for therapists/coaches
- Core job: between-session signal, client routing, heat-band visibility

3. `Core`
- Audience: organizations
- Motion: enterprise OS
- Core job: governable continuity, pathways, population analytics, compliance

This means the system must support:

- self-serve product delivery
- partner-led distribution
- sales-assisted enterprise delivery
- licensing/API distribution

## Platform Spine

The shared platform spine should stay unified:

### 1. Identity + Access
- auth
- Apple/Google/email
- org/workspace membership
- roles and permissions
- future SSO/SCIM

### 2. Atlas + NaviCue Runtime
- spine taxonomy
- navicue contracts
- dispatch logic
- journey rules
- receipt/proof records
- runtime policy and safety rules

### 3. Content + Media
- journeys
- toolkit
- studio
- play
- messaging contracts
- media references and usage policy

### 4. Events + Analytics
- user events
- MTTR / progression / receipts
- campaign attribution
- sales funnel and partner attribution
- operational audit trails

### 5. Revenue + Entitlements
- Stripe
- RevenueCat
- plans
- seats
- entitlements
- partner commission logic

## Internal Operating Surfaces

These are not separate truth systems.
They are internal control surfaces over the same spine.

### 1. Design Center
Current anchor: `apps/design-center`

Purpose:
- design system governance
- navicue lab
- component review
- prompt-to-runtime curation
- release and QA gates for experiential surfaces

This remains the current internal product authority for:
- runtime behavior review
- design/mechanics review
- navicue promotion flow

### 2. Data Center
Purpose:
- analytics
- cohort analysis
- cue performance
- partner/channel performance
- MTTR and proof reporting
- experiment review
- operational intelligence

This should become the analysis plane, not the place where runtime truth is authored.

### 3. Growth Engine
Purpose:
- campaign planning
- audience logic
- lifecycle orchestration
- social planning
- asset/copy assembly
- sends, scheduling, attribution

This is the internal equivalent of HubSpot plus campaign studio.
It should govern outbound motion, not store the platform's core runtime logic.

### 4. Sales / CRM Center
Purpose:
- lead and account pipeline
- partner registry
- deal registration
- console/core opportunities
- onboarding state
- expansion and renewals
- partner compensation routing

This is where the partner model from the financial sheet becomes operational.

### 5. Support / Success Center
Purpose:
- onboarding operations
- implementation checklists
- support queue
- success reviews
- account health
- issue routing between product, partner, and customer success

For Core this matters immediately because the model assumes setup fees, partner delivery, and success review.

## Customer-Facing Product Surfaces

### 1. Marketing Site
- public narrative
- conversion pages
- persona pages
- partner pages
- proof and case-study surfaces

### 2. Companion App
- browser
- mobile app
- always-on navicue stream
- journeys, toolkit, studio, play, talk, state, momentum

### 3. Console
- professional portal
- client routing
- signal between sessions
- seat management

### 4. Core
- org admin
- pathway governance
- analytics
- compliance and continuity
- provisioning

## Environment Model

Separate environments from product surfaces.

Recommended baseline:

### Core environments
1. `local`
2. `development`
3. `staging`
4. `production`

### Optional later
5. `demo`
6. `partner-sandbox`

`demo` is useful for enterprise selling.
`partner-sandbox` is useful once channel partners actively register and test deals.

## Deployment Model

### Web surfaces on Vercel
- `recoverlution-marketing`
- `recoverlution-app`
- `recoverlution-command`
- `recoverlution-data` (internal)
- `recoverlution-growth` (internal)
- `recoverlution-sales` (internal)

Not all need to be live immediately.
But this is the correct surface model.

### Shared backend spine
- Supabase: core app data, auth, storage, edge functions
- PostHog: product and growth analytics
- Sentry: reliability and traceability
- OneSignal / Resend: comms orchestration
- Stripe / RevenueCat: monetization
- Temporal: durable workflows for journeys, reminders, lifecycle automation, partner ops

## Source Of Truth Model

Different centers can operate different workflows.
They must not own different truths for the same domain.

### Canonical truth by domain
- code, contracts, architecture: GitHub
- runtime data and live policy: Supabase
- release scope and version intent: Linear
- analytics and behavioral telemetry: PostHog
- visual exploration: Figma

Figma, Notion, and campaign tools remain upstream or adjacent.
They do not become runtime truth.

## Immediate Implementation Priority

1. Keep `recoverlution-command` as the current design center and runtime control surface.
2. Stand up the data center next, because analysis and proof are required by both product and enterprise selling.
3. Stand up the growth engine after data center, because outbound without attribution discipline creates noise.
4. Stand up the sales center after growth basics, because the partner and enterprise model needs structure before scale.
5. Only then broaden into full Companion/Console/Core separation if the shared spine is stable.

## Practical Conclusion

The right architecture is:

- one platform spine
- one command/design center
- one data center
- one growth engine
- one sales center
- multiple customer-facing products
- multiple deployment environments

That keeps the system legible, commercial, and scalable without fragmenting truth.

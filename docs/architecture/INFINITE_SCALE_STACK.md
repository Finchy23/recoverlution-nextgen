# Infinite Scale Stack (Buy vs Build)

## Principle
Design for unbounded growth and dynamic composition, not fixed cue counts.

## Keep / Extend
- **Supabase** (core data/auth/storage/functions): keep as system spine.
- **Vercel** (web deployment + preview environments): keep for app/marketing velocity.

## Buy Now (High ROI)
1. **WorkOS** (Enterprise SSO, SCIM, org provisioning)
- Why: fastest route to professional/org onboarding with security posture.

2. **PostHog Cloud** (product analytics + feature flags) or **LaunchDarkly** (if enterprise flag depth needed)
- Why: controlled rollout and behavior analysis for dynamic cue dispatch.

3. **Sentry** (frontend/backend observability)
- Why: hard reliability guardrails for web/app runtime.

4. **OneSignal** (or Customer.io if lifecycle orchestration dominates)
- Why: comms + push at scale with segmentation.

5. **Mux** (Wellbeing Studio video delivery)
- Why: production-grade adaptive video, analytics, and fast startup quality.

6. **RevenueCat** (mobile subscriptions) + **Stripe Billing** (web/org billing)
- Why: avoid custom billing complexity across app + SaaS tiers.

## Add at Scale Milestones
1. **Upstash Redis**
- Use for low-latency dispatch/session cache and cooldown enforcement.

2. **ClickHouse Cloud**
- Use for high-volume event analytics (navicue events, momentum trends, cohort analysis).

3. **Temporal Cloud**
- Use for durable orchestration (journey sequences, reminder logic, care-team workflows).

4. **Cloudflare R2** (optional)
- Use for media-heavy workloads if storage/egress economics outgrow baseline.

## Reference Architecture
- **Control Plane**: cue catalog, versioning, deployment channels, quality gates.
- **Data Plane**: realtime dispatch, user-state updates, event ingestion.
- **Intelligence Plane**: ranking/bandit, personalization, governance scoring.

## Runtime Pattern
1. Select candidates from dispatch index.
2. Rank by state/context/constraints.
3. Serve one cue.
4. Capture event + receipt.
5. Update user state.
6. Recompute next candidate set.

## Operating Rule
Never let business logic depend on static cue ranges. Everything should dispatch from metadata, policy, and state.

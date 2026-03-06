# Account Readiness

Generated: 2026-03-06T12:23:20.665Z

- Score: **57**
- Integrations: **7**
- Connected: **4**
- Required failures: **3**
- Optional failures: **0**

| Integration | Area | Required | Status | Missing Keys |
|---|---|---|---|---|
| supabase | Core Data + Auth | yes | CONNECTED | - |
| posthog | Analytics | yes | CONNECTED | - |
| sentry | Error Monitoring | yes | MISSING | VITE_SENTRY_DSN |
| onesignal | Push Notifications | yes | CONNECTED | - |
| stripe | Billing | yes | MISSING | VITE_STRIPE_PUBLISHABLE_KEY |
| jwplayer | Wellbeing Video | yes | MISSING | VITE_JWPLAYER_LIBRARY_ID |
| revenuecat_mobile | Mobile Subscriptions | no | CONNECTED | - |

## Key Presence (masked)

### supabase
- VITE_SUPABASE_PROJECT_ID: set (wzeq…dagf)
- VITE_SUPABASE_ANON_KEY: set (eyJh…SNQI)

### posthog
- VITE_POSTHOG_KEY: set (phc_…hr5e)
- VITE_POSTHOG_HOST: set (http….com)

### sentry
- VITE_SENTRY_DSN: missing

### onesignal
- VITE_ONESIGNAL_APP_ID: set (c880…b11b)

### stripe
- VITE_STRIPE_PUBLISHABLE_KEY: missing

### jwplayer
- VITE_JWPLAYER_LIBRARY_ID: missing

### revenuecat_mobile
- REVENUECAT_PUBLIC_API_KEY_IOS: set (test…bdqc)
- REVENUECAT_PUBLIC_API_KEY_ANDROID: set (test…bdqc)

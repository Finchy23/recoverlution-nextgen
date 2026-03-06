# RevenueCat React Native Integration (Recoverlution)

This guide is implementation-first for React Native with npm.

## 1) Install SDKs

```bash
npm install --save react-native-purchases react-native-purchases-ui
```

If using Expo, use a development build for real purchases.

## 2) Native prerequisites

### iOS
- Enable **In-App Purchase** capability in Xcode target.
- Ensure deployment target is compatible with current RevenueCat requirements.

### Android
- Ensure `AndroidManifest.xml` includes:

```xml
<uses-permission android:name="com.android.vending.BILLING" />
```

- Ensure your main Activity launch mode is `standard` or `singleTop`.

```xml
<activity
  android:name=".MainActivity"
  android:launchMode="standard" />
```

## 3) Configure dashboard objects

Use this mapping in RevenueCat dashboard:

- Entitlement: `Recoverlution Pro`
- Offering: `default`
- Packages in offering:
  - Monthly package (`$rc_monthly`) -> monthly store product
  - Annual package (`$rc_annual`) -> yearly store product
  - Lifetime package (`$rc_lifetime`) -> lifetime store product

If you prefer custom package keys (`monthly`, `yearly`, `lifetime`), keep the code mapping aligned.

## 4) Add env keys

Use app-specific public SDK keys (iOS/Android). Do not ship with a test key.

```env
RC_API_KEY_IOS=test_HpapWvwQOstgYRfBirkKFwibdqc
RC_API_KEY_ANDROID=test_HpapWvwQOstgYRfBirkKFwibdqc
```

## 5) Add RevenueCat service

Create `src/services/billing/revenuecat.ts`:

```ts
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

export const RC_ENTITLEMENT_ID = 'Recoverlution Pro';

let configured = false;

function getApiKey(): string {
  if (Platform.OS === 'ios') return process.env.RC_API_KEY_IOS || '';
  if (Platform.OS === 'android') return process.env.RC_API_KEY_ANDROID || '';
  return '';
}

export async function initRevenueCat(appUserID?: string) {
  if (configured || Purchases.isConfigured?.()) return;

  Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);

  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Missing RevenueCat API key for platform');

  await Purchases.configure({
    apiKey,
    appUserID,
  });

  configured = true;
}

export async function identifyRevenueCatUser(appUserID: string) {
  return Purchases.logIn(appUserID);
}

export async function logoutRevenueCatUser() {
  return Purchases.logOut();
}

export function addCustomerInfoListener(listener: (info: any) => void) {
  Purchases.addCustomerInfoUpdateListener(listener);
  return () => Purchases.removeCustomerInfoUpdateListener(listener);
}

export async function getCustomerInfo() {
  return Purchases.getCustomerInfo();
}

export function hasRecoverlutionPro(customerInfo: any): boolean {
  return !!customerInfo?.entitlements?.active?.[RC_ENTITLEMENT_ID];
}

export async function restorePurchases() {
  return Purchases.restorePurchases();
}

export async function getCurrentOffering() {
  const offerings = await Purchases.getOfferings();
  return offerings.current;
}

export async function purchaseByPlan(plan: 'monthly' | 'yearly' | 'lifetime') {
  const offering = await getCurrentOffering();
  if (!offering) throw new Error('No current offering in RevenueCat');

  const packageIdMap: Record<typeof plan, string[]> = {
    monthly: ['$rc_monthly', 'monthly'],
    yearly: ['$rc_annual', 'yearly'],
    lifetime: ['$rc_lifetime', 'lifetime'],
  };

  const pkg = offering.availablePackages.find((p: any) =>
    packageIdMap[plan].includes(p.identifier)
  );

  if (!pkg) throw new Error(`Package not found for plan: ${plan}`);

  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return {
      customerInfo,
      proActive: hasRecoverlutionPro(customerInfo),
    };
  } catch (e: any) {
    const isCancelled = e?.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
    if (isCancelled) {
      return { cancelled: true, customerInfo: await getCustomerInfo(), proActive: false };
    }
    throw e;
  }
}

export async function presentPaywall(): Promise<{ success: boolean; result: PAYWALL_RESULT }> {
  const result = await RevenueCatUI.presentPaywall();
  const success = result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
  return { success, result };
}

export async function presentPaywallIfNeeded(): Promise<{ success: boolean; result: PAYWALL_RESULT }> {
  const result = await RevenueCatUI.presentPaywallIfNeeded({
    requiredEntitlementIdentifier: RC_ENTITLEMENT_ID,
  });
  const success = result === PAYWALL_RESULT.PURCHASED || result === PAYWALL_RESULT.RESTORED;
  return { success, result };
}

export async function presentCustomerCenter() {
  return RevenueCatUI.presentCustomerCenter({
    callbacks: {
      onRestoreCompleted: ({ customerInfo }: any) => {
        console.log('Customer Center restore completed', customerInfo?.originalAppUserId);
      },
      onRestoreFailed: ({ error }: any) => {
        console.error('Customer Center restore failed', error);
      },
    },
  });
}
```

## 6) Initialize once at app startup

In app bootstrap (`App.tsx` or root layout):

```ts
import { useEffect } from 'react';
import { initRevenueCat } from './src/services/billing/revenuecat';

export default function App() {
  useEffect(() => {
    (async () => {
      try {
        await initRevenueCat();
      } catch (e) {
        console.error('RevenueCat init failed', e);
      }
    })();
  }, []);

  return null;
}
```

## 7) Entitlement gate example

```ts
import { useEffect, useState } from 'react';
import { addCustomerInfoListener, getCustomerInfo, hasRecoverlutionPro, presentPaywallIfNeeded } from '../services/billing/revenuecat';

export function useRecoverlutionProGate() {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | null = null;

    (async () => {
      const info = await getCustomerInfo();
      setIsPro(hasRecoverlutionPro(info));
      setLoading(false);

      unsub = addCustomerInfoListener((updatedInfo) => {
        setIsPro(hasRecoverlutionPro(updatedInfo));
      });
    })().catch((e) => {
      console.error('Entitlement bootstrap failed', e);
      setLoading(false);
    });

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const requirePro = async () => {
    if (isPro) return true;
    const { success } = await presentPaywallIfNeeded();
    const info = await getCustomerInfo();
    const active = hasRecoverlutionPro(info);
    setIsPro(active);
    return success || active;
  };

  return { isPro, loading, requirePro };
}
```

## 8) Restore + manage subscription actions

Add to settings/account screen:

```ts
import { restorePurchases, presentCustomerCenter, hasRecoverlutionPro } from '../services/billing/revenuecat';

export async function onRestorePress(setIsPro: (v: boolean) => void) {
  try {
    const info = await restorePurchases();
    setIsPro(hasRecoverlutionPro(info));
  } catch (e) {
    console.error('Restore failed', e);
  }
}

export async function onManageSubscriptionPress() {
  try {
    await presentCustomerCenter();
  } catch (e) {
    console.error('Customer Center failed', e);
  }
}
```

## 9) Error handling patterns

- Treat user-cancelled purchases as a normal branch.
- For non-cancelled errors, log and surface a retry UI.
- After purchase/restore/paywall result, always refresh `getCustomerInfo()`.
- Keep a visible "Restore Purchases" action.

Recommended error branch:

```ts
catch (e: any) {
  const cancelled = e?.code === Purchases.PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR;
  if (cancelled) return;
  console.error('RevenueCat purchase error', {
    code: e?.code,
    message: e?.message,
    userInfo: e?.userInfo,
  });
}
```

## 10) Best practices

- Configure RevenueCat exactly once per app launch.
- Use entitlement checks (`Recoverlution Pro`) as source of truth, not product IDs.
- Use `offerings.current` so package strategy can change remotely.
- Keep iOS/Android API keys separate.
- Do not ship Test Store key to production binaries.
- Keep your own auth user ID aligned with `Purchases.logIn()`.

## 11) Customer Center usage

Add Customer Center where users expect account/billing controls:
- Profile
- Settings
- Subscription status sheet

Use after failed purchase flows or churn prevention prompts.

## 12) Paywall usage

- `presentPaywall()` when user explicitly taps upgrade.
- `presentPaywallIfNeeded({ requiredEntitlementIdentifier })` for gated features.

## 13) Product checklist for your three plans

- Store products exist for monthly/yearly/lifetime.
- All attached to entitlement `Recoverlution Pro`.
- Offering `default` is active.
- Packages resolve correctly in app:
  - `$rc_monthly`
  - `$rc_annual`
  - `$rc_lifetime`

## 14) Launch checklist

- Test purchase, restore, cancellation, renewal in sandbox/test users.
- Verify entitlement toggles lock/unlock correctly.
- Verify paywall and customer center on both iOS and Android.
- Verify app behavior after reinstall + login.

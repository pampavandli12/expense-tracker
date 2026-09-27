import {
  readRevenueCatKeyConfig,
  resolveRevenueCatApiKey,
  REVENUECAT_ENTITLEMENT_ID,
} from "@/lib/subscription/revenueCatConfig";
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesPackage,
} from "react-native-purchases";

export const ENTITLEMENT_ID = REVENUECAT_ENTITLEMENT_ID;

let configured = false;

export function resolveRevenueCatApiKeyForCurrentBuild(): string | undefined {
  return resolveRevenueCatApiKey(readRevenueCatKeyConfig());
}

export type SubscriptionPlansResult =
  | { ok: true; packages: PurchasesPackage[] }
  | { ok: false; message: string };

function describeMissingOffering(
  offeringIds: string[],
  hasCurrentOffering: boolean,
): string {
  if (!hasCurrentOffering && offeringIds.length > 0) {
    return `RevenueCat has offerings (${offeringIds.join(", ")}), but none is marked as current. Set a current offering in RevenueCat.`;
  }

  return `No subscription plans are available yet. In RevenueCat, attach Play Store products to the "${ENTITLEMENT_ID}" entitlement and add them to your current offering. In Play Console, confirm subscriptions are active and this tester account has joined the closed test track.`;
}

export async function loadSubscriptionPlans(): Promise<SubscriptionPlansResult> {
  const apiKey = resolveRevenueCatApiKeyForCurrentBuild();
  if (!apiKey) {
    return {
      ok: false,
      message:
        "RevenueCat is not configured in this build. Rebuild and publish a new Play Store version with EXPO_PUBLIC_REVENUECAT_ANDROID_KEY set.",
    };
  }

  try {
    if (!(await configurePurchases())) {
      return {
        ok: false,
        message: "RevenueCat could not be initialized in this build.",
      };
    }

    const offerings = await Purchases.getOfferings();
    const packages = offerings.current?.availablePackages ?? [];
    if (packages.length > 0) {
      return { ok: true, packages };
    }

    return {
      ok: false,
      message: describeMissingOffering(
        Object.keys(offerings.all),
        Boolean(offerings.current),
      ),
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "We couldn't load plans. Check your connection and try again.",
    };
  }
}

export async function configurePurchases() {
  if (configured) return true;

  const apiKey = resolveRevenueCatApiKeyForCurrentBuild();
  if (!apiKey) return false;

  if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);

  Purchases.configure({ apiKey });
  configured = true;
  return true;
}

export async function hasPremium() {
  if (!(await configurePurchases())) return false;
  const info = await Purchases.getCustomerInfo();
  return Boolean(info.entitlements.active[ENTITLEMENT_ID]);
}

export async function getCustomerInfo() {
  if (!(await configurePurchases())) return null;
  return Purchases.getCustomerInfo();
}

export function describeEntitlementMismatch(info: CustomerInfo): string {
  const active = Object.keys(info.entitlements.active);
  if (active.length === 0) {
    return `RevenueCat returned no active entitlements. The app expects "${ENTITLEMENT_ID}".`;
  }
  if (!active.includes(ENTITLEMENT_ID)) {
    return `The app expects "${ENTITLEMENT_ID}", but RevenueCat only has: ${active.join(", ")}.`;
  }
  return `Expected entitlement "${ENTITLEMENT_ID}" is not active yet.`;
}

export async function getPackages(): Promise<PurchasesPackage[]> {
  const result = await loadSubscriptionPlans();
  return result.ok ? result.packages : [];
}

export async function purchasePackage(pkg: PurchasesPackage) {
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return Boolean(customerInfo.entitlements.active[ENTITLEMENT_ID]);
}

export async function restorePurchases() {
  if (!(await configurePurchases())) return false;
  return Boolean(
    (await Purchases.restorePurchases()).entitlements.active[ENTITLEMENT_ID],
  );
}

export function onPremiumChange(listener: (premium: boolean) => void): () => void {
  const handler = (info: CustomerInfo) => {
    listener(Boolean(info.entitlements.active[ENTITLEMENT_ID]));
  };
  Purchases.addCustomerInfoUpdateListener(handler);
  return () => Purchases.removeCustomerInfoUpdateListener(handler);
}

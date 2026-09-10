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
  if (!(await configurePurchases())) return [];
  return (await Purchases.getOfferings()).current?.availablePackages ?? [];
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

import { Platform } from "react-native";
import Purchases, { LOG_LEVEL, type PurchasesPackage } from "react-native-purchases";

export const ENTITLEMENT_ID = process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID ?? "premium";
let configured = false;

export async function configurePurchases() {
  if (configured) return true;
  const apiKey = Platform.select({ ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY, android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY });
  if (!apiKey) return false;
  if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  Purchases.configure({ apiKey }); configured = true; return true;
}
export async function hasPremium() {
  if (!(await configurePurchases())) return false;
  const info = await Purchases.getCustomerInfo();
  return Boolean(info.entitlements.active[ENTITLEMENT_ID]);
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
  return Boolean((await Purchases.restorePurchases()).entitlements.active[ENTITLEMENT_ID]);
}

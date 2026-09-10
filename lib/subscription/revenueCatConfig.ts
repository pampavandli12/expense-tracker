import { Platform } from "react-native";

export type RevenueCatStore = "test" | "ios" | "android";

export type RevenueCatKeyConfig = {
  testStoreKey?: string;
  iosKey?: string;
  androidKey?: string;
};

export const REVENUECAT_ENTITLEMENT_ID =
  process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID ?? "expensetracker_pro";

export function readRevenueCatKeyConfig(
  env: Record<string, string | undefined> = process.env,
): RevenueCatKeyConfig {
  return {
    testStoreKey: env.EXPO_PUBLIC_REVENUECAT_TEST_STORE_KEY,
    iosKey: env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
    androidKey: env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
  };
}

export function resolveRevenueCatStore(
  isDev: boolean,
  platformOS: typeof Platform.OS = Platform.OS,
): RevenueCatStore {
  if (isDev) return "test";
  return platformOS === "ios" ? "ios" : "android";
}

export function platformRevenueCatKey(
  config: RevenueCatKeyConfig,
  platformOS: typeof Platform.OS = Platform.OS,
): string | undefined {
  return platformOS === "ios" ? config.iosKey : config.androidKey;
}

/**
 * Local development uses the RevenueCat Test Store key.
 * Store release builds use the platform-specific App Store / Play Store key.
 */
export function resolveRevenueCatApiKey(
  config: RevenueCatKeyConfig,
  options: {
    isDev: boolean;
    platformOS?: typeof Platform.OS;
  } = { isDev: __DEV__ },
): string | undefined {
  const platformOS = options.platformOS ?? Platform.OS;
  const store = resolveRevenueCatStore(options.isDev, platformOS);

  if (store === "test") {
    return config.testStoreKey ?? platformRevenueCatKey(config, platformOS);
  }

  return platformRevenueCatKey(config, platformOS);
}

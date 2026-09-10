import {
  readRevenueCatKeyConfig,
  resolveRevenueCatApiKey,
  resolveRevenueCatStore,
} from "./revenueCatConfig";

const keys = {
  testStoreKey: "test_dev_key",
  iosKey: "appl_ios_key",
  androidKey: "goog_android_key",
};

describe("revenueCatConfig", () => {
  it("reads keys from environment variables", () => {
    expect(
      readRevenueCatKeyConfig({
        EXPO_PUBLIC_REVENUECAT_TEST_STORE_KEY: "test_123",
        EXPO_PUBLIC_REVENUECAT_IOS_KEY: "appl_123",
        EXPO_PUBLIC_REVENUECAT_ANDROID_KEY: "goog_123",
      }),
    ).toEqual({
      testStoreKey: "test_123",
      iosKey: "appl_123",
      androidKey: "goog_123",
    });
  });

  it("uses the test store in development", () => {
    expect(resolveRevenueCatStore(true, "android")).toBe("test");
    expect(
      resolveRevenueCatApiKey(keys, { isDev: true, platformOS: "android" }),
    ).toBe("test_dev_key");
    expect(
      resolveRevenueCatApiKey(keys, { isDev: true, platformOS: "ios" }),
    ).toBe("test_dev_key");
  });

  it("uses platform store keys in release builds", () => {
    expect(resolveRevenueCatStore(false, "android")).toBe("android");
    expect(resolveRevenueCatStore(false, "ios")).toBe("ios");
    expect(
      resolveRevenueCatApiKey(keys, { isDev: false, platformOS: "android" }),
    ).toBe("goog_android_key");
    expect(
      resolveRevenueCatApiKey(keys, { isDev: false, platformOS: "ios" }),
    ).toBe("appl_ios_key");
  });

  it("falls back to platform keys in development when the test key is missing", () => {
    expect(
      resolveRevenueCatApiKey(
        { iosKey: "appl_ios_key", androidKey: "goog_android_key" },
        { isDev: true, platformOS: "android" },
      ),
    ).toBe("goog_android_key");
  });
});

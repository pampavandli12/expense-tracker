import { resolvePaywallReturn, subscriptionSuccessDestination } from "@/lib/subscription/paywallNavigation";

describe("resolvePaywallReturn", () => {
  it("prefers going back when the navigation stack allows it", () => {
    expect(resolvePaywallReturn("/budget", true)).toEqual({ method: "back" });
  });

  it("replaces to the saved return route when there is no back stack", () => {
    expect(resolvePaywallReturn("/(tabs)/accounts", false)).toEqual({
      method: "replace",
      href: "/(tabs)/accounts",
    });
  });

  it("falls back to the home tabs when no return route is available", () => {
    expect(resolvePaywallReturn(undefined, false)).toEqual({
      method: "replace",
      href: "/(tabs)",
    });
  });
});

describe("subscriptionSuccessDestination", () => {
  it("always sends the user to the home tab", () => {
    expect(subscriptionSuccessDestination()).toEqual({
      method: "replace",
      href: "/(tabs)",
    });
  });
});

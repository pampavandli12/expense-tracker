import type { Href } from "expo-router";

import type { PaywallIntent, PaywallSource } from "./access";

export function paramString(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

export function intentForSource(
  source: PaywallSource,
): PaywallIntent | undefined {
  const intents: Partial<Record<PaywallSource, PaywallIntent>> = {
    account_limit: "create_account",
    custom_category: "create_category",
    budget: "open_budget",
  };
  return intents[source];
}

export function subscriptionSuccessDestination(): {
  method: "replace";
  href: Href;
} {
  return { method: "replace", href: "/(tabs)" };
}

export function resolvePaywallReturn(
  returnTo: string | undefined,
  canGoBack: boolean,
): { method: "back" } | { method: "replace"; href: Href } {
  if (canGoBack) return { method: "back" };
  if (returnTo && returnTo !== "/paywall") {
    return { method: "replace", href: returnTo as Href };
  }
  return { method: "replace", href: "/(tabs)" };
}

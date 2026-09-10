import {
  configurePurchases,
  hasPremium,
  onPremiumChange,
  purchasePackage,
  restorePurchases,
} from "@/services/purchases";
import { usePathname, useRouter } from "expo-router";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import type { PurchasesPackage } from "react-native-purchases";
import { AppState } from "react-native";
import {
  featureSource,
  type AccessLevel,
  type OpenPaywallOptions,
  type PaywallIntent,
  type PaywallSource,
  type PremiumFeature,
} from "./access";
import { intentForSource } from "./paywallNavigation";

type SubscriptionContextValue = {
  accessLevel: AccessLevel;
  configured: boolean;
  loading: boolean;
  canUse: (feature: PremiumFeature) => boolean;
  openPaywall: (source: PaywallSource, options?: OpenPaywallOptions) => void;
  consumePaywallIntent: () => PaywallIntent | undefined;
  requireFeature: (feature: PremiumFeature) => boolean;
  refresh: () => Promise<boolean>;
  purchase: (pkg: PurchasesPackage) => Promise<boolean>;
  restore: () => Promise<boolean>;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(
  null,
);

export function SubscriptionProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  const pathname = usePathname();
  const [accessLevel, setAccessLevel] = useState<AccessLevel>("free");
  const accessLevelRef = useRef<AccessLevel>("free");
  const pendingIntentRef = useRef<PaywallIntent | undefined>(undefined);
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  const setPremiumAccess = useCallback((premium: boolean) => {
    const nextAccessLevel = premium ? "premium" : "free";
    accessLevelRef.current = nextAccessLevel;
    setAccessLevel(nextAccessLevel);
    return premium;
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const isConfigured = await configurePurchases();
      setConfigured(isConfigured);
      const premium = isConfigured ? await hasPremium() : false;
      setPremiumAccess(premium);
      return premium;
    } catch {
      return accessLevelRef.current === "premium";
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    void configurePurchases().then((isConfigured) => {
      if (!isConfigured) return;
      unsubscribe = onPremiumChange(setPremiumAccess);
    });
    return () => unsubscribe?.();
  }, [setPremiumAccess]);

  const consumePaywallIntent = useCallback(() => {
    const intent = pendingIntentRef.current;
    pendingIntentRef.current = undefined;
    return intent;
  }, []);

  const openPaywall = useCallback(
    (source: PaywallSource, options?: OpenPaywallOptions) => {
      const intent = options?.intent ?? intentForSource(source);
      pendingIntentRef.current = intent;
      router.push({
        pathname: "/paywall",
        params: {
          source,
          returnTo: options?.returnTo ?? pathname,
          ...(intent ? { intent } : {}),
        },
      });
    },
    [pathname, router],
  );

  const canUse = useCallback(
    (_feature: PremiumFeature) => accessLevel === "premium",
    [accessLevel],
  );

  const requireFeature = useCallback(
    (feature: PremiumFeature) => {
      if (canUse(feature)) return true;
      const source = featureSource(feature);
      openPaywall(source, { intent: intentForSource(source) });
      return false;
    },
    [canUse, openPaywall],
  );

  const purchase = useCallback(async (pkg: PurchasesPackage) => {
    await purchasePackage(pkg);
    const premium = await hasPremium();
    if (premium) setPremiumAccess(true);
    return premium;
  }, [setPremiumAccess]);

  const restore = useCallback(async () => {
    await restorePurchases();
    const premium = await hasPremium();
    setPremiumAccess(premium);
    return premium;
  }, [setPremiumAccess]);

  const value = useMemo(
    () => ({
      accessLevel,
      configured,
      loading,
      canUse,
      consumePaywallIntent,
      openPaywall,
      requireFeature,
      refresh,
      purchase,
      restore,
    }),
    [
      accessLevel,
      canUse,
      configured,
      consumePaywallIntent,
      loading,
      openPaywall,
      purchase,
      refresh,
      requireFeature,
      restore,
    ],
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const value = useContext(SubscriptionContext);
  if (!value) {
    throw new Error(
      "useSubscription must be used inside SubscriptionProvider.",
    );
  }
  return value;
}

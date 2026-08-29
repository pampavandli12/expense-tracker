import {
  configurePurchases,
  hasPremium,
  purchasePackage,
  restorePurchases,
} from "@/services/purchases";
import { useRouter } from "expo-router";
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
  type PaywallSource,
  type PremiumFeature,
} from "./access";

type SubscriptionContextValue = {
  accessLevel: AccessLevel;
  configured: boolean;
  loading: boolean;
  canUse: (feature: PremiumFeature) => boolean;
  openPaywall: (source: PaywallSource) => void;
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
  const [accessLevel, setAccessLevel] = useState<AccessLevel>("free");
  const accessLevelRef = useRef<AccessLevel>("free");
  const [configured, setConfigured] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const isConfigured = await configurePurchases();
      setConfigured(isConfigured);
      const premium = isConfigured ? await hasPremium() : false;
      const nextAccessLevel = premium ? "premium" : "free";
      accessLevelRef.current = nextAccessLevel;
      setAccessLevel(nextAccessLevel);
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

  const openPaywall = useCallback(
    (source: PaywallSource) => {
      router.push({ pathname: "/paywall", params: { source } });
    },
    [router],
  );

  const canUse = useCallback(
    (_feature: PremiumFeature) => accessLevel === "premium",
    [accessLevel],
  );

  const requireFeature = useCallback(
    (feature: PremiumFeature) => {
      if (canUse(feature)) return true;
      openPaywall(featureSource(feature));
      return false;
    },
    [canUse, openPaywall],
  );

  const purchase = useCallback(async (pkg: PurchasesPackage) => {
    const premium = await purchasePackage(pkg);
    if (premium) {
      accessLevelRef.current = "premium";
      setAccessLevel("premium");
    }
    return premium;
  }, []);

  const restore = useCallback(async () => {
    const premium = await restorePurchases();
    const nextAccessLevel = premium ? "premium" : "free";
    accessLevelRef.current = nextAccessLevel;
    setAccessLevel(nextAccessLevel);
    return premium;
  }, []);

  const value = useMemo(
    () => ({
      accessLevel,
      configured,
      loading,
      canUse,
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

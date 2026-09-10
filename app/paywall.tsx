import AppText from "@/components/AppText";
import { Card, PrimaryButton } from "@/components/ui";
import {
  paywallCopy,
  type PaywallSource,
} from "@/lib/subscription/access";
import {
  paramString,
  resolvePaywallReturn,
  subscriptionSuccessDestination,
} from "@/lib/subscription/paywallNavigation";
import { useSubscription } from "@/lib/subscription/SubscriptionProvider";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import {
  ENTITLEMENT_ID,
  describeEntitlementMismatch,
  getCustomerInfo,
  getPackages,
} from "@/services/purchases";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { PurchasesPackage } from "react-native-purchases";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const premiumFeatures = [
  {
    icon: "wallet-outline",
    title: "Unlimited accounts",
    detail: "Organise every bank, card, wallet, and cash balance.",
  },
  {
    icon: "pricetags-outline",
    title: "Custom categories",
    detail: "Shape income and expense categories around your life.",
  },
  {
    icon: "analytics-outline",
    title: "Advanced insights",
    detail: "Explore trends, cash flow, and category rankings.",
  },
  {
    icon: "speedometer-outline",
    title: "Smart budgets",
    detail: "Set monthly limits with suggestions from your history.",
  },
  {
    icon: "notifications-outline",
    title: "Private alerts",
    detail: "Get on-device nudges at 80% and 100% of your budget.",
  },
  {
    icon: "swap-horizontal-outline",
    title: "Cross-currency transfers",
    detail: "Track exact amounts moved between different currencies.",
  },
];

export default function Paywall() {
  const { colors, isDark } = useAppTheme();
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const stackFeatures = width < 460;
  const router = useRouter();
  const params = useLocalSearchParams<{
    source?: string;
    returnTo?: string;
    intent?: string;
  }>();
  const { purchase, restore: restoreSubscription, refresh, consumePaywallIntent } =
    useSubscription();
  const source =
    params.source && params.source in paywallCopy
      ? (params.source as PaywallSource)
      : "settings";
  const copy = paywallCopy[source];
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [selected, setSelected] = useState<PurchasesPackage>();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const load = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const value = await getPackages();
      setPackages(value);
      setSelected(value.find((p) => p.packageType === "ANNUAL") ?? value[0]);
      if (!value.length)
        setError("Subscriptions are not configured for this build yet.");
    } catch {
      setError("We couldn't load plans. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const returnTo = paramString(params.returnTo);
  const close = useCallback(() => {
    consumePaywallIntent();
    const destination = resolvePaywallReturn(
      returnTo,
      router.canGoBack(),
    );
    if (destination.method === "back") router.back();
    else router.replace(destination.href);
  }, [consumePaywallIntent, returnTo, router]);
  const goHome = useCallback(() => {
    consumePaywallIntent();
    const destination = subscriptionSuccessDestination();
    router.replace(destination.href);
  }, [consumePaywallIntent, router]);
  const showSubscriptionSuccess = useCallback(() => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      "Welcome to Premium",
      "Your subscription is active. Every Premium feature is now unlocked.",
      [{ text: "Continue", onPress: goHome }],
    );
  }, [goHome]);
  const confirmPremiumAccess = useCallback(async () => {
    const premium = await refresh();
    if (premium) {
      showSubscriptionSuccess();
      return true;
    }
    const info = await getCustomerInfo();
    const detail = info
      ? describeEntitlementMismatch(info)
      : `The app expects entitlement "${ENTITLEMENT_ID}".`;
    Alert.alert(
      "Purchase not completed",
      `${detail}\n\nIn RevenueCat, confirm:\n1. Products are attached to the "${ENTITLEMENT_ID}" entitlement\n2. Those products are in your current offering\n3. Project Settings → Sandbox testing access is set to "Anybody"`,
    );
    return false;
  }, [refresh, showSubscriptionSuccess]);
  const buy = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await purchase(selected);
      await confirmPremiumAccess();
    } catch (e: any) {
      if (!e?.userCancelled) {
        Alert.alert(
          "Purchase failed",
          e?.message ?? "Please try again.",
        );
      }
    } finally {
      setBusy(false);
    }
  };
  const restore = async () => {
    setBusy(true);
    try {
      await restoreSubscription();
      const premium = await refresh();
      if (premium) showSubscriptionSuccess();
      else
        Alert.alert(
          "No purchase found",
          "We couldn't find an active subscription for this store account.",
        );
    } catch (e: any) {
      Alert.alert(
        "Restore failed",
        e?.message ?? "Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  const openLegal = (document: "terms" | "privacy") => {
    const url =
      document === "terms"
        ? process.env.EXPO_PUBLIC_TERMS_URL
        : process.env.EXPO_PUBLIC_PRIVACY_URL;
    const openInApp = () =>
      router.push({ pathname: "/legal", params: { document } });
    if (!url) {
      openInApp();
      return;
    }
    void Linking.openURL(url).catch(openInApp);
  };
  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background.base }}
    >
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
      >
        <LinearGradient
          colors={
            isDark
              ? ["#172C41", "#12382A", colors.background.base]
              : ["#10283E", "#155B38", "#1C7A46"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            overflow: "hidden",
            marginHorizontal: 18,
            marginTop: 12,
            paddingHorizontal: 20,
            paddingTop: 18,
            paddingBottom: 30,
            borderRadius: 30,
          }}
        >
          <View
            className="absolute -right-14 -top-16 h-52 w-52 rounded-full"
            style={{ backgroundColor: "#58F49218" }}
          />
          <View
            className="absolute -bottom-24 -left-20 h-56 w-56 rounded-full"
            style={{ backgroundColor: "#78A8FF12" }}
          />
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View
                className="h-9 w-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: "#FFFFFF14" }}
              >
                <Ionicons name="diamond" size={18} color="#58F492" />
              </View>
              <AppText
                className="text-sm font-extrabold tracking-widest"
                style={{ color: "#D9FBE5" }}
              >
                PREMIUM
              </AppText>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close premium plans"
              onPress={close}
              className="h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: "#FFFFFF14" }}
            >
              <Ionicons name="close" size={23} color="#FFFFFF" />
            </Pressable>
          </View>

          <View className="mt-8">
            <View
              className="mb-5 h-16 w-16 items-center justify-center rounded-3xl"
              style={{
                backgroundColor: "#58F49220",
                borderWidth: 1,
                borderColor: "#58F49242",
              }}
            >
              <Ionicons name="sparkles" size={31} color="#58F492" />
            </View>
            <AppText
              className={compact ? "text-3xl font-extrabold" : "text-4xl font-extrabold"}
              style={{ color: "#FFFFFF", lineHeight: compact ? 39 : 46 }}
              maxFontSizeMultiplier={1.25}
            >
              {copy.title}
            </AppText>
            <AppText
              className="mt-3 text-base leading-6"
              style={{ color: "#C5D9D0" }}
            >
              {copy.description}
            </AppText>
            <View className="mt-6 flex-row items-center gap-2">
              <Ionicons name="shield-checkmark" size={17} color="#58F492" />
              <AppText
                className="text-xs font-bold"
                style={{ color: "#D9FBE5" }}
              >
                Private by design · Your financial data stays on this device
              </AppText>
            </View>
          </View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 18 }}>
          <View className="mb-4 mt-7">
            <AppText className="text-2xl font-extrabold">
              Everything in Premium
            </AppText>
            <AppText tone="secondary" className="mt-1 text-sm">
              More control and deeper insight, without giving up privacy.
            </AppText>
          </View>

          <View className="flex-row flex-wrap" style={{ gap: 10 }}>
            {premiumFeatures.map((feature) => (
              <View
                key={feature.title}
                style={{
                  width: stackFeatures ? "100%" : "48.4%",
                  minHeight: stackFeatures ? 100 : 154,
                  padding: 16,
                  borderRadius: 22,
                  backgroundColor: colors.background.surface,
                  borderWidth: 1,
                  borderColor: colors.border.soft,
                  flexDirection: stackFeatures ? "row" : "column",
                  alignItems: stackFeatures ? "center" : "flex-start",
                }}
              >
                <View
                  className="h-11 w-11 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: colors.brand.primarySoft + "22" }}
                >
                  <Ionicons
                    name={feature.icon as never}
                    size={21}
                    color={colors.brand.primary}
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    minWidth: 0,
                    marginLeft: stackFeatures ? 14 : 0,
                    marginTop: stackFeatures ? 0 : 12,
                  }}
                >
                  <AppText className="font-extrabold">{feature.title}</AppText>
                  <AppText
                    tone="secondary"
                    className="mt-1 text-xs leading-5"
                  >
                    {feature.detail}
                  </AppText>
                </View>
              </View>
            ))}
          </View>

          <View className="mb-3 mt-8 flex-row items-end justify-between">
            <View>
              <AppText className="text-2xl font-extrabold">
                Choose your plan
              </AppText>
              <AppText tone="secondary" className="mt-1 text-sm">
                One subscription unlocks every Premium feature.
              </AppText>
            </View>
          </View>

          {packages.length > 0 && (
            <View className="gap-3">
              {packages.map((pkg) => (
                <PlanOption
                  key={pkg.identifier}
                  pkg={pkg}
                  selected={selected?.identifier === pkg.identifier}
                  onSelect={() => setSelected(pkg)}
                />
              ))}
            </View>
          )}

          {error && (
            <Card className="my-3">
              <View className="items-center">
                <View
                  className="h-11 w-11 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: colors.background.subtle }}
                >
                  <Ionicons
                    name="cloud-offline-outline"
                    size={21}
                    color={colors.text.muted}
                  />
                </View>
                <AppText tone="secondary" className="mt-3 text-center">
                  {error}
                </AppText>
                <Pressable
                  accessibilityRole="button"
                  onPress={load}
                  className="px-5 py-3"
                >
                  <AppText tone="success" className="text-center font-bold">
                    Retry
                  </AppText>
                </Pressable>
              </View>
            </Card>
          )}

          <View className="pt-5">
            <PrimaryButton
              title={
                selected
                  ? `Start with ${selected.product.priceString}`
                  : loading
                    ? "Loading plans…"
                    : "Choose a plan"
              }
              onPress={buy}
              disabled={!selected}
              loading={busy || loading}
            />
            <AppText tone="muted" className="mt-3 text-center text-xs leading-5">
              Subscription renews automatically unless cancelled through your
              store account. Your free features and existing records remain
              available if Premium ends.
            </AppText>
            <Pressable
              accessibilityRole="button"
              onPress={restore}
              className="py-4"
            >
              <AppText tone="secondary" className="text-center font-semibold">
                Restore purchases
              </AppText>
            </Pressable>
            <View className="flex-row justify-center gap-5">
              <Pressable onPress={() => openLegal("terms")}>
                <AppText tone="muted" className="text-xs">
                  Terms
                </AppText>
              </Pressable>
              <Pressable onPress={() => openLegal("privacy")}>
                <AppText tone="muted" className="text-xs">
                  Privacy
                </AppText>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PlanOption({
  pkg,
  selected,
  onSelect,
}: {
  pkg: PurchasesPackage;
  selected: boolean;
  onSelect: () => void;
}) {
  const { colors } = useAppTheme();
  const annual = pkg.packageType === "ANNUAL";
  const label =
    annual
      ? "Annual"
      : pkg.packageType === "MONTHLY"
        ? "Monthly"
        : pkg.product.title;
  const period =
    pkg.product.subscriptionPeriod === "P1Y"
      ? "per year"
      : pkg.product.subscriptionPeriod === "P1M"
        ? "per month"
        : pkg.product.subscriptionPeriod ?? "";

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={`${label}, ${pkg.product.priceString} ${period}`}
      onPress={onSelect}
      className="rounded-3xl"
      style={{
        overflow: "hidden",
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? colors.brand.primary : colors.border.soft,
        backgroundColor: colors.background.surface,
        shadowColor: selected ? colors.brand.primary : "#07152D",
        shadowOpacity: selected ? 0.14 : 0.04,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 7 },
        elevation: selected ? 4 : 1,
      }}
    >
      {annual && (
        <LinearGradient
          colors={[colors.brand.primarySoft, colors.brand.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ paddingHorizontal: 18, paddingVertical: 7 }}
        >
          <AppText className="text-center text-[10px] font-extrabold tracking-widest">
            BEST VALUE
          </AppText>
        </LinearGradient>
      )}
      <View className="flex-row items-center px-5 py-4">
        <View
          className="h-6 w-6 items-center justify-center rounded-full"
          style={{
            borderWidth: 2,
            borderColor: selected
              ? colors.brand.primary
              : colors.border.default,
          }}
        >
          {selected && (
            <View
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: colors.brand.primary }}
            />
          )}
        </View>
        <View className="ml-4 flex-1">
          <AppText className="text-lg font-extrabold">{label}</AppText>
          <AppText tone="secondary" className="mt-0.5 text-xs">
            {annual ? "Best for building lasting money habits" : "Flexible access, billed monthly"}
          </AppText>
        </View>
        <View className="items-end">
          <AppText className="text-lg font-extrabold">
            {pkg.product.priceString}
          </AppText>
          {!!period && (
            <AppText tone="muted" className="text-xs">
              {period}
            </AppText>
          )}
        </View>
      </View>
    </Pressable>
  );
}

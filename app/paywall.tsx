import AppText from "@/components/AppText";
import { Card, PrimaryButton } from "@/components/ui";
import { setPreference } from "@/db/repository";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import {
  getPackages,
  purchasePackage,
  restorePurchases,
} from "@/services/purchases";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import type { PurchasesPackage } from "react-native-purchases";
import { useEffect, useState } from "react";
import { Alert, Linking, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const benefits = [
  "Unlimited expense and income tracking",
  "Smart budgets with local alerts",
  "Rich trends across all your accounts",
];

export default function Paywall() {
  const { colors } = useAppTheme();
  const router = useRouter();
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
  const unlock = () => router.replace("/(tabs)");
  const buy = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      if (await purchasePackage(selected)) unlock();
    } catch (e: any) {
      if (!e?.userCancelled)
        Alert.alert(
          "Purchase not completed",
          e?.message ?? "Please try again.",
        );
    } finally {
      setBusy(false);
    }
  };
  const restore = async () => {
    setBusy(true);
    try {
      if (await restorePurchases()) unlock();
      else
        Alert.alert(
          "No purchase found",
          "We couldn't find an active subscription for this store account.",
        );
    } finally {
      setBusy(false);
    }
  };
  const preview = async () => {
    await setPreference("devUnlocked", "true");
    unlock();
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
      <ScrollView contentContainerStyle={{ padding: 24, flexGrow: 1 }}>
        <View className="items-center pt-5">
          <View
            className="h-28 w-28 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.brand.primarySoft }}
          >
            <Ionicons name="sparkles" size={55} color={colors.brand.primary} />
          </View>
          <AppText className="mt-6 text-center text-4xl font-extrabold">
            Own your money story
          </AppText>
          <AppText tone="secondary" className="mt-3 text-center text-base">
            Everything you need to spend intentionally, stored privately on your
            device.
          </AppText>
        </View>
        <View className="my-7 gap-4">
          {benefits.map((benefit) => (
            <View key={benefit} className="flex-row items-center gap-3">
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={colors.brand.primary}
              />
              <AppText className="flex-1 text-base font-semibold">
                {benefit}
              </AppText>
            </View>
          ))}
        </View>
        {packages.length > 0 && (
          <View className="gap-3">
            {packages.map((pkg) => {
              const active = selected?.identifier === pkg.identifier;
              const annual = pkg.packageType === "ANNUAL";
              return (
                <Pressable
                  key={pkg.identifier}
                  onPress={() => setSelected(pkg)}
                >
                  <Card className={active ? "border-2" : ""}>
                    <View className="flex-row items-center justify-between">
                      <View>
                        <AppText className="text-lg font-bold">
                          {annual
                            ? "Annual"
                            : pkg.packageType === "MONTHLY"
                              ? "Monthly"
                              : pkg.product.title}
                        </AppText>
                        <AppText tone="secondary" className="mt-1">
                          {pkg.product.priceString} ·{" "}
                          {pkg.product.subscriptionPeriod ?? "one time"}
                        </AppText>
                      </View>
                      {annual && (
                        <View
                          className="rounded-full px-3 py-1"
                          style={{ backgroundColor: colors.brand.primary }}
                        >
                          <AppText className="text-xs font-bold">
                            BEST VALUE
                          </AppText>
                        </View>
                      )}
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}
        {error && (
          <Card className="my-3">
            <AppText tone="secondary" className="text-center">
              {error}
            </AppText>
            <Pressable onPress={load}>
              <AppText tone="success" className="mt-2 text-center font-bold">
                Retry
              </AppText>
            </Pressable>
          </Card>
        )}
        <View className="mt-auto pt-6">
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
          {__DEV__ && !packages.length && (
            <Pressable onPress={preview} className="py-4">
              <AppText tone="success" className="text-center font-semibold">
                Continue in development preview
              </AppText>
            </Pressable>
          )}
          <Pressable onPress={restore} className="py-3">
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
      </ScrollView>
    </SafeAreaView>
  );
}

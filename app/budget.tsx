import AppText from "@/components/AppText";
import { Card, Header, MoneyInput, PrimaryButton } from "@/components/ui";
import {
  budgetSuggestion,
  formatMoney,
  getBudget,
  monthKey,
  saveBudget,
  toMinorUnits,
} from "@/db/repository";
import { useAppPreferences, useAppTheme } from "@/lib/theme/useAppTheme";
import { useSubscription } from "@/lib/subscription/SubscriptionProvider";
import {
  requestNotificationPermission,
  supportsNativeNotifications,
} from "@/services/notifications";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BudgetScreen() {
  const { colors, isDark } = useAppTheme();
  const { baseCurrency } = useAppPreferences();
  const router = useRouter();
  const { canUse, openPaywall } = useSubscription();
  const month = monthKey(new Date());
  const [amount, setAmount] = useState("");
  const [alerts, setAlerts] = useState(true);
  const [suggestion, setSuggestion] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    Promise.all([
      getBudget(month, baseCurrency),
      budgetSuggestion(month, baseCurrency),
    ]).then(([budget, suggested]) => {
      if (budget) {
        setAmount(String(budget.amount / 100));
        setAlerts(budget.alertsEnabled);
      }
      setSuggestion(suggested);
    });
  }, [baseCurrency, month]);
  const save = async () => {
    if (!canUse("budgets")) {
      openPaywall("budget");
      return;
    }
    const value = toMinorUnits(amount);
    if (value <= 0) return;
    setSaving(true);
    try {
      if (alerts && !(await requestNotificationPermission()))
        Alert.alert(
          supportsNativeNotifications()
            ? "Notifications are off"
            : "Expo Go limitation",
          supportsNativeNotifications()
            ? "Budget warnings remain visible in the app."
            : "Native alerts require a development build. Your budget is still tracked in-app.",
        );
      await saveBudget(month, baseCurrency, value, alerts);
      router.back();
    } finally {
      setSaving(false);
    }
  };
  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background.base }}
    >
      <Header title="Monthly Budget" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
        >
          <View>
            <LinearGradient
              colors={isDark ? ["#172B40", "#16362E"] : ["#EAFFF2", "#F7FBF8"]}
              style={{
                borderRadius: 26,
                padding: 20,
                borderWidth: 1,
                borderColor: colors.border.soft,
              }}
            >
              <View className="flex-row items-center justify-center gap-2">
                <Ionicons
                  name="shield-checkmark"
                  size={18}
                  color={colors.brand.primary}
                />
                <AppText
                  tone="secondary"
                  className="text-xs font-bold tracking-widest"
                >
                  SET YOUR MONTHLY LIMIT
                </AppText>
              </View>
              <MoneyInput
                value={amount}
                onChange={setAmount}
                currency={baseCurrency === "INR" ? "₹" : baseCurrency}
              />
            </LinearGradient>
          </View>
          <View>
            <Card className="mt-6">
              <View className="flex-row items-center">
                <View
                  className="h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: colors.brand.primarySoft }}
                >
                  <Ionicons
                    name="sparkles"
                    size={23}
                    color={colors.brand.primary}
                  />
                </View>
                <View className="ml-4 flex-1">
                  <AppText
                    tone="secondary"
                    className="text-xs font-bold tracking-widest"
                  >
                    SMART SUGGESTION
                  </AppText>
                  <AppText className="mt-1 text-lg font-extrabold">
                    {suggestion
                      ? formatMoney(suggestion, baseCurrency)
                      : "Learning your pattern"}
                  </AppText>
                </View>
              </View>
              <AppText tone="secondary" className="mt-4 text-sm">
                {suggestion
                  ? "Calculated from your last three complete months."
                  : "Track three complete months to receive a personalised recommendation."}
              </AppText>
            </Card>
          </View>
          <View className="mt-8">
            <AppText className="text-xl font-extrabold">Stay informed</AppText>
            <AppText tone="secondary" className="text-sm">
              Gentle nudges before you cross the line
            </AppText>
            <Card className="mt-4">
              <View className="flex-row items-center">
                <View
                  className="h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: colors.background.subtle }}
                >
                  <Ionicons
                    name="notifications"
                    size={23}
                    color={colors.brand.primary}
                  />
                </View>
                <View className="ml-4 flex-1">
                  <AppText className="font-extrabold">Budget alerts</AppText>
                  <AppText tone="secondary" className="mt-1 text-xs">
                    At 80% and 100% usage
                  </AppText>
                </View>
                <Switch
                  value={alerts}
                  onValueChange={(value) => {
                    if (value && !canUse("budget_alerts")) {
                      openPaywall("budget_alert");
                      return;
                    }
                    setAlerts(value);
                  }}
                  trackColor={{
                    false: colors.background.subtle,
                    true: colors.brand.primary,
                  }}
                />
              </View>
              <View
                className="my-5 h-px"
                style={{ backgroundColor: colors.border.soft }}
              />
              <View className="flex-row gap-3">
                <Milestone value="80%" label="Heads-up" color="#F0A33A" />
                <Milestone
                  value="100%"
                  label="Limit reached"
                  color={colors.status.expense}
                />
              </View>
            </Card>
          </View>
        </ScrollView>
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 8,
            backgroundColor: colors.background.base,
            borderTopWidth: 1,
            borderTopColor: colors.border.soft,
          }}
        >
          <PrimaryButton
            title="Save Budget"
            onPress={save}
            disabled={toMinorUnits(amount) <= 0}
            loading={saving}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
function Milestone({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  const { colors } = useAppTheme();
  return (
    <View
      className="flex-1 rounded-2xl p-4"
      style={{ backgroundColor: colors.background.subtle }}
    >
      <AppText className="text-xl font-extrabold" style={{ color }}>
        {value}
      </AppText>
      <AppText tone="secondary" className="mt-1 text-xs">
        {label}
      </AppText>
    </View>
  );
}

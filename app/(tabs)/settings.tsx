import AppText from "@/components/AppText";
import { ContentReveal } from "@/components/ContentReveal";
import { Card } from "@/components/ui";
import {
  exportDatabaseSnapshot,
  listAccounts,
  listTransactions,
  resetLocalData,
} from "@/db/repository";
import { useTabBarMetrics } from "@/lib/navigation/tabBar";
import { useAppLock } from "@/lib/security/AppLockProvider";
import { useSubscription } from "@/lib/subscription/SubscriptionProvider";
import {
  useAppPreferences,
  useAppTheme,
  type ThemePreference,
} from "@/lib/theme/useAppTheme";
import {
  getNotificationPermissionStatus,
  requestNotificationPermission,
  type NotificationPermissionState,
} from "@/services/notifications";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system/legacy";
import { useFocusEffect, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SettingsRow = {
  icon: string;
  title: string;
  value?: string;
  danger?: boolean;
  onPress?: () => void | Promise<unknown>;
};

type SettingsGroup = { title: string; rows: SettingsRow[] };

function csvCell(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export default function Settings() {
  const { colors } = useAppTheme();
  const { contentBottomPadding } = useTabBarMetrics();
  const { themePreference, setThemePreference, baseCurrency, setBaseCurrency } =
    useAppPreferences();
  const {
    enabled: appLockEnabled,
    methodLabel,
    enableAppLock,
    disableAppLock,
  } = useAppLock();
  const router = useRouter();
  const {
    accessLevel,
    configured: purchasesConfigured,
    loading: subscriptionLoading,
    openPaywall,
    restore: restoreSubscription,
    consumePaywallIntent,
  } = useSubscription();
  const [currencies, setCurrencies] = useState<string[]>([baseCurrency]);
  const [notificationStatus, setNotificationStatus] =
    useState<NotificationPermissionState>("undetermined");

  const refreshStatus = useCallback(() => {
    Promise.all([
      listAccounts(),
      getNotificationPermissionStatus(),
    ]).then(([accountRows, permission]) => {
      setCurrencies(
        Array.from(
          new Set([
            baseCurrency,
            ...accountRows.map((account) => account.currency),
          ]),
        ),
      );
      setNotificationStatus(permission);
    });
  }, [baseCurrency]);

  useFocusEffect(
    useCallback(() => {
      refreshStatus();
    }, [refreshStatus]),
  );

  const writeAndShare = async (
    filename: string,
    content: string,
    mimeType: string,
  ) => {
    if (!(await Sharing.isAvailableAsync())) {
      throw new Error("The share sheet is unavailable on this device.");
    }
    const uri = `${FileSystem.cacheDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(uri, content);
    await Sharing.shareAsync(uri, {
      mimeType,
      dialogTitle: "Export your data",
    });
  };

  const exportJson = async () => {
    try {
      const snapshot = await exportDatabaseSnapshot();
      await writeAndShare(
        `expense-tracker-${new Date().toISOString().slice(0, 10)}.json`,
        JSON.stringify(snapshot, null, 2),
        "application/json",
      );
    } catch (reason) {
      Alert.alert(
        "Export failed",
        reason instanceof Error ? reason.message : "Please try again.",
      );
    }
  };

  const exportCsv = async () => {
    try {
      const rows = await listTransactions();
      const header = [
        "id",
        "kind",
        "amount_minor",
        "currency",
        "date",
        "account",
        "category",
        "classification",
        "notes",
      ];
      const lines = rows.map((row) =>
        [
          row.transaction.id,
          row.transaction.kind,
          row.transaction.amount,
          row.transaction.currency,
          row.transaction.occurredAt.toISOString(),
          row.account.name,
          row.category.name,
          row.transaction.expenseType ?? "",
          row.transaction.notes ?? "",
        ]
          .map(csvCell)
          .join(","),
      );
      await writeAndShare(
        `expense-tracker-${new Date().toISOString().slice(0, 10)}.csv`,
        [header.map(csvCell).join(","), ...lines].join("\n"),
        "text/csv",
      );
    } catch (reason) {
      Alert.alert(
        "Export failed",
        reason instanceof Error ? reason.message : "Please try again.",
      );
    }
  };

  const chooseExport = () =>
    Alert.alert("Export local data", "Choose a format.", [
      { text: "Cancel", style: "cancel" },
      { text: "JSON backup", onPress: exportJson },
      { text: "CSV spreadsheet", onPress: exportCsv },
    ]);

  const chooseTheme = () =>
    Alert.alert("Appearance", "Choose how the app should look.", [
      { text: "Cancel", style: "cancel" },
      ...(["system", "light", "dark"] as ThemePreference[]).map((value) => ({
        text: `${themePreference === value ? "✓ " : ""}${
          value[0].toUpperCase() + value.slice(1)
        }`,
        onPress: () => setThemePreference(value),
      })),
    ]);

  const chooseCurrency = () =>
    Alert.alert(
      "Base currency",
      "Home and Stats only include records matching this currency.",
      [
        { text: "Cancel", style: "cancel" },
        ...currencies.map((currency) => ({
          text: `${baseCurrency === currency ? "✓ " : ""}${currency}`,
          onPress: () =>
            setBaseCurrency(currency).catch((reason) =>
              Alert.alert(
                "Couldn't change currency",
                reason instanceof Error ? reason.message : "Please try again.",
              ),
            ),
        })),
      ],
    );

  const configureNotifications = async () => {
    if (notificationStatus === "denied") {
      Alert.alert(
        "Notifications are disabled",
        "Open device settings to enable local budget alerts.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }
    if (notificationStatus === "unavailable") {
      Alert.alert(
        "Development build required",
        "Native budget notifications are unavailable in Expo Go. In-app budget status still works.",
      );
      return;
    }
    await requestNotificationPermission();
    refreshStatus();
  };

  useFocusEffect(
    useCallback(() => {
      if (consumePaywallIntent() === "configure_budget_alerts") {
        void configureNotifications();
      }
    }, [consumePaywallIntent]),
  );

  const showAppLockFailure = (message: string, error: string) => {
    if (
      error === "user_cancel" ||
      error === "app_cancel" ||
      error === "system_cancel"
    ) {
      return;
    }
    const canOpenSettings =
      error === "not_enrolled" ||
      error === "not_available" ||
      error === "passcode_not_set";
    Alert.alert(
      "App lock wasn't changed",
      message,
      canOpenSettings
        ? [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        : [{ text: "OK" }],
    );
  };

  const configureAppLock = () => {
    if (!appLockEnabled) {
      void enableAppLock().then((result) => {
        if (!result.success) showAppLockFailure(result.message, result.error);
      });
      return;
    }

    Alert.alert(
      "Turn off app lock?",
      "Authentication is required before the lock can be disabled.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Turn off",
          style: "destructive",
          onPress: () =>
            void disableAppLock().then((result) => {
              if (!result.success)
                showAppLockFailure(result.message, result.error);
            }),
        },
      ],
    );
  };

  const restore = async () => {
    try {
      if (!purchasesConfigured) {
        Alert.alert(
          "Subscriptions unavailable",
          "RevenueCat is not configured for this build. Add the platform SDK key and rebuild.",
        );
        return;
      }
      Alert.alert(
        (await restoreSubscription())
          ? "Subscription restored"
          : "No active subscription found",
      );
      refreshStatus();
    } catch (reason) {
      Alert.alert(
        "Restore failed",
        reason instanceof Error ? reason.message : "Please try again.",
      );
    }
  };

  const manageSubscription = () =>
    Linking.openURL(
      Platform.OS === "ios"
        ? "https://apps.apple.com/account/subscriptions"
        : "https://play.google.com/store/account/subscriptions",
    );

  const confirmReset = () =>
    Alert.alert(
      "Reset all financial data?",
      "Accounts, transactions, transfers, budgets, and custom categories will be permanently removed from this device. Export first if you need a copy.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () =>
            Alert.alert("This cannot be undone", "Reset local data now?", [
              { text: "Keep data", style: "cancel" },
              {
                text: "Reset now",
                style: "destructive",
                onPress: () =>
                  resetLocalData()
                    .then(() => setBaseCurrency("INR"))
                    .then(() => Alert.alert("Local data reset"))
                    .catch((reason) =>
                      Alert.alert(
                        "Reset failed",
                        reason instanceof Error
                          ? reason.message
                          : "Your data was not reset.",
                      ),
                    ),
              },
            ]),
        },
      ],
    );

  const notificationLabel = {
    unavailable: "Development build required",
    granted: "Allowed",
    denied: "Open device settings",
    undetermined: "Not requested",
  }[notificationStatus];

  const groups: SettingsGroup[] = [
    {
      title: "Preferences",
      rows: [
        {
          icon: "moon",
          title: "Appearance",
          value: themePreference[0].toUpperCase() + themePreference.slice(1),
          onPress: chooseTheme,
        },
        {
          icon: "cash",
          title: "Base currency",
          value: baseCurrency,
          onPress: chooseCurrency,
        },
        {
          icon: "pricetags",
          title: "Categories",
          value: "Manage",
          onPress: () => router.push("/categories"),
        },
        {
          icon: "notifications",
          title: "Budget alerts",
          value:
            accessLevel === "premium" ? notificationLabel : "Premium",
          onPress:
            accessLevel === "premium"
              ? configureNotifications
              : () =>
                  openPaywall("budget_alert", {
                    intent: "configure_budget_alerts",
                  }),
        },
      ],
    },
    {
      title: "Your data",
      rows: [
        {
          icon: "download",
          title: "Export local data",
          value: "JSON or CSV",
          onPress: chooseExport,
        },
        {
          icon: "shield-checkmark",
          title: "Storage",
          value: "On this device",
        },
        {
          icon: "trash",
          title: "Reset local data",
          value: "Permanent",
          danger: true,
          onPress: confirmReset,
        },
      ],
    },
    {
      title: "Security",
      rows: [
        {
          icon: "finger-print",
          title: "App lock",
          value: appLockEnabled ? `On · ${methodLabel}` : "Off",
          onPress: configureAppLock,
        },
      ],
    },
    {
      title: "Premium",
      rows: [
        {
          icon: "diamond",
          title: "Subscription",
          value: subscriptionLoading
            ? "Checking"
            : accessLevel === "premium"
              ? "Premium"
              : purchasesConfigured
                ? "Free"
                : "Setup pending",
          onPress:
            accessLevel === "premium"
              ? undefined
              : () => openPaywall("settings"),
        },
        { icon: "refresh", title: "Restore purchases", onPress: restore },
        {
          icon: "open",
          title: "Manage subscription",
          onPress: manageSubscription,
        },
      ],
    },
    {
      title: "Legal & support",
      rows: [
        {
          icon: "document-text",
          title: "Terms of Use",
          onPress: () =>
            router.push({ pathname: "/legal", params: { document: "terms" } }),
        },
        {
          icon: "lock-closed",
          title: "Privacy Policy",
          onPress: () =>
            router.push({
              pathname: "/legal",
              params: { document: "privacy" },
            }),
        },
        {
          icon: "information-circle",
          title: "Version",
          value: Constants.expoConfig?.version ?? "1.0.0",
        },
      ],
    },
    ...(__DEV__
      ? [
          {
            title: "Development",
            rows: [
              {
                icon: "flask",
                title: "Run database self-check",
                value: "Isolated database",
                onPress: async () => {
                  try {
                    const { runDatabaseIntegrationChecks } =
                      await import("@/db/integrationHarness");
                    await runDatabaseIntegrationChecks();
                    Alert.alert(
                      "Database checks passed",
                      "Migrations, foreign keys, and rollback behavior are working.",
                    );
                  } catch (reason) {
                    Alert.alert(
                      "Database check failed",
                      reason instanceof Error
                        ? reason.message
                        : "Inspect the development logs.",
                    );
                  }
                },
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1"
      style={{ backgroundColor: colors.background.base }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 18,
          paddingBottom: contentBottomPadding,
          gap: 22,
        }}
      >
        <ContentReveal distance={8} duration={200}>
          <AppText className="text-3xl font-extrabold">Settings</AppText>
          <AppText tone="secondary">
            Privacy, preferences, and your plan
          </AppText>
        </ContentReveal>
        <ContentReveal delay={40} distance={10}>
          <Card>
            <View className="flex-row items-center">
              <View
                className="h-14 w-14 items-center justify-center rounded-2xl"
                style={{ backgroundColor: colors.brand.primarySoft }}
              >
                <Ionicons
                  name="phone-portrait"
                  size={26}
                  color={colors.brand.primary}
                />
              </View>
              <View className="ml-4 flex-1">
                <AppText className="font-extrabold">Private by design</AppText>
                <AppText tone="secondary" className="mt-1 text-xs">
                  Financial records stay on this device. Export before
                  uninstalling.
                </AppText>
              </View>
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={colors.brand.primary}
              />
            </View>
          </Card>
        </ContentReveal>
        {groups.map((group, groupIndex) => (
          <ContentReveal
            key={group.title}
            delay={75 + Math.min(groupIndex, 2) * 35}
            distance={10}
          >
            <AppText
              tone="muted"
              className="mb-3 text-xs font-bold uppercase tracking-widest"
            >
              {group.title}
            </AppText>
            <Card className="p-0">
              {group.rows.map((row, index) => (
                <Pressable
                  accessibilityRole={row.onPress ? "button" : undefined}
                  key={row.title}
                  onPress={row.onPress}
                  disabled={!row.onPress}
                  className="min-h-[68px] flex-row items-center px-4"
                  style={{
                    borderBottomWidth: index === group.rows.length - 1 ? 0 : 1,
                    borderColor: colors.border.soft,
                  }}
                >
                  <View
                    className="h-10 w-10 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: row.danger
                        ? colors.status.expenseSoft
                        : colors.background.subtle,
                    }}
                  >
                    <Ionicons
                      name={row.icon as never}
                      size={20}
                      color={
                        row.danger
                          ? colors.status.expense
                          : colors.brand.primary
                      }
                    />
                  </View>
                  <AppText
                    className="ml-3 flex-1 font-bold"
                    style={
                      row.danger ? { color: colors.status.expense } : undefined
                    }
                  >
                    {row.title}
                  </AppText>
                  {row.value && (
                    <AppText
                      tone="secondary"
                      className="mr-2 max-w-36 text-right text-xs"
                    >
                      {row.value}
                    </AppText>
                  )}
                  {row.onPress && (
                    <Ionicons
                      name="chevron-forward"
                      size={17}
                      color={colors.text.muted}
                    />
                  )}
                </Pressable>
              ))}
            </Card>
          </ContentReveal>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

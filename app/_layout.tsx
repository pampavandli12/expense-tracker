import { AppThemeProvider, useAppTheme } from "@/lib/theme/useAppTheme";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import "./global.css";
import { initializeDatabase } from "@/db/client";
import AppText from "@/components/AppText";
import { useCallback, useEffect, useState } from "react";
import { Pressable, View } from "react-native";
import { AppLockProvider } from "@/lib/security/AppLockProvider";
import { SubscriptionProvider } from "@/lib/subscription/SubscriptionProvider";

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <RootNavigator />
    </AppThemeProvider>
  );
}

function RootNavigator() {
  const { isDark } = useAppTheme();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string>();
  const prepareDatabase = useCallback(() => {
    setError(undefined);
    setReady(false);
    initializeDatabase()
      .then(() => setReady(true))
      .catch((reason) =>
        setError(
          reason instanceof Error
            ? reason.message
            : "Database initialization failed",
        ),
      );
  }, []);

  useEffect(() => {
    prepareDatabase();
  }, [prepareDatabase]);

  if (error)
    return (
      <View className="flex-1 items-center justify-center p-8">
        <AppText className="text-xl font-bold">
          Unable to open your data
        </AppText>
        <AppText tone="secondary" className="mt-3 text-center">
          Your records were not removed. Retry the database upgrade or restart
          the app.
        </AppText>
        {__DEV__ && (
          <AppText tone="muted" className="mt-2 text-center text-xs">
            {error}
          </AppText>
        )}
        <Pressable
          accessibilityRole="button"
          onPress={prepareDatabase}
          className="mt-6 rounded-2xl bg-emerald-400 px-6 py-4"
        >
          <AppText className="font-bold">Retry safely</AppText>
        </Pressable>
      </View>
    );
  if (!ready)
    return (
      <View className="flex-1 items-center justify-center">
        <AppText tone="secondary">Preparing your private ledger…</AppText>
      </View>
    );

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <AppLockProvider>
        <SubscriptionProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </SubscriptionProvider>
      </AppLockProvider>
    </>
  );
}

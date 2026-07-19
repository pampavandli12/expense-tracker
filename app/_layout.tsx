import { useAppTheme } from "@/lib/theme/useAppTheme";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import "./global.css";
import { initializeDatabase } from "@/db/client";
import AppText from "@/components/AppText";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function RootLayout() {
  const { isDark } = useAppTheme();
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string>();
  useEffect(() => { initializeDatabase().then(() => setReady(true)).catch((e) => setError(e instanceof Error ? e.message : "Database initialization failed")); }, []);

  if (error) return <View className="flex-1 items-center justify-center p-8"><AppText className="text-xl font-bold">Unable to open your data</AppText><AppText tone="secondary" className="mt-3 text-center">{error}</AppText></View>;
  if (!ready) return <View className="flex-1 items-center justify-center"><AppText tone="secondary">Preparing your private ledger…</AppText></View>;

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

import { useAppTheme } from "@/lib/theme/useAppTheme";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import "./global.css";

export default function RootLayout() {
  const { isDark } = useAppTheme();

  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}

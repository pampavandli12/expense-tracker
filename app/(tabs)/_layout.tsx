import { useTabBarMetrics } from "@/lib/navigation/tabBar";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View } from "react-native";

export default function RootLayout() {
  const { colors, isDark } = useAppTheme();
  const metrics = useTabBarMetrics();
  const isIOS = Platform.OS === "ios";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.brand.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: isIOS
          ? {
              position: "absolute",
              start: metrics.leftOffset,
              end: metrics.rightOffset,
              bottom: metrics.bottomOffset,
              height: metrics.barHeight,
              paddingTop: 8,
              paddingBottom: 8,
              borderTopWidth: 0,
              borderRadius: metrics.barHeight / 2,
              backgroundColor: "transparent",
              shadowColor: isDark ? "#000000" : colors.text.primary,
              shadowOpacity: isDark ? 0.16 : 0.08,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 8 },
              elevation: 0,
            }
          : {
              backgroundColor: colors.background.surface,
              borderTopColor: colors.border.default,
              height: 76,
              paddingTop: 8,
              paddingBottom: 10,
            },
        tabBarBackground: isIOS
          ? () => (
              <IOSGlassTabBackground
                isDark={isDark}
                radius={metrics.barHeight / 2}
                surfaceColor={colors.background.surface}
              />
            )
          : undefined,
        tabBarLabelStyle: {
          fontFamily: "manrope",
          ...(isIOS ? { fontSize: 11, fontWeight: "600" as const } : {}),
        },
        sceneStyle: {
          backgroundColor: colors.background.base,
        },
        tabBarItemStyle: isIOS
          ? { paddingVertical: 5 }
          : { paddingVertical: isDark ? 2 : 0 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon(props) {
            return <Ionicons name="home" size={24} color={props.color} />;
          },
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          tabBarIcon(props) {
            return (
              <Ionicons name="stats-chart" size={24} color={props.color} />
            );
          },
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: "Accounts",
          tabBarIcon(props) {
            return <Ionicons name="wallet" size={24} color={props.color} />;
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon(props) {
            return <Ionicons name="settings" size={24} color={props.color} />;
          },
        }}
      />
    </Tabs>
  );
}

function IOSGlassTabBackground({
  isDark,
  radius,
  surfaceColor,
}: {
  isDark: boolean;
  radius: number;
  surfaceColor: string;
}) {
  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          borderRadius: radius,
          overflow: "hidden",
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: isDark ? "#FFFFFF26" : "#FFFFFFC4",
        },
      ]}
    >
      <BlurView
        tint={isDark ? "dark" : "light"}
        intensity={isDark ? 58 : 72}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: `${surfaceColor}${isDark ? "52" : "40"}` },
        ]}
      />
    </View>
  );
}

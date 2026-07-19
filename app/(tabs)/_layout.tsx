import { useAppTheme } from "@/lib/theme/useAppTheme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

export default function RootLayout() {
  const { colors, isDark } = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.brand.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: colors.background.surface,
          borderTopColor: colors.border.default,
          height: 76,
          paddingTop: 8,
          paddingBottom: 10,
        },
        tabBarLabelStyle: {
          fontFamily: "manrope",
        },
        sceneStyle: {
          backgroundColor: colors.background.base,
        },
        tabBarItemStyle: {
          paddingVertical: isDark ? 2 : 0,
        },
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

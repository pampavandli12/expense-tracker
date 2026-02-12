import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
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
        name="Stats"
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
        name="Accounts"
        options={{
          title: "Accounts",
          tabBarIcon(props) {
            return (
              <Ionicons
                name="add-circle-outline"
                size={24}
                color={props.color}
              />
            );
          },
        }}
      />
      <Tabs.Screen
        name="Settings"
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

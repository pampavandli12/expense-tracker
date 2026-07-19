import AppText from "@/components/AppText";
import { Card } from "@/components/ui";
import { listTransactions } from "@/db/repository";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import { restorePurchases } from "@/services/purchases";
import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Alert, Linking, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SettingsRow = {
  icon: string;
  title: string;
  value?: string;
  onPress?: () => void | Promise<unknown>;
};
type SettingsGroup = { title: string; rows: SettingsRow[] };

export default function Settings() {
  const { colors, isDark } = useAppTheme();
  const exportData = async () => {
    const uri = `${FileSystem.cacheDirectory}expense-export.json`;
    await FileSystem.writeAsStringAsync(
      uri,
      JSON.stringify(await listTransactions(), null, 2),
    );
    if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
  };
  const groups: SettingsGroup[] = [
    {
      title: "Preferences",
      rows: [
        {
          icon: "moon",
          title: "Appearance",
          value: isDark ? "Dark · System" : "Light · System",
        },
        { icon: "cash", title: "Base currency", value: "INR" },
        { icon: "notifications", title: "Budget alerts", value: "Enabled" },
      ],
    },
    {
      title: "Your data",
      rows: [
        {
          icon: "download",
          title: "Export your data",
          value: "JSON",
          onPress: exportData,
        },
        { icon: "shield-checkmark", title: "Storage", value: "On device" },
      ],
    },
    {
      title: "Premium & support",
      rows: [
        {
          icon: "refresh",
          title: "Restore purchases",
          onPress: async () =>
            Alert.alert(
              (await restorePurchases())
                ? "Subscription restored"
                : "No active subscription found",
            ),
        },
        {
          icon: "lock-closed",
          title: "Privacy policy",
          onPress: () =>
            Linking.openURL(
              process.env.EXPO_PUBLIC_PRIVACY_URL ??
                "https://example.com/privacy",
            ),
        },
      ],
    },
  ];
  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background.base }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 18, paddingBottom: 120, gap: 22 }}
      >
        <View>
          <AppText className="text-3xl font-extrabold">Settings</AppText>
          <AppText tone="secondary">
            Privacy, preferences, and your plan
          </AppText>
        </View>
        <View>
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
                  Your financial data stays on this device
                </AppText>
              </View>
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={colors.brand.primary}
              />
            </View>
          </Card>
        </View>
        {groups.map((group) => (
          <View key={group.title}>
            <AppText
              tone="muted"
              className="mb-3 text-xs font-bold uppercase tracking-widest"
            >
              {group.title}
            </AppText>
            <Card className="p-0">
              {group.rows.map((row, index) => (
                <Pressable
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
                    style={{ backgroundColor: colors.background.subtle }}
                  >
                    <Ionicons
                      name={row.icon as any}
                      size={20}
                      color={colors.brand.primary}
                    />
                  </View>
                  <AppText className="ml-3 flex-1 font-bold">
                    {row.title}
                  </AppText>
                  {row.value && (
                    <AppText tone="secondary" className="mr-2 text-xs">
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
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

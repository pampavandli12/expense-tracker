import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";

type NotificationsModule = typeof import("expo-notifications");
let modulePromise: Promise<NotificationsModule> | undefined;
let handlerConfigured = false;

/**
 * expo-notifications intentionally cannot be loaded on Android Expo Go since
 * SDK 53. Keeping the import dynamic prevents the native module warning from
 * breaking route registration while preserving alerts in development builds.
 */
async function getNotifications(): Promise<NotificationsModule | null> {
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) return null;
  modulePromise ??= import("expo-notifications");
  const Notifications = await modulePromise;
  if (!handlerConfigured) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
      }),
    });
    handlerConfigured = true;
  }
  return Notifications;
}

export function supportsNativeNotifications() {
  return Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;
}

export async function requestNotificationPermission() {
  const Notifications = await getNotifications();
  if (!Notifications) return false;
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("budget", {
      name: "Budget alerts",
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  return (await Notifications.requestPermissionsAsync()).granted;
}

export async function notifyBudgetThreshold(percent: number) {
  const Notifications = await getNotifications();
  if (!Notifications) return false;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: percent >= 100 ? "Budget limit reached" : "Budget check-in",
      body: `You have used ${percent}% of this month's budget.`,
      data: { type: "budget" },
    },
    trigger: null,
  });
  return true;
}

import AppText from "@/components/AppText";
import { Header } from "@/components/ui";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import { useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const privacySections = [
  [
    "Data stored on your device",
    "Expense Tracker stores accounts, categories, transactions, budgets, preferences, and exports locally on your device. We do not operate an account system or cloud database for this information.",
  ],
  [
    "Subscriptions",
    "When subscriptions are enabled, Apple or Google processes the purchase and RevenueCat receives store identifiers and entitlement information needed to unlock the app. RevenueCat does not receive your financial records from this app.",
  ],
  [
    "Notifications and exports",
    "Budget notifications are generated locally. Exports are created only when you request them and are shared through the operating-system share sheet to destinations you choose.",
  ],
  [
    "Deleting data",
    "You can reset local financial data in Settings. Uninstalling the app may permanently remove local records unless you previously exported them.",
  ],
];

const termsSections = [
  [
    "Personal finance tool",
    "Expense Tracker is a record-keeping tool, not financial, tax, investment, or legal advice. You are responsible for verifying entries and exports.",
  ],
  [
    "Local records",
    "You are responsible for maintaining exports when needed. The app does not provide cloud backup, recovery after uninstall, bank reconciliation, or guaranteed exchange-rate calculations.",
  ],
  [
    "Subscriptions",
    "Paid access renews according to the plan and store disclosures shown before purchase. Billing, cancellation, refunds, and subscription management are handled by Apple or Google under their applicable policies.",
  ],
  [
    "Availability",
    "The app is provided as available. We may update features to maintain compatibility, security, or store requirements.",
  ],
];

export default function LegalScreen() {
  const { colors } = useAppTheme();
  const { document } = useLocalSearchParams<{ document?: string }>();
  const privacy = document !== "terms";
  const sections = privacy ? privacySections : termsSections;
  const title = privacy ? "Privacy Policy" : "Terms of Use";

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background.base }}
    >
      <Header title={title} />
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 60 }}>
        <AppText tone="muted" className="text-xs font-bold tracking-widest">
          LAST UPDATED · 19 JULY 2026
        </AppText>
        <AppText tone="secondary" className="mt-4 leading-6">
          This in-app summary describes the intended v1 data handling. Published
          web URLs must be supplied before store submission.
        </AppText>
        {sections.map(([heading, body]) => (
          <AppText key={heading} className="mt-7">
            <AppText className="text-lg font-extrabold">
              {heading}
              {"\n"}
            </AppText>
            <AppText tone="secondary" className="leading-6">
              {body}
            </AppText>
          </AppText>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

import AppText from "@/components/AppText";
import { Card, Header } from "@/components/ui";
import {
  deleteTransaction,
  formatMoney,
  listTransactions,
  monthKey,
} from "@/db/repository";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
type Row = Awaited<ReturnType<typeof listTransactions>>[number];
export default function TransactionsScreen() {
  const { colors, isDark } = useAppTheme();
  const [rows, setRows] = useState<Row[]>([]);
  const load = useCallback(
    () => listTransactions(monthKey(new Date())).then(setRows),
    [],
  );
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );
  const expenses = rows
    .filter((r) => r.transaction.kind === "expense")
    .reduce((s, r) => s + r.transaction.amount, 0);
  const income = rows
    .filter((r) => r.transaction.kind === "income")
    .reduce((s, r) => s + r.transaction.amount, 0);
  const remove = (row: Row) =>
    Alert.alert(
      "Delete transaction?",
      `${row.category.name} · ${formatMoney(row.transaction.amount)}`,
      [
        { text: "Cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteTransaction(row.transaction.id).then(load),
        },
      ],
    );
  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background.base }}
    >
      <Header title="Transactions" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 18, paddingBottom: 60, gap: 12 }}
      >
        <View>
          <LinearGradient
            colors={isDark ? ["#19384A", "#123025"] : ["#0F253A", "#17613A"]}
            className="flex-row rounded-3xl p-5"
          >
            <Total label="INCOME" value={income} color="#58F492" />
            <Total label="EXPENSE" value={expenses} color="#9EC0FF" />
          </LinearGradient>
        </View>
        <View className="mb-1 mt-3">
          <AppText className="text-xl font-extrabold">This month</AppText>
          <AppText tone="secondary" className="text-sm">
            Long-press an entry to delete it
          </AppText>
        </View>
        {rows.map((row) => (
          <View key={row.transaction.id}>
            <Pressable onLongPress={() => remove(row)}>
              <Card>
                <View className="flex-row items-center">
                  <View
                    className="h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${row.category.color}18` }}
                  >
                    <Ionicons
                      name={row.category.icon as any}
                      color={row.category.color}
                      size={22}
                    />
                  </View>
                  <View className="ml-4 flex-1">
                    <AppText className="font-extrabold">
                      {row.category.name}
                    </AppText>
                    <AppText tone="muted" className="mt-1 text-xs">
                      {row.account.name} ·{" "}
                      {new Intl.DateTimeFormat("en-IN", {
                        day: "numeric",
                        month: "short",
                      }).format(row.transaction.occurredAt)}
                    </AppText>
                  </View>
                  <AppText
                    className="font-extrabold"
                    style={{
                      color:
                        row.transaction.kind === "expense"
                          ? colors.status.expense
                          : colors.status.income,
                    }}
                  >
                    {row.transaction.kind === "expense" ? "−" : "+"}
                    {formatMoney(row.transaction.amount)}
                  </AppText>
                </View>
              </Card>
            </Pressable>
          </View>
        ))}
        {!rows.length && (
          <Card>
            <View className="items-center py-8">
              <Ionicons
                name="receipt-outline"
                size={34}
                color={colors.text.muted}
              />
              <AppText tone="secondary" className="mt-3">
                No transactions this month.
              </AppText>
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
function Total({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View className="flex-1">
      <AppText
        className="text-[10px] font-bold tracking-widest"
        style={{ color: "#AFC4CE" }}
      >
        {label}
      </AppText>
      <AppText className="mt-2 text-xl font-extrabold" style={{ color }}>
        {formatMoney(value)}
      </AppText>
    </View>
  );
}

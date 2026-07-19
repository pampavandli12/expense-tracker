import AppText from "@/components/AppText";
import { Card } from "@/components/ui";
import {
  categorySummary,
  formatMoney,
  getBudget,
  monthKey,
  monthSummary,
} from "@/db/repository";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Summary = Awaited<ReturnType<typeof monthSummary>>;
type CategoryRow = Awaited<ReturnType<typeof categorySummary>>[number];
export default function Home() {
  const { colors, isDark } = useAppTheme();
  const router: any = useRouter();
  const [date, setDate] = useState(new Date());
  const [summary, setSummary] = useState<Summary>({
    income: 0,
    expense: 0,
    balance: 0,
  });
  const [categoryRows, setCategoryRows] = useState<CategoryRow[]>([]);
  const [budget, setBudget] = useState<Awaited<ReturnType<typeof getBudget>>>();
  const key = monthKey(date);
  useFocusEffect(
    useCallback(() => {
      Promise.all([
        monthSummary(key, "INR"),
        categorySummary(key, "INR"),
        getBudget(key, "INR"),
      ]).then(([s, c, b]) => {
        setSummary(s);
        setCategoryRows(c);
        setBudget(b);
      });
    }, [key]),
  );
  const moveMonth = (delta: number) => {
    Haptics.selectionAsync();
    setDate(
      (value) => new Date(value.getFullYear(), value.getMonth() + delta, 1),
    );
  };
  const percent = budget
    ? Math.round((summary.expense / budget.amount) * 100)
    : 0;
  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background.base }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 18, paddingBottom: 120, gap: 20 }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => moveMonth(-1)}
            className="h-11 w-11 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.background.surface }}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={colors.text.secondary}
            />
          </Pressable>
          <View className="items-center">
            <AppText
              tone="muted"
              className="text-[10px] font-bold tracking-widest"
            >
              OVERVIEW
            </AppText>
            <AppText className="text-xl font-extrabold">
              {new Intl.DateTimeFormat("en-IN", {
                month: "long",
                year: "numeric",
              }).format(date)}
            </AppText>
          </View>
          <Pressable
            onPress={() => moveMonth(1)}
            className="h-11 w-11 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.background.surface }}
          >
            <Ionicons
              name="chevron-forward"
              size={22}
              color={colors.text.secondary}
            />
          </Pressable>
        </View>
        <View>
          <LinearGradient
            colors={
              isDark
                ? ["#19384A", "#123025", "#121C2D"]
                : ["#0F253A", "#123E37", "#17613A"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 26,
              padding: 24,
              overflow: "hidden",
              shadowColor: "#0A412A",
              shadowOpacity: 0.2,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 10 },
            }}
          >
            <View
              className="absolute -right-10 -top-12 h-44 w-44 rounded-full"
              style={{ backgroundColor: "#3DF08328" }}
            />
            <View className="flex-row items-center justify-between">
              <AppText
                className="text-sm font-bold tracking-wider"
                style={{ color: "#B7C9D2" }}
              >
                REMAINING BALANCE
              </AppText>
              <View
                className="h-9 w-9 items-center justify-center rounded-xl"
                style={{ backgroundColor: "#FFFFFF14" }}
              >
                <Ionicons name="wallet" size={18} color="#58F492" />
              </View>
            </View>
            <AppText
              className="mt-3 text-4xl font-extrabold"
              style={{ color: "white" }}
            >
              {formatMoney(summary.balance)}
            </AppText>
            <View
              className="mt-7 h-px"
              style={{ backgroundColor: "#FFFFFF18" }}
            />
            <View className="mt-6 flex-row">
              <BalanceMetric
                label="INCOME"
                value={summary.income}
                icon="arrow-down"
                color="#58F492"
              />
              <BalanceMetric
                label="EXPENSE"
                value={summary.expense}
                icon="arrow-up"
                color="#9EC0FF"
              />
            </View>
          </LinearGradient>
        </View>
        <View>
          <View className="flex-row items-end justify-between">
            <View>
              <AppText className="text-xl font-extrabold">
                Monthly budget
              </AppText>
              <AppText tone="secondary" className="text-sm">
                Stay ahead of your spending
              </AppText>
            </View>
            <Pressable onPress={() => router.push("/budget")}>
              <AppText tone="success" className="text-xs font-bold">
                {budget ? `${percent}% USED` : "SET UP"}
              </AppText>
            </Pressable>
          </View>
          <Pressable onPress={() => router.push("/budget")} className="mt-3">
            <Card>
              <View className="flex-row items-center justify-between">
                <AppText className="text-lg font-extrabold">
                  {formatMoney(summary.expense)}
                </AppText>
                <AppText tone="secondary" className="text-sm">
                  of {budget ? formatMoney(budget.amount) : "no limit"}
                </AppText>
              </View>
              <View
                className="mt-5 h-3 overflow-hidden rounded-full"
                style={{ backgroundColor: colors.background.subtle }}
              >
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(percent, 100)}%`,
                    backgroundColor:
                      percent > 100
                        ? colors.status.expense
                        : colors.brand.primary,
                  }}
                />
              </View>
              <View className="mt-4 flex-row items-center gap-2">
                <Ionicons
                  name={percent > 100 ? "warning" : "checkmark-circle"}
                  size={19}
                  color={
                    percent > 100 ? colors.status.expense : colors.status.income
                  }
                />
                <AppText
                  className="text-xs font-bold"
                  style={{
                    color:
                      percent > 100
                        ? colors.status.expense
                        : colors.status.income,
                  }}
                >
                  {!budget
                    ? "CREATE YOUR FIRST BUDGET"
                    : percent > 100
                      ? "BUDGET EXCEEDED"
                      : "YOU'RE ON TRACK"}
                </AppText>
              </View>
            </Card>
          </Pressable>
        </View>
        <View className="flex-row gap-3">
          <QuickAction
            title="Add expense"
            subtitle="Record spending"
            icon="remove"
            onPress={() => router.push("/add-expense")}
          />
          <QuickAction
            title="Add income"
            subtitle="Record earnings"
            icon="add"
            primary
            onPress={() => router.push("/add-income")}
          />
        </View>
        <View>
          <View className="flex-row items-end justify-between">
            <View>
              <AppText className="text-xl font-extrabold">
                Top categories
              </AppText>
              <AppText tone="secondary" className="text-sm">
                This month’s spending
              </AppText>
            </View>
            <Pressable onPress={() => router.push("/(tabs)/stats")}>
              <AppText tone="success" className="text-xs font-bold">
                VIEW STATS
              </AppText>
            </Pressable>
          </View>
          {categoryRows.length ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingVertical: 14 }}
            >
              {categoryRows.slice(0, 5).map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => router.push("/transactions")}
                >
                  <Card className="w-36 items-center">
                    <View
                      className="h-12 w-12 items-center justify-center rounded-2xl"
                      style={{ backgroundColor: `${item.color}18` }}
                    >
                      <Ionicons
                        name={item.icon as any}
                        size={22}
                        color={item.color}
                      />
                    </View>
                    <AppText
                      tone="secondary"
                      numberOfLines={1}
                      className="mt-3 max-w-28 text-center text-xs font-semibold"
                    >
                      {item.name}
                    </AppText>
                    <AppText className="mt-1 text-base font-extrabold">
                      {formatMoney(item.total)}
                    </AppText>
                  </Card>
                </Pressable>
              ))}
            </ScrollView>
          ) : (
            <Card className="mt-4">
              <AppText tone="secondary" className="text-center">
                Your top spending categories will appear here.
              </AppText>
            </Card>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
function BalanceMetric({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: any;
  color: string;
}) {
  return (
    <View className="flex-1 flex-row items-center gap-3">
      <View
        className="h-11 w-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}18` }}
      >
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View>
        <AppText
          className="text-[10px] font-bold tracking-widest"
          style={{ color: "#AFC4CE" }}
        >
          {label}
        </AppText>
        <AppText className="mt-1 text-base font-extrabold" style={{ color }}>
          {formatMoney(value)}
        </AppText>
      </View>
    </View>
  );
}
function QuickAction({
  title,
  subtitle,
  icon,
  primary,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: any;
  primary?: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      className="flex-1 overflow-hidden rounded-3xl active:opacity-85"
    >
      {primary ? (
        <LinearGradient
          colors={[colors.brand.primarySoft, colors.brand.primary]}
          className="h-36 justify-between p-5"
        >
          <View
            className="h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: "#FFFFFF40" }}
          >
            <Ionicons name={icon} size={23} color="#0A2940" />
          </View>
          <View>
            <AppText className="font-extrabold">{title}</AppText>
            <AppText className="text-xs" style={{ color: "#194733" }}>
              {subtitle}
            </AppText>
          </View>
        </LinearGradient>
      ) : (
        <View
          className="h-36 justify-between rounded-3xl border p-5"
          style={{
            backgroundColor: colors.background.surface,
            borderColor: colors.border.soft,
          }}
        >
          <View
            className="h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: colors.background.subtle }}
          >
            <Ionicons name={icon} size={23} color={colors.text.secondary} />
          </View>
          <View>
            <AppText className="font-extrabold">{title}</AppText>
            <AppText tone="secondary" className="text-xs">
              {subtitle}
            </AppText>
          </View>
        </View>
      )}
    </Pressable>
  );
}

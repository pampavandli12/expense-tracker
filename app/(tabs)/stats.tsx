import AppText from "@/components/AppText";
import { ContentReveal, DataFade } from "@/components/ContentReveal";
import { Card, PrimaryButton } from "@/components/ui";
import {
  categorySummary,
  formatMoney,
  listAccounts,
  monthKey,
  spendingTrend,
} from "@/db/repository";
import type { Account } from "@/db/schema";
import {
  formatChartAxisValue,
  getBarChartLayout,
  getChartScale,
  getLineChartLayout,
} from "@/lib/chartLayout";
import { useTabBarMetrics } from "@/lib/navigation/tabBar";
import { useSubscription } from "@/lib/subscription/SubscriptionProvider";
import { useAppPreferences, useAppTheme } from "@/lib/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, View, useWindowDimensions } from "react-native";
import {
  BarChart,
  LineChart as GiftedLineChart,
  PieChart,
} from "react-native-gifted-charts";
import { useReducedMotion } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

type CategoryRow = Awaited<ReturnType<typeof categorySummary>>[number];
type Trend = Awaited<ReturnType<typeof spendingTrend>>;
type Period = 3 | 6 | 12;
const LineChart: any = GiftedLineChart;

export default function Stats() {
  const { canUse, openPaywall } = useSubscription();
  const { colors } = useAppTheme();
  const { contentBottomPadding } = useTabBarMetrics();

  if (canUse("advanced_stats")) return <PremiumStats />;

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1"
      style={{ backgroundColor: colors.background.base }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 20,
          paddingBottom: contentBottomPadding,
        }}
      >
        <AppText className="text-3xl font-extrabold">Stats</AppText>
        <AppText tone="secondary" className="mt-1">
          Your monthly totals remain available on Home.
        </AppText>
        <Card className="mt-8">
          <View
            className="h-16 w-16 items-center justify-center rounded-3xl"
            style={{ backgroundColor: colors.brand.primarySoft }}
          >
            <Ionicons
              name="analytics"
              size={31}
              color={colors.brand.primary}
            />
          </View>
          <AppText className="mt-5 text-2xl font-extrabold">
            Understand your spending patterns
          </AppText>
          <AppText tone="secondary" className="mt-3 leading-6">
            Premium unlocks category rankings, cash-flow charts, spending
            trends, and comparisons across your accounts.
          </AppText>
          <View className="mt-6">
            <PrimaryButton
              title="Explore Premium insights"
              onPress={() => openPaywall("stats")}
            />
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function PremiumStats() {
  const { colors, isDark } = useAppTheme();
  const { contentBottomPadding } = useTabBarMetrics();
  const { baseCurrency } = useAppPreferences();
  const { width } = useWindowDimensions();
  const reducedMotion = useReducedMotion();
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState("all");
  const [trend, setTrend] = useState<Trend>([]);
  const [period, setPeriod] = useState<Period>(6);
  const [loading, setLoading] = useState(true);
  const [chartRevision, setChartRevision] = useState(0);
  const dataRequestKey = `${baseCurrency}:${accountId}:${period}`;
  const previousDataRequestKey = useRef(dataRequestKey);
  const load = useCallback(() => {
    setLoading(true);
    const selectedAccountId = accountId === "all" ? undefined : accountId;
    return Promise.all([
      categorySummary(monthKey(new Date()), baseCurrency, selectedAccountId),
      spendingTrend(new Date(), baseCurrency, period, selectedAccountId),
      listAccounts(),
    ])
      .then(([c, t, accountRows]) => {
        setCategories(c);
        setTrend(t);
        const matchingAccounts = accountRows.filter(
          (account) => account.currency === baseCurrency,
        );
        setAccounts(matchingAccounts);
        if (
          accountId !== "all" &&
          !matchingAccounts.some((account) => account.id === accountId)
        ) {
          setAccountId("all");
        }
        if (previousDataRequestKey.current !== dataRequestKey) {
          previousDataRequestKey.current = dataRequestKey;
          setChartRevision((value) => value + 1);
        }
      })
      .finally(() => setLoading(false));
  }, [accountId, baseCurrency, dataRequestKey, period]);
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const total = categories.reduce((sum, item) => sum + item.total, 0);
  const cardContentWidth = Math.max(236, width - 76);
  const latest = trend.at(-1);
  const net = (latest?.income ?? 0) - (latest?.expense ?? 0);
  const previousExpense = trend.at(-2)?.expense ?? 0;
  const expenseChange = previousExpense
    ? Math.round(
        (((latest?.expense ?? 0) - previousExpense) / previousExpense) * 100,
      )
    : 0;
  const pieData = useMemo(
    () =>
      categories.map((item) => ({
        value: item.total,
        color: item.color,
        focused: item.id === categories[0]?.id,
      })),
    [categories],
  );
  const barScale = useMemo(
    () =>
      getChartScale(
        trend.flatMap((item) => [item.income / 100, item.expense / 100]),
        baseCurrency,
      ),
    [baseCurrency, trend],
  );
  const lineScale = useMemo(
    () =>
      getChartScale(
        trend.map((item) => item.expense / 100),
        baseCurrency,
      ),
    [baseCurrency, trend],
  );
  const barPlotWidth = Math.max(
    180,
    cardContentWidth - barScale.yAxisLabelWidth,
  );
  const linePlotWidth = Math.max(
    180,
    cardContentWidth - lineScale.yAxisLabelWidth,
  );
  const barLayout = useMemo(
    () => getBarChartLayout(trend.length, barPlotWidth),
    [barPlotWidth, trend.length],
  );
  const lineLayout = useMemo(
    () => getLineChartLayout(trend.length, linePlotWidth),
    [linePlotWidth, trend.length],
  );
  const chartsReady =
    !loading &&
    Number.isFinite(barPlotWidth) &&
    Number.isFinite(linePlotWidth) &&
    barPlotWidth > 0 &&
    linePlotWidth > 0;
  const xAxisLabelStyle = useMemo(
    () => ({
      color: colors.text.muted,
      fontSize: 10,
      lineHeight: 14,
      textAlign: "center" as const,
      includeFontPadding: false,
    }),
    [colors.text.muted],
  );
  const bars = useMemo(
    () =>
      trend.flatMap((item) => [
        {
          value: item.income / 100,
          label: item.month,
          frontColor: colors.brand.primary,
          gradientColor: "#8CF5B0",
          spacing: barLayout.pairSpacing,
          labelWidth: barLayout.groupWidth,
          labelTextStyle: xAxisLabelStyle,
        },
        {
          value: item.expense / 100,
          frontColor: "#7DA7F7",
          gradientColor: "#C9DAFF",
          spacing: barLayout.groupSpacing,
        },
      ]),
    [barLayout, trend, xAxisLabelStyle, colors],
  );
  const line = useMemo(
    () =>
      trend.map((item) => ({
        value: item.expense / 100,
        label: item.month,
        labelTextStyle: xAxisLabelStyle,
        dataPointColor: "#2463EB",
        dataPointRadius: 4,
      })),
    [trend, xAxisLabelStyle],
  );

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1"
      style={{ backgroundColor: colors.background.base }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 18,
          paddingBottom: contentBottomPadding,
          gap: 18,
        }}
      >
        <ContentReveal
          distance={8}
          duration={200}
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between",
          }}
        >
          <View>
            <AppText className="text-3xl font-extrabold">Statistics</AppText>
            <AppText tone="secondary" className="mt-1">
              A clearer view of your money
            </AppText>
          </View>
          <View
            className="h-11 w-11 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.brand.primarySoft }}
          >
            <Ionicons name="sparkles" size={21} color={colors.brand.primary} />
          </View>
        </ContentReveal>

        {accounts.length > 1 && (
          <ContentReveal delay={30} distance={8} ready={!loading}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              <AccountFilterChip
                label="All accounts"
                active={accountId === "all"}
                onPress={() => setAccountId("all")}
              />
              {accounts.map((account) => (
                <AccountFilterChip
                  key={account.id}
                  label={account.name}
                  active={accountId === account.id}
                  onPress={() => setAccountId(account.id)}
                />
              ))}
            </ScrollView>
          </ContentReveal>
        )}

        <ContentReveal delay={70} distance={10} ready={!loading}>
          <LinearGradient
            colors={
              isDark
                ? ["#19384A", "#123025", "#121C2D"]
                : ["#0F253A", "#123E37", "#17613A"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ borderRadius: 24, padding: 22, overflow: "hidden" }}
          >
            <View
              className="absolute -right-8 -top-12 h-40 w-40 rounded-full"
              style={{ backgroundColor: "#36EE7940" }}
            />
            <View className="flex-row items-center justify-between">
              <AppText
                className="text-sm font-semibold"
                style={{ color: "#B7C9D2" }}
              >
                NET THIS MONTH
              </AppText>
              <View
                className="rounded-full px-3 py-1"
                style={{
                  backgroundColor: net >= 0 ? "#3DF08322" : "#FF6B7522",
                }}
              >
                <AppText
                  className="text-xs font-bold"
                  style={{ color: net >= 0 ? "#58F492" : "#FF8990" }}
                >
                  {net >= 0 ? "POSITIVE" : "OVERSPENT"}
                </AppText>
              </View>
            </View>
            <AppText
              className="mt-3 text-4xl font-extrabold"
              style={{ color: "white" }}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.68}
            >
              {formatMoney(net, baseCurrency)}
            </AppText>
            <View className="mt-6 flex-row gap-4">
              <MiniMetric
                label="INCOME"
                value={latest?.income ?? 0}
                color="#57F292"
                currency={baseCurrency}
              />
              <MiniMetric
                label="EXPENSE"
                value={latest?.expense ?? 0}
                color="#9EC0FF"
                currency={baseCurrency}
              />
            </View>
          </LinearGradient>
        </ContentReveal>

        <ContentReveal delay={40} distance={8}>
          <View
            className="flex-row rounded-2xl p-1"
            style={{ backgroundColor: colors.background.subtle }}
          >
            {([3, 6, 12] as Period[]).map((value) => (
              <Pressable
                key={value}
                accessibilityRole="button"
                accessibilityState={{ selected: period === value }}
                onPress={() => {
                  if (value === period) return;
                  Haptics.selectionAsync();
                  setPeriod(value);
                }}
                className="flex-1 rounded-xl py-3"
                style={{
                  backgroundColor:
                    period === value
                      ? colors.background.surface
                      : "transparent",
                  shadowColor: "#0A1730",
                  shadowOpacity: period === value ? 0.08 : 0,
                  shadowRadius: 8,
                }}
              >
                <AppText
                  tone={period === value ? "primary" : "secondary"}
                  className="text-center text-sm font-bold"
                >
                  {value === 12 ? "1 Year" : `${value} Months`}
                </AppText>
              </Pressable>
            ))}
          </View>
        </ContentReveal>

        <ContentReveal delay={110} distance={10} ready={chartsReady}>
          <ModernCard>
            <SectionHeader
              title="Expense mix"
              subtitle="Where your money went"
              icon="pie-chart"
            />
            <DataFade ready={chartsReady} revision={chartRevision}>
              {total ? (
                <View className="mt-3 flex-row items-center">
                  <View className="w-[53%] items-center">
                    <PieChart
                      key={`pie-${period}-${chartRevision}`}
                      data={pieData}
                      donut
                      radius={86}
                      innerRadius={61}
                      innerCircleColor={colors.background.surface}
                      isAnimated={!reducedMotion}
                      animationDuration={300}
                      sectionAutoFocus
                      centerLabelComponent={() => (
                        <View className="items-center">
                          <AppText
                            tone="muted"
                            className="text-[10px] font-bold tracking-widest"
                          >
                            TOTAL
                          </AppText>
                          <AppText className="mt-1 text-lg font-extrabold">
                            {formatMoney(total, baseCurrency)}
                          </AppText>
                          <AppText tone="muted" className="text-[10px]">
                            this month
                          </AppText>
                        </View>
                      )}
                    />
                  </View>
                  <View className="flex-1 gap-4">
                    {categories.slice(0, 4).map((item) => (
                      <View key={item.id}>
                        <View className="flex-row items-center">
                          <View
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <AppText
                            tone="secondary"
                            numberOfLines={1}
                            className="ml-2 flex-1 text-xs font-semibold"
                          >
                            {item.name}
                          </AppText>
                          <AppText className="text-xs font-bold">
                            {Math.round((item.total / total) * 100)}%
                          </AppText>
                        </View>
                        <AppText
                          tone="muted"
                          className="ml-[18px] mt-1 text-xs"
                        >
                          {formatMoney(item.total, baseCurrency)}
                        </AppText>
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <Empty
                  loading={loading}
                  text="Add expenses to reveal your spending mix."
                />
              )}
            </DataFade>
          </ModernCard>
        </ContentReveal>

        <ContentReveal delay={140} distance={10} ready={chartsReady}>
          <ModernCard>
            <SectionHeader
              title="Cash flow"
              subtitle="Income compared with expenses"
              icon="bar-chart"
            />
            <Legend />
            <DataFade
              ready={chartsReady}
              revision={chartRevision}
              style={{ marginTop: 12, overflow: "hidden" }}
            >
              {trend.some((x) => x.income || x.expense) ? (
                <BarChart
                  key={`bar-${period}-${chartRevision}`}
                  data={bars}
                  width={barPlotWidth}
                  height={190}
                  barWidth={barLayout.barWidth}
                  initialSpacing={barLayout.initialSpacing}
                  endSpacing={barLayout.endSpacing}
                  disableScroll={!barLayout.scrollEnabled}
                  showScrollIndicator={false}
                  scrollToEnd={barLayout.scrollEnabled}
                  scrollAnimation={!reducedMotion}
                  nestedScrollEnabled
                  roundedTop
                  showGradient
                  isAnimated={!reducedMotion}
                  animationDuration={300}
                  hideRules
                  yAxisThickness={0}
                  xAxisThickness={0}
                  yAxisLabelWidth={barScale.yAxisLabelWidth}
                  yAxisTextStyle={{ color: colors.text.muted, fontSize: 10 }}
                  xAxisTextNumberOfLines={1}
                  xAxisLabelsHeight={22}
                  labelsDistanceFromXaxis={4}
                  noOfSections={barScale.noOfSections}
                  maxValue={barScale.maxValue}
                  stepValue={barScale.stepValue}
                  formatYLabel={(label) =>
                    formatChartAxisValue(Number(label), baseCurrency)
                  }
                />
              ) : (
                <Empty
                  loading={loading}
                  text="Your cash-flow comparison will appear here."
                />
              )}
            </DataFade>
          </ModernCard>
        </ContentReveal>

        <ContentReveal delay={170} distance={10} ready={chartsReady}>
          <View className="mb-1 flex-row items-end justify-between">
            <View>
              <AppText className="text-xl font-extrabold">Top spending</AppText>
              <AppText tone="secondary" className="text-sm">
                Your biggest categories
              </AppText>
            </View>
            <AppText
              tone={expenseChange > 0 ? "primary" : "success"}
              className="text-xs font-bold"
              style={{
                color:
                  expenseChange > 0
                    ? colors.status.expense
                    : colors.status.income,
              }}
            >
              {expenseChange > 0 ? "↑" : "↓"} {Math.abs(expenseChange)}% vs last
              month
            </AppText>
          </View>
          {categories.slice(0, 3).map((item) => (
            <View key={item.id}>
              <Card className="mb-3">
                <View className="flex-row items-center">
                  <View
                    className="h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: `${item.color}18` }}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={23}
                      color={item.color}
                    />
                  </View>
                  <View className="ml-4 flex-1">
                    <View className="flex-row items-center justify-between">
                      <AppText className="font-bold">{item.name}</AppText>
                      <AppText className="font-extrabold">
                        {formatMoney(item.total, baseCurrency)}
                      </AppText>
                    </View>
                    <View
                      className="mt-3 h-2 overflow-hidden rounded-full"
                      style={{ backgroundColor: colors.background.subtle }}
                    >
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${total ? (item.total / total) * 100 : 0}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </View>
                  </View>
                </View>
              </Card>
            </View>
          ))}
        </ContentReveal>

        <ContentReveal delay={200} distance={10} ready={chartsReady}>
          <ModernCard>
            <SectionHeader
              title="Spending rhythm"
              subtitle="Monthly expense movement"
              icon="analytics"
            />
            <DataFade
              ready={chartsReady}
              revision={chartRevision}
              style={{ marginTop: 12, overflow: "hidden" }}
            >
              {line.some((x) => x.value) ? (
                <LineChart
                  key={`line-${period}-${chartRevision}`}
                  data={line}
                  width={linePlotWidth}
                  height={205}
                  spacing={lineLayout.spacing}
                  initialSpacing={lineLayout.initialSpacing}
                  endSpacing={lineLayout.endSpacing}
                  disableScroll={!lineLayout.scrollEnabled}
                  showScrollIndicator={false}
                  scrollToEnd={lineLayout.scrollEnabled}
                  scrollAnimation={!reducedMotion}
                  nestedScrollEnabled
                  curved
                  area
                  color="#2463EB"
                  startFillColor={isDark ? "#2463EB66" : "#BFD3FF"}
                  endFillColor={colors.background.surface}
                  startOpacity={0.45}
                  endOpacity={0.02}
                  thickness={3}
                  isAnimated={!reducedMotion}
                  animateOnDataChange={!reducedMotion}
                  animationDuration={300}
                  onDataChangeAnimationDuration={240}
                  interpolateMissingValues={false}
                  extrapolateMissingValues={false}
                  hideRules
                  yAxisThickness={0}
                  xAxisThickness={0}
                  yAxisLabelWidth={lineScale.yAxisLabelWidth}
                  yAxisTextStyle={{ color: colors.text.muted, fontSize: 10 }}
                  xAxisTextNumberOfLines={1}
                  xAxisLabelsHeight={22}
                  noOfSections={lineScale.noOfSections}
                  maxValue={lineScale.maxValue}
                  stepValue={lineScale.stepValue}
                  formatYLabel={(label: string) =>
                    formatChartAxisValue(Number(label), baseCurrency)
                  }
                  focusEnabled
                  showStripOnFocus
                  stripColor="#2463EB33"
                  showTextOnFocus
                  showDataPointOnFocus
                  pointerConfig={{
                    pointerStripColor: "#2463EB55",
                    pointerColor: "#2463EB",
                    radius: 5,
                    pointerLabelWidth: 90,
                    pointerLabelHeight: 42,
                    activatePointersOnLongPress: true,
                    pointerLabelComponent: (points: any[]) => (
                      <View
                        className="rounded-xl px-3 py-2"
                        style={{ backgroundColor: colors.text.primary }}
                      >
                        <AppText
                          className="text-xs font-bold"
                          style={{ color: colors.background.surface }}
                        >
                          {formatMoney(
                            Math.round((points[0]?.value ?? 0) * 100),
                            baseCurrency,
                          )}
                        </AppText>
                      </View>
                    ),
                  }}
                />
              ) : (
                <Empty
                  loading={loading}
                  text="Track for a few months to reveal your trend."
                />
              )}
            </DataFade>
          </ModernCard>
        </ContentReveal>
      </ScrollView>
    </SafeAreaView>
  );
}

function AccountFilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      className="rounded-xl px-4 py-2"
      style={{
        backgroundColor: active
          ? colors.brand.primary
          : colors.background.surface,
      }}
    >
      <AppText className="text-xs font-bold">{label}</AppText>
    </Pressable>
  );
}

function ModernCard({ children }: { children: React.ReactNode }) {
  const { colors, isDark } = useAppTheme();
  return (
    <View
      className="rounded-3xl p-5"
      style={{
        backgroundColor: colors.background.surface,
        borderWidth: 1,
        borderColor: colors.border.soft,
        shadowColor: "#07152D",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: isDark ? 0.22 : 0.07,
        shadowRadius: 20,
        elevation: 3,
      }}
    >
      {children}
    </View>
  );
}
function SectionHeader({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: any;
}) {
  const { colors } = useAppTheme();
  return (
    <View className="flex-row items-center">
      <View
        className="h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: colors.background.subtle }}
      >
        <Ionicons name={icon} size={20} color="#2463EB" />
      </View>
      <View className="ml-3 flex-1">
        <AppText className="text-lg font-extrabold">{title}</AppText>
        <AppText tone="secondary" className="text-xs">
          {subtitle}
        </AppText>
      </View>
      <Ionicons
        name="ellipsis-horizontal"
        size={20}
        color={colors.text.muted}
      />
    </View>
  );
}
function MiniMetric({
  label,
  value,
  color,
  currency,
}: {
  label: string;
  value: number;
  color: string;
  currency: string;
}) {
  return (
    <View className="flex-1">
      <AppText
        className="text-[10px] font-bold tracking-widest"
        style={{ color: "#AFC4CE" }}
      >
        {label}
      </AppText>
      <AppText className="mt-1 text-lg font-extrabold" style={{ color }}>
        {formatMoney(value, currency)}
      </AppText>
    </View>
  );
}
function Legend() {
  const { colors } = useAppTheme();
  return (
    <View className="mt-4 flex-row gap-5">
      <View className="flex-row items-center gap-2">
        <View
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: colors.brand.primary }}
        />
        <AppText tone="secondary" className="text-xs font-semibold">
          Income
        </AppText>
      </View>
      <View className="flex-row items-center gap-2">
        <View
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: "#7DA7F7" }}
        />
        <AppText tone="secondary" className="text-xs font-semibold">
          Expenses
        </AppText>
      </View>
    </View>
  );
}
function Empty({ text, loading }: { text: string; loading?: boolean }) {
  const { colors } = useAppTheme();
  return (
    <View className="h-40 items-center justify-center">
      <View
        className="mb-3 h-12 w-12 items-center justify-center rounded-2xl"
        style={{ backgroundColor: colors.background.subtle }}
      >
        <Ionicons
          name={loading ? "hourglass-outline" : "analytics-outline"}
          size={23}
          color={colors.text.muted}
        />
      </View>
      <AppText tone="secondary" className="max-w-64 text-center">
        {loading ? "Preparing your insights…" : text}
      </AppText>
    </View>
  );
}

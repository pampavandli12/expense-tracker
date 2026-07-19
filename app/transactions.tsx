import AppText from "@/components/AppText";
import { Card, Header } from "@/components/ui";
import {
  deleteTransaction,
  formatMoney,
  listAccounts,
  listCategories,
  listTransactions,
  monthKey,
  type TransactionFilters,
} from "@/db/repository";
import type { Account, Category } from "@/db/schema";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Row = Awaited<ReturnType<typeof listTransactions>>[number];
type KindFilter = "all" | "income" | "expense";
type ExpenseFilter = "all" | "fixed" | "variable";

export default function TransactionsScreen() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const [date, setDate] = useState(new Date());
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [expenseType, setExpenseType] = useState<ExpenseFilter>("all");
  const [accountId, setAccountId] = useState("all");
  const [categoryId, setCategoryId] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const filters: TransactionFilters = useMemo(
    () => ({
      month: monthKey(date),
      query: query || undefined,
      kind: kind === "all" ? undefined : kind,
      expenseType: expenseType === "all" ? undefined : expenseType,
      accountId: accountId === "all" ? undefined : accountId,
      categoryId: categoryId === "all" ? undefined : categoryId,
    }),
    [accountId, categoryId, date, expenseType, kind, query],
  );
  const load = useCallback(
    () => listTransactions(filters).then(setRows),
    [filters],
  );

  useEffect(() => {
    Promise.all([listAccounts(), listCategories()]).then(
      ([accountRows, categoryRows]) => {
        setAccounts(accountRows);
        setCategories(categoryRows);
      },
    );
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const expenses = rows
    .filter((row) => row.transaction.kind === "expense")
    .reduce((sum, row) => sum + row.transaction.amount, 0);
  const income = rows
    .filter((row) => row.transaction.kind === "income")
    .reduce((sum, row) => sum + row.transaction.amount, 0);
  const activeFilterCount = [
    kind !== "all",
    expenseType !== "all",
    accountId !== "all",
    categoryId !== "all",
  ].filter(Boolean).length;

  const edit = (row: Row) =>
    router.push({
      pathname: "/edit-transaction",
      params: {
        id: row.transaction.id,
        kind: row.transaction.kind,
      },
    });

  const remove = (row: Row) =>
    Alert.alert(
      "Delete transaction?",
      `${row.category.name} · ${formatMoney(
        row.transaction.amount,
        row.transaction.currency,
      )}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () =>
            deleteTransaction(row.transaction.id)
              .then(load)
              .catch((reason) =>
                Alert.alert(
                  "Couldn't delete",
                  reason instanceof Error
                    ? reason.message
                    : "Please try again.",
                ),
              ),
        },
      ],
    );

  const resetFilters = () => {
    setKind("all");
    setExpenseType("all");
    setAccountId("all");
    setCategoryId("all");
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background.base }}
    >
      <Header
        title="Transactions"
        action={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Show transaction filters"
            onPress={() => setShowFilters((value) => !value)}
            className="h-11 w-11 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.background.surface }}
          >
            <Ionicons name="options" size={21} color={colors.text.primary} />
            {activeFilterCount > 0 && (
              <View
                className="absolute right-1 top-1 h-4 min-w-4 items-center justify-center rounded-full px-1"
                style={{ backgroundColor: colors.brand.primary }}
              >
                <AppText className="text-[9px] font-bold">
                  {activeFilterCount}
                </AppText>
              </View>
            )}
          </Pressable>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 18, paddingBottom: 60, gap: 12 }}
      >
        <View className="flex-row items-center justify-between">
          <Pressable
            accessibilityLabel="Previous month"
            onPress={() =>
              setDate(
                (value) =>
                  new Date(value.getFullYear(), value.getMonth() - 1, 1),
              )
            }
            className="h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: colors.background.surface }}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={colors.text.primary}
            />
          </Pressable>
          <AppText className="text-lg font-extrabold">
            {new Intl.DateTimeFormat("en-IN", {
              month: "long",
              year: "numeric",
            }).format(date)}
          </AppText>
          <Pressable
            accessibilityLabel="Next month"
            onPress={() =>
              setDate(
                (value) =>
                  new Date(value.getFullYear(), value.getMonth() + 1, 1),
              )
            }
            className="h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: colors.background.surface }}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.text.primary}
            />
          </Pressable>
        </View>

        <View
          className="mt-1 flex-row items-center rounded-2xl px-4"
          style={{
            backgroundColor: colors.background.surface,
            borderWidth: 1,
            borderColor: colors.border.soft,
          }}
        >
          <Ionicons name="search" size={19} color={colors.text.muted} />
          <TextInput
            accessibilityLabel="Search transactions"
            value={query}
            onChangeText={setQuery}
            placeholder="Search category, account, or notes"
            placeholderTextColor={colors.text.muted}
            className="h-13 ml-3 flex-1"
            style={{ color: colors.text.primary }}
          />
          {!!query && (
            <Pressable
              accessibilityLabel="Clear search"
              onPress={() => setQuery("")}
            >
              <Ionicons
                name="close-circle"
                size={19}
                color={colors.text.muted}
              />
            </Pressable>
          )}
        </View>

        {showFilters && (
          <Card>
            <FilterSection
              label="TYPE"
              values={["all", "income", "expense"]}
              selected={kind}
              onSelect={(value) => setKind(value as KindFilter)}
            />
            <FilterSection
              label="CLASSIFICATION"
              values={["all", "variable", "fixed"]}
              selected={expenseType}
              onSelect={(value) => setExpenseType(value as ExpenseFilter)}
            />
            <AppText
              tone="muted"
              className="mt-5 text-[10px] font-bold tracking-widest"
            >
              ACCOUNT
            </AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 10 }}
            >
              <FilterChip
                label="All"
                active={accountId === "all"}
                onPress={() => setAccountId("all")}
              />
              {accounts.map((account) => (
                <FilterChip
                  key={account.id}
                  label={account.name}
                  active={accountId === account.id}
                  onPress={() => setAccountId(account.id)}
                />
              ))}
            </ScrollView>
            <AppText
              tone="muted"
              className="mt-2 text-[10px] font-bold tracking-widest"
            >
              CATEGORY
            </AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, paddingVertical: 10 }}
            >
              <FilterChip
                label="All"
                active={categoryId === "all"}
                onPress={() => setCategoryId("all")}
              />
              {categories
                .filter((category) => kind === "all" || category.kind === kind)
                .map((category) => (
                  <FilterChip
                    key={category.id}
                    label={category.name}
                    active={categoryId === category.id}
                    onPress={() => setCategoryId(category.id)}
                  />
                ))}
            </ScrollView>
            {activeFilterCount > 0 && (
              <Pressable onPress={resetFilters} className="mt-2 py-2">
                <AppText
                  tone="success"
                  className="text-center text-sm font-bold"
                >
                  Clear all filters
                </AppText>
              </Pressable>
            )}
          </Card>
        )}

        <View>
          <LinearGradient
            colors={isDark ? ["#19384A", "#123025"] : ["#0F253A", "#17613A"]}
            style={{
              flexDirection: "row",
              borderRadius: 24,
              padding: 20,
            }}
          >
            <Total label="INCOME" value={income} color="#58F492" />
            <Total label="EXPENSE" value={expenses} color="#9EC0FF" />
          </LinearGradient>
        </View>

        <View className="mb-1 mt-3">
          <AppText className="text-xl font-extrabold">Results</AppText>
          <AppText tone="secondary" className="text-sm">
            {rows.length} {rows.length === 1 ? "transaction" : "transactions"}
          </AppText>
        </View>

        {rows.map((row) => (
          <Card key={row.transaction.id}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Edit ${row.category.name} transaction`}
              onPress={() => edit(row)}
              className="flex-row items-center"
            >
              <View
                className="h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${row.category.color}18` }}
              >
                <Ionicons
                  name={row.category.icon as never}
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
                {!!row.transaction.notes && (
                  <AppText
                    tone="secondary"
                    numberOfLines={1}
                    className="mt-1 text-xs"
                  >
                    {row.transaction.notes}
                  </AppText>
                )}
              </View>
              <View className="items-end">
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
                  {formatMoney(
                    row.transaction.amount,
                    row.transaction.currency,
                  )}
                </AppText>
                <AppText tone="muted" className="mt-1 text-[10px] uppercase">
                  {row.transaction.expenseType ?? row.transaction.kind}
                </AppText>
              </View>
            </Pressable>
            <View
              className="mt-4 flex-row justify-end gap-2 border-t pt-3"
              style={{ borderColor: colors.border.soft }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Edit transaction"
                onPress={() => edit(row)}
                className="flex-row items-center gap-1 rounded-xl px-3 py-2"
                style={{ backgroundColor: colors.background.subtle }}
              >
                <Ionicons
                  name="create-outline"
                  size={16}
                  color={colors.text.secondary}
                />
                <AppText tone="secondary" className="text-xs font-bold">
                  Edit
                </AppText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Delete transaction"
                onPress={() => remove(row)}
                className="flex-row items-center gap-1 rounded-xl px-3 py-2"
                style={{ backgroundColor: colors.status.expenseSoft }}
              >
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={colors.status.expense}
                />
                <AppText
                  className="text-xs font-bold"
                  style={{ color: colors.status.expense }}
                >
                  Delete
                </AppText>
              </Pressable>
            </View>
          </Card>
        ))}

        {!rows.length && (
          <Card>
            <View className="items-center py-8">
              <Ionicons
                name="receipt-outline"
                size={34}
                color={colors.text.muted}
              />
              <AppText tone="secondary" className="mt-3 text-center">
                No transactions match these filters.
              </AppText>
              {activeFilterCount > 0 && (
                <Pressable onPress={resetFilters} className="mt-4">
                  <AppText tone="success" className="font-bold">
                    Clear filters
                  </AppText>
                </Pressable>
              )}
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterSection({
  label,
  values,
  selected,
  onSelect,
}: {
  label: string;
  values: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <View className="mt-2">
      <AppText tone="muted" className="text-[10px] font-bold tracking-widest">
        {label}
      </AppText>
      <View className="mt-2 flex-row gap-2">
        {values.map((value) => (
          <FilterChip
            key={value}
            label={value}
            active={selected === value}
            onPress={() => onSelect(value)}
          />
        ))}
      </View>
    </View>
  );
}

function FilterChip({
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
      className="rounded-xl px-3 py-2"
      style={{
        backgroundColor: active
          ? colors.brand.primary
          : colors.background.subtle,
      }}
    >
      <AppText className="text-xs font-bold capitalize">{label}</AppText>
    </Pressable>
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

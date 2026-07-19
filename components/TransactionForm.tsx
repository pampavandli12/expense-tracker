import AppText from "@/components/AppText";
import DateField from "@/components/DateField";
import { Choice, Header, MoneyInput, PrimaryButton } from "@/components/ui";
import {
  formatMoney,
  getTransaction,
  listAccounts,
  listCategories,
  saveTransaction,
  toMinorUnits,
} from "@/db/repository";
import type { Account, Category } from "@/db/schema";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TransactionForm({
  kind,
  transactionId,
}: {
  kind: "income" | "expense";
  transactionId?: string;
}) {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [notes, setNotes] = useState("");
  const [expenseType, setExpenseType] = useState<"variable" | "fixed">(
    "variable",
  );
  const [occurredAt, setOccurredAt] = useState(new Date());
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    Promise.all([
      listAccounts(),
      listCategories(kind),
      transactionId
        ? getTransaction(transactionId)
        : Promise.resolve(undefined),
    ])
      .then(([activeAccounts, activeCategories, existing]) => {
        if (!active) return;
        const availableAccounts =
          existing &&
          !activeAccounts.some((item) => item.id === existing.account.id)
            ? [...activeAccounts, existing.account]
            : activeAccounts;
        const availableCategories =
          existing &&
          !activeCategories.some((item) => item.id === existing.category.id)
            ? [...activeCategories, existing.category]
            : activeCategories;
        setAccounts(availableAccounts);
        setCategories(availableCategories);
        if (existing) {
          setAmount(String(existing.transaction.amount / 100));
          setAccountId(existing.transaction.accountId);
          setCategoryId(existing.transaction.categoryId);
          setNotes(existing.transaction.notes ?? "");
          setExpenseType(existing.transaction.expenseType ?? "variable");
          setOccurredAt(existing.transaction.occurredAt);
        } else {
          setAccountId(availableAccounts[0]?.id ?? "");
          setCategoryId(availableCategories[0]?.id ?? "");
        }
      })
      .catch((reason) =>
        Alert.alert(
          "Unable to load transaction",
          reason instanceof Error ? reason.message : "Please try again.",
          [{ text: "Go back", onPress: () => router.back() }],
        ),
      );
    return () => {
      active = false;
    };
  }, [kind, router, transactionId]);
  const account = accounts.find((a) => a.id === accountId);
  const minor = toMinorUnits(amount || "0");
  const valid = minor > 0 && !!account && !!categoryId;
  const save = async () => {
    if (!valid || !account) return;
    setSaving(true);
    try {
      await saveTransaction(
        {
          kind,
          amount: minor,
          accountId,
          categoryId,
          currency: account.currency,
          occurredAt,
          notes: notes.trim(),
          expenseType,
        },
        transactionId,
      );
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (e) {
      Alert.alert(
        "Couldn't save",
        e instanceof Error ? e.message : "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };
  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background.base }}
    >
      <Header
        title={`${transactionId ? "Edit" : "Add"} ${
          kind === "expense" ? "Expense" : "Income"
        }`}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
        >
          <View>
            <LinearGradient
              colors={
                isDark
                  ? ["#172B40", "#16362E"]
                  : kind === "expense"
                    ? ["#18263A", "#35303A", "#493331"]
                    : ["#0F253A", "#123E37", "#17613A"]
              }
              style={{
                borderRadius: 26,
                padding: 20,
                borderWidth: 1,
                borderColor: colors.border.soft,
              }}
            >
              <AppText
                className="text-center text-xs font-bold tracking-widest"
                style={{ color: "#B7C9D2" }}
              >
                {kind === "expense" ? "ENTER AMOUNT" : "INCOME AMOUNT"}
              </AppText>
              <MoneyInput
                inverse
                value={amount}
                onChange={setAmount}
                currency={
                  account?.currency === "INR" ? "₹" : (account?.currency ?? "₹")
                }
              />
              {minor > 0 && (
                <AppText
                  className="text-center text-xs"
                  style={{ color: "#AFC4CE" }}
                >
                  {formatMoney(minor, account?.currency)} · {account?.name}
                </AppText>
              )}
            </LinearGradient>
          </View>
          <View className="mt-7">
            <AppText className="text-lg font-extrabold">
              {kind === "expense" ? "Choose category" : "Income source"}
            </AppText>
            <AppText tone="secondary" className="mb-4 text-sm">
              Keep your insights organised
            </AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{
                gap: 12,
                paddingLeft: 4,
                paddingTop: 4,
                paddingBottom: 4,
                paddingRight: 20,
              }}
            >
              {categories.map((category) => (
                <Choice
                  key={category.id}
                  selected={category.id === categoryId}
                  label={category.name.replace("Housing & ", "")}
                  icon={category.icon as any}
                  onPress={() => setCategoryId(category.id)}
                />
              ))}
            </ScrollView>
          </View>
          {kind === "expense" && (
            <View
              className="my-7 flex-row rounded-2xl p-1"
              style={{ backgroundColor: colors.background.subtle }}
            >
              {(["variable", "fixed"] as const).map((value) => (
                <Pressable
                  key={value}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setExpenseType(value);
                  }}
                  className="flex-1 rounded-xl py-3"
                  style={{
                    backgroundColor:
                      expenseType === value
                        ? colors.background.surface
                        : "transparent",
                  }}
                >
                  <AppText
                    tone={expenseType === value ? "primary" : "secondary"}
                    className="text-center font-bold capitalize"
                  >
                    {value}
                  </AppText>
                </Pressable>
              ))}
            </View>
          )}
          <View>
            <AppText className="text-lg font-extrabold">Account</AppText>
            <AppText tone="secondary" className="mb-3 text-sm">
              Where this money belongs
            </AppText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10 }}
            >
              {accounts.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setAccountId(item.id);
                  }}
                  className="flex-row items-center gap-2 rounded-2xl px-4 py-3"
                  style={{
                    backgroundColor:
                      item.id === accountId
                        ? colors.brand.primary
                        : colors.background.surface,
                    borderWidth: 1,
                    borderColor:
                      item.id === accountId
                        ? colors.brand.primary
                        : colors.border.soft,
                  }}
                >
                  <Ionicons
                    name={item.type === "cash" ? "cash" : "wallet"}
                    size={17}
                    color={colors.text.primary}
                  />
                  <AppText className="font-bold">{item.name}</AppText>
                </Pressable>
              ))}
            </ScrollView>
          </View>
          <View>
            <AppText className="mb-3 mt-7 text-lg font-extrabold">
              Details
            </AppText>
            <DateField value={occurredAt} onChange={setOccurredAt} />
            <AppText
              tone="secondary"
              className="mb-3 mt-5 text-xs font-bold tracking-widest"
            >
              NOTES · OPTIONAL
            </AppText>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              multiline
              placeholder="What was this for?"
              placeholderTextColor={colors.text.muted}
              className="min-h-28 rounded-3xl p-5 text-base"
              style={{
                color: colors.text.primary,
                backgroundColor: colors.background.surface,
                borderWidth: 1,
                borderColor: colors.border.soft,
                textAlignVertical: "top",
              }}
            />
          </View>
        </ScrollView>
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 8,
            backgroundColor: colors.background.base,
            borderTopWidth: 1,
            borderTopColor: colors.border.soft,
          }}
        >
          <PrimaryButton
            title={`${transactionId ? "Update" : "Save"} ${
              kind === "expense" ? "Expense" : "Income"
            }`}
            onPress={save}
            disabled={!valid}
            loading={saving}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

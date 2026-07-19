import AppText from "@/components/AppText";
import { Choice, Header, MoneyInput, PrimaryButton } from "@/components/ui";
import {
  formatMoney,
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
import { Alert, Pressable, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TransactionForm({
  kind,
}: {
  kind: "income" | "expense";
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
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    Promise.all([listAccounts(), listCategories(kind)]).then(([a, c]) => {
      setAccounts(a);
      setCategories(c);
      setAccountId(a[0]?.id ?? "");
      setCategoryId(c[0]?.id ?? "");
    });
  }, [kind]);
  const account = accounts.find((a) => a.id === accountId);
  const minor = toMinorUnits(amount || "0");
  const valid = minor > 0 && !!account && !!categoryId;
  const save = async () => {
    if (!valid || !account) return;
    setSaving(true);
    try {
      await saveTransaction({
        kind,
        amount: minor,
        accountId,
        categoryId,
        currency: account.currency,
        occurredAt: new Date(),
        notes: notes.trim(),
        expenseType,
      });
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
      <Header title={kind === "expense" ? "Add Expense" : "Add Income"} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20, paddingBottom: 150 }}
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
            contentContainerStyle={{ gap: 18, padding: 4 }}
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
          <View
            className="flex-row items-center rounded-3xl p-5"
            style={{
              backgroundColor: colors.background.surface,
              borderWidth: 1,
              borderColor: colors.border.soft,
            }}
          >
            <View
              className="h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: colors.background.subtle }}
            >
              <Ionicons
                name="calendar"
                size={20}
                color={colors.brand.primary}
              />
            </View>
            <AppText className="ml-3 font-semibold">
              Today,{" "}
              {new Intl.DateTimeFormat("en-IN", {
                day: "numeric",
                month: "short",
              }).format(new Date())}
            </AppText>
          </View>
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
        className="absolute bottom-0 left-0 right-0 p-5"
        style={{ backgroundColor: colors.background.base }}
      >
        <PrimaryButton
          title={`Save ${kind === "expense" ? "Expense" : "Income"}`}
          onPress={save}
          disabled={!valid}
          loading={saving}
        />
      </View>
    </SafeAreaView>
  );
}

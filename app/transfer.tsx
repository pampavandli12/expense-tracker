import AppText from "@/components/AppText";
import DateField from "@/components/DateField";
import { Card, Header, PrimaryButton } from "@/components/ui";
import { createTransfer, listAccounts, toMinorUnits } from "@/db/repository";
import type { Account } from "@/db/schema";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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

export default function TransferScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [fromAccountId, setFromAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [sourceAmount, setSourceAmount] = useState("");
  const [destinationAmount, setDestinationAmount] = useState("");
  const [occurredAt, setOccurredAt] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    listAccounts().then((rows) => {
      setAccounts(rows);
      setFromAccountId(rows[0]?.id ?? "");
      setToAccountId(rows[1]?.id ?? "");
    });
  }, []);

  const fromAccount = accounts.find((item) => item.id === fromAccountId);
  const toAccount = accounts.find((item) => item.id === toAccountId);
  const sameCurrency = fromAccount?.currency === toAccount?.currency;
  const sourceMinor = toMinorUnits(sourceAmount || "0");
  const destinationMinor = sameCurrency
    ? sourceMinor
    : toMinorUnits(destinationAmount || "0");
  const valid =
    !!fromAccount &&
    !!toAccount &&
    fromAccount.id !== toAccount.id &&
    sourceMinor > 0 &&
    destinationMinor > 0;
  const availableDestinations = useMemo(
    () => accounts.filter((item) => item.id !== fromAccountId),
    [accounts, fromAccountId],
  );

  useEffect(() => {
    if (toAccountId === fromAccountId) {
      setToAccountId(availableDestinations[0]?.id ?? "");
    }
  }, [availableDestinations, fromAccountId, toAccountId]);

  const save = async () => {
    if (!valid) return;
    setSaving(true);
    try {
      await createTransfer({
        fromAccountId,
        toAccountId,
        sourceAmount: sourceMinor,
        destinationAmount: destinationMinor,
        occurredAt,
        notes,
      });
      router.back();
    } catch (reason) {
      Alert.alert(
        "Couldn't transfer",
        reason instanceof Error ? reason.message : "Please try again.",
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
      <Header title="Transfer Money" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === "ios" ? "interactive" : "on-drag"
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 20, paddingBottom: 32, gap: 20 }}
        >
          {accounts.length < 2 ? (
            <Card>
              <View className="items-center py-8">
                <Ionicons
                  name="swap-horizontal"
                  size={36}
                  color={colors.text.muted}
                />
                <AppText className="mt-4 text-center text-lg font-extrabold">
                  Two accounts are required
                </AppText>
                <AppText tone="secondary" className="mt-2 text-center">
                  Add another account before creating a transfer.
                </AppText>
              </View>
            </Card>
          ) : (
            <>
              <Card>
                <AccountSelector
                  label="FROM"
                  accounts={accounts}
                  selectedId={fromAccountId}
                  onSelect={setFromAccountId}
                />
                <View className="my-5 items-center">
                  <View
                    className="h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: colors.brand.primary }}
                  >
                    <Ionicons name="arrow-down" size={20} color="#0A2940" />
                  </View>
                </View>
                <AccountSelector
                  label="TO"
                  accounts={availableDestinations}
                  selectedId={toAccountId}
                  onSelect={setToAccountId}
                />
              </Card>

              <Card>
                <AmountField
                  label="AMOUNT SENT"
                  currency={fromAccount?.currency ?? "INR"}
                  value={sourceAmount}
                  onChange={(value) => {
                    setSourceAmount(value);
                    if (sameCurrency) setDestinationAmount(value);
                  }}
                />
                {!sameCurrency && (
                  <View className="mt-5">
                    <AmountField
                      label="AMOUNT RECEIVED"
                      currency={toAccount?.currency ?? "INR"}
                      value={destinationAmount}
                      onChange={setDestinationAmount}
                    />
                    <AppText tone="secondary" className="mt-3 text-xs">
                      Enter the destination amount manually. No exchange rate is
                      fetched or stored.
                    </AppText>
                  </View>
                )}
              </Card>

              <DateField value={occurredAt} onChange={setOccurredAt} />

              <View>
                <AppText
                  tone="muted"
                  className="mb-2 text-xs font-bold tracking-widest"
                >
                  NOTES · OPTIONAL
                </AppText>
                <TextInput
                  accessibilityLabel="Transfer notes"
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  placeholder="What is this transfer for?"
                  placeholderTextColor={colors.text.muted}
                  className="min-h-24 rounded-3xl p-5"
                  style={{
                    backgroundColor: colors.background.surface,
                    color: colors.text.primary,
                    borderWidth: 1,
                    borderColor: colors.border.soft,
                    textAlignVertical: "top",
                  }}
                />
              </View>
            </>
          )}
        </ScrollView>
        {accounts.length >= 2 && (
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
              title="Complete Transfer"
              onPress={save}
              disabled={!valid}
              loading={saving}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AccountSelector({
  label,
  accounts,
  selectedId,
  onSelect,
}: {
  label: string;
  accounts: Account[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View>
      <AppText tone="muted" className="text-[10px] font-bold tracking-widest">
        {label}
      </AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingTop: 10 }}
      >
        {accounts.map((account) => {
          const active = account.id === selectedId;
          return (
            <Pressable
              key={account.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onSelect(account.id)}
              className="rounded-2xl px-4 py-3"
              style={{
                backgroundColor: active
                  ? colors.brand.primary
                  : colors.background.subtle,
              }}
            >
              <AppText className="font-bold">{account.name}</AppText>
              <AppText tone="secondary" className="mt-1 text-[10px]">
                {account.currency}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function AmountField({
  label,
  currency,
  value,
  onChange,
}: {
  label: string;
  currency: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View>
      <AppText tone="muted" className="text-[10px] font-bold tracking-widest">
        {label}
      </AppText>
      <View className="mt-2 flex-row items-center rounded-2xl px-4">
        <AppText tone="secondary" className="mr-3 text-lg font-bold">
          {currency}
        </AppText>
        <TextInput
          accessibilityLabel={`${label.toLowerCase()} in ${currency}`}
          value={value}
          onChangeText={(text) => onChange(text.replace(/[^0-9.]/g, ""))}
          keyboardType="decimal-pad"
          placeholder="0.00"
          placeholderTextColor={colors.text.muted}
          className="flex-1 py-3 text-3xl font-extrabold"
          style={{ color: colors.text.primary }}
        />
      </View>
    </View>
  );
}

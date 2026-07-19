import AppText from "@/components/AppText";
import { Card, PrimaryButton } from "@/components/ui";
import {
  accountBalances,
  createAccount,
  formatMoney,
  toMinorUnits,
} from "@/db/repository";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Modal, Pressable, ScrollView, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
type Row = Awaited<ReturnType<typeof accountBalances>>[number];
export default function Accounts() {
  const { colors, isDark } = useAppTheme();
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const load = useCallback(() => accountBalances().then(setRows), []);
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );
  const total = rows
    .filter((r) => r.currency === "INR")
    .reduce((sum, r) => sum + r.balance, 0);
  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background.base }}
    >
      <ScrollView
        contentContainerStyle={{ padding: 18, paddingBottom: 120, gap: 18 }}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <AppText className="text-3xl font-extrabold">Accounts</AppText>
            <AppText tone="secondary">Your money, organised clearly</AppText>
          </View>
          <Pressable
            onPress={() => setOpen(true)}
            className="h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.brand.primary }}
          >
            <Ionicons name="add" size={27} color="#0A2940" />
          </Pressable>
        </View>
        <View>
          <LinearGradient
            colors={isDark ? ["#19384A", "#123025"] : ["#0F253A", "#17613A"]}
            style={{ borderRadius: 26, padding: 23 }}
          >
            <AppText
              className="text-xs font-bold tracking-widest"
              style={{ color: "#B7C9D2" }}
            >
              TOTAL ACROSS INR ACCOUNTS
            </AppText>
            <AppText
              className="mt-3 text-4xl font-extrabold"
              style={{ color: "white" }}
            >
              {formatMoney(total)}
            </AppText>
            <AppText className="mt-4 text-xs" style={{ color: "#9FC2B0" }}>
              {rows.length} active {rows.length === 1 ? "account" : "accounts"}
            </AppText>
          </LinearGradient>
        </View>
        <View>
          <AppText className="text-xl font-extrabold">Your accounts</AppText>
          <AppText tone="secondary" className="text-sm">
            Balances update with every transaction
          </AppText>
        </View>
        {rows.map((row) => (
          <View key={row.id}>
            <Card>
              <View className="flex-row items-center">
                <View
                  className="h-13 w-13 items-center justify-center rounded-2xl p-3"
                  style={{ backgroundColor: colors.background.subtle }}
                >
                  <Ionicons
                    name={
                      row.type === "cash"
                        ? "cash"
                        : row.type === "card"
                          ? "card"
                          : row.type === "bank"
                            ? "business"
                            : "wallet"
                    }
                    size={25}
                    color={colors.brand.primary}
                  />
                </View>
                <View className="ml-4 flex-1">
                  <AppText className="text-base font-extrabold">
                    {row.name}
                  </AppText>
                  <AppText tone="muted" className="mt-1 text-xs capitalize">
                    {row.type} · {row.currency}
                  </AppText>
                </View>
                <View className="items-end">
                  <AppText className="text-lg font-extrabold">
                    {formatMoney(row.balance, row.currency)}
                  </AppText>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.text.muted}
                  />
                </View>
              </View>
            </Card>
          </View>
        ))}
        <Pressable
          onPress={() => setOpen(true)}
          className="items-center rounded-3xl border border-dashed py-5"
          style={{ borderColor: colors.border.default }}
        >
          <AppText tone="success" className="font-bold">
            + Add another account
          </AppText>
        </Pressable>
      </ScrollView>
      <AccountModal
        visible={open}
        close={() => setOpen(false)}
        saved={() => {
          setOpen(false);
          load();
        }}
      />
    </SafeAreaView>
  );
}
function AccountModal({
  visible,
  close,
  saved,
}: {
  visible: boolean;
  close: () => void;
  saved: () => void;
}) {
  const { colors } = useAppTheme();
  const [name, setName] = useState("");
  const [opening, setOpening] = useState("");
  const [type, setType] = useState<"cash" | "bank" | "card" | "wallet">("bank");
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={close}
    >
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: "#07152DAA" }}
      >
        <View
          className="rounded-t-[32px] p-6"
          style={{ backgroundColor: colors.background.base }}
        >
          <View
            className="mb-6 h-1 w-12 self-center rounded-full"
            style={{ backgroundColor: colors.border.default }}
          />
          <View className="flex-row justify-between">
            <View>
              <AppText className="text-2xl font-extrabold">New account</AppText>
              <AppText tone="secondary">Create a home for your money</AppText>
            </View>
            <Pressable onPress={close}>
              <Ionicons name="close" size={26} color={colors.text.primary} />
            </Pressable>
          </View>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Account name"
            placeholderTextColor={colors.text.muted}
            className="mb-4 mt-6 rounded-2xl p-4"
            style={{
              backgroundColor: colors.background.surface,
              color: colors.text.primary,
            }}
          />
          <View className="mb-4 flex-row gap-2">
            {(["cash", "bank", "card", "wallet"] as const).map((item) => (
              <Pressable
                key={item}
                onPress={() => setType(item)}
                className="flex-1 rounded-xl py-3"
                style={{
                  backgroundColor:
                    type === item
                      ? colors.brand.primary
                      : colors.background.subtle,
                }}
              >
                <AppText className="text-center text-xs font-bold capitalize">
                  {item}
                </AppText>
              </Pressable>
            ))}
          </View>
          <TextInput
            value={opening}
            onChangeText={setOpening}
            keyboardType="decimal-pad"
            placeholder="Opening balance"
            placeholderTextColor={colors.text.muted}
            className="mb-6 rounded-2xl p-4"
            style={{
              backgroundColor: colors.background.surface,
              color: colors.text.primary,
            }}
          />
          <PrimaryButton
            title="Create Account"
            disabled={!name.trim()}
            onPress={async () => {
              await createAccount({
                name: name.trim(),
                type,
                currency: "INR",
                openingBalance: toMinorUnits(opening),
              });
              saved();
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

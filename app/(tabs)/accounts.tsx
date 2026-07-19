import AppText from "@/components/AppText";
import { Card, PrimaryButton } from "@/components/ui";
import {
  accountBalances,
  archiveAccount,
  createAccount,
  formatMoney,
  toMinorUnits,
  updateAccount,
} from "@/db/repository";
import { useTabBarMetrics } from "@/lib/navigation/tabBar";
import { useAppPreferences, useAppTheme } from "@/lib/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
type Row = Awaited<ReturnType<typeof accountBalances>>[number];
export default function Accounts() {
  const { colors, isDark } = useAppTheme();
  const { contentBottomPadding } = useTabBarMetrics();
  const { baseCurrency } = useAppPreferences();
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row>();
  const load = useCallback(() => accountBalances().then(setRows), []);
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );
  const total = rows
    .filter((r) => r.currency === baseCurrency)
    .reduce((sum, r) => sum + r.balance, 0);
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1"
      style={{ backgroundColor: colors.background.base }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          padding: 18,
          paddingBottom: contentBottomPadding,
          gap: 18,
        }}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <AppText className="text-3xl font-extrabold">Accounts</AppText>
            <AppText tone="secondary">Your money, organised clearly</AppText>
          </View>
          <View className="flex-row gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Transfer money"
              onPress={() => router.push("/transfer")}
              className="h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: colors.background.surface }}
            >
              <Ionicons
                name="swap-horizontal"
                size={23}
                color={colors.brand.primary}
              />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add account"
              onPress={() => {
                setEditing(undefined);
                setOpen(true);
              }}
              className="h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: colors.brand.primary }}
            >
              <Ionicons name="add" size={27} color="#0A2940" />
            </Pressable>
          </View>
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
              TOTAL ACROSS {baseCurrency} ACCOUNTS
            </AppText>
            <AppText
              className="mt-3 text-4xl font-extrabold"
              style={{ color: "white" }}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.68}
            >
              {formatMoney(total, baseCurrency)}
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
          <Pressable
            key={row.id}
            accessibilityRole="button"
            accessibilityLabel={`View ${row.name} account`}
            onPress={() =>
              router.push({ pathname: "/account/[id]", params: { id: row.id } })
            }
          >
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
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Edit ${row.name} account`}
                    onPress={(event) => {
                      event.stopPropagation();
                      setEditing(row);
                      setOpen(true);
                    }}
                    className="mt-1 h-8 w-8 items-center justify-center rounded-lg"
                    style={{ backgroundColor: colors.background.subtle }}
                  >
                    <Ionicons
                      name="create-outline"
                      size={16}
                      color={colors.text.muted}
                    />
                  </Pressable>
                </View>
              </View>
            </Card>
          </Pressable>
        ))}
        <Pressable
          onPress={() => {
            setEditing(undefined);
            setOpen(true);
          }}
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
        account={editing}
        close={() => {
          setOpen(false);
          setEditing(undefined);
        }}
        saved={() => {
          setOpen(false);
          setEditing(undefined);
          load();
        }}
      />
    </SafeAreaView>
  );
}
function AccountModal({
  visible,
  account,
  close,
  saved,
}: {
  visible: boolean;
  account?: Row;
  close: () => void;
  saved: () => void;
}) {
  const { colors } = useAppTheme();
  const [name, setName] = useState("");
  const [opening, setOpening] = useState("");
  const [type, setType] = useState<"cash" | "bank" | "card" | "wallet">("bank");
  const [currency, setCurrency] = useState("INR");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!visible) return;
    setName(account?.name ?? "");
    setOpening(account ? String(account.openingBalance / 100) : "");
    setType(account?.type ?? "bank");
    setCurrency(account?.currency ?? "INR");
  }, [account, visible]);

  const save = async () => {
    setSaving(true);
    try {
      const input = {
        name: name.trim(),
        type,
        currency: currency.trim().toUpperCase(),
        openingBalance: toMinorUnits(opening || "0"),
      };
      if (account) await updateAccount(account.id, input);
      else await createAccount(input);
      saved();
    } catch (reason) {
      Alert.alert(
        `Couldn't ${account ? "update" : "create"} account`,
        reason instanceof Error ? reason.message : "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const archive = () =>
    Alert.alert(
      "Archive account?",
      "Existing transactions remain in your history. The account will no longer be available for new entries.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: () =>
            account &&
            archiveAccount(account.id)
              .then(saved)
              .catch((reason) =>
                Alert.alert(
                  "Couldn't archive account",
                  reason instanceof Error
                    ? reason.message
                    : "Please try again.",
                ),
              ),
        },
      ],
    );
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
              <AppText className="text-2xl font-extrabold">
                {account ? "Edit account" : "New account"}
              </AppText>
              <AppText tone="secondary">Create a home for your money</AppText>
            </View>
            <Pressable onPress={close}>
              <Ionicons name="close" size={26} color={colors.text.primary} />
            </Pressable>
          </View>
          <TextInput
            accessibilityLabel="Account name"
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
          <TextInput
            accessibilityLabel="Account currency code"
            value={currency}
            onChangeText={(value) =>
              setCurrency(value.replace(/[^A-Za-z]/g, "").slice(0, 3))
            }
            autoCapitalize="characters"
            maxLength={3}
            placeholder="Currency code (INR)"
            placeholderTextColor={colors.text.muted}
            className="mb-4 rounded-2xl p-4"
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
            accessibilityLabel="Opening balance"
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
            title={account ? "Update Account" : "Create Account"}
            disabled={!name.trim() || currency.trim().length !== 3}
            loading={saving}
            onPress={save}
          />
          {account && (
            <Pressable
              accessibilityRole="button"
              onPress={archive}
              className="mt-3 py-3"
            >
              <AppText tone="danger" className="text-center font-bold">
                Archive account
              </AppText>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

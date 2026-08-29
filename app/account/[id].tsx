import AppText from "@/components/AppText";
import { Card, Header } from "@/components/ui";
import {
  accountBalances,
  formatMoney,
  getAccount,
  listTransactions,
  listTransfers,
} from "@/db/repository";
import type { Account } from "@/db/schema";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TransactionRow = Awaited<ReturnType<typeof listTransactions>>[number];
type TransferRow = Awaited<ReturnType<typeof listTransfers>>[number];

export default function AccountDetailScreen() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const accountId = Array.isArray(id) ? id[0] : id;
  const [account, setAccount] = useState<Account & { balance: number }>();
  const [transactionRows, setTransactionRows] = useState<TransactionRow[]>([]);
  const [transferRows, setTransferRows] = useState<TransferRow[]>([]);

  const load = useCallback(async () => {
    if (!accountId) return;
    const [storedAccount, balances, accountTransactions, accountTransfers] =
      await Promise.all([
        getAccount(accountId),
        accountBalances(),
        listTransactions({ accountId }),
        listTransfers(accountId),
      ]);
    if (!storedAccount) return;
    const balance =
      balances.find((item) => item.id === accountId)?.balance ?? 0;
    setAccount({ ...storedAccount, balance });
    setTransactionRows(accountTransactions);
    setTransferRows(accountTransfers);
  }, [accountId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background.base }}
    >
      <Header title={account?.name ?? "Account"} />
      <ScrollView
        contentContainerStyle={{ padding: 18, paddingBottom: 60, gap: 16 }}
      >
        <Card>
          <AppText tone="muted" className="text-xs font-bold tracking-widest">
            CURRENT BALANCE · {account?.currency ?? ""}
          </AppText>
          <AppText
            className="mt-3 text-4xl font-extrabold"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.68}
          >
            {formatMoney(account?.balance ?? 0, account?.currency)}
          </AppText>
          <AppText tone="secondary" className="mt-3 text-xs capitalize">
            {account?.type} account · Opening balance{" "}
            {formatMoney(account?.openingBalance ?? 0, account?.currency)}
          </AppText>
        </Card>

        <View>
          <AppText className="text-xl font-extrabold">Transactions</AppText>
          <AppText tone="secondary" className="text-sm">
            Income and expenses recorded on this account
          </AppText>
        </View>
        {transactionRows.map((row) => (
          <Pressable
            key={row.transaction.id}
            onPress={() =>
              router.push({
                pathname: "/edit-transaction",
                params: {
                  id: row.transaction.id,
                  kind: row.transaction.kind,
                },
              })
            }
          >
            <Card>
              <View className="flex-row items-center">
                <View
                  className="h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${row.category.color}18` }}
                >
                  <Ionicons
                    name={row.category.icon as never}
                    size={20}
                    color={row.category.color}
                  />
                </View>
                <View className="ml-3 flex-1">
                  <AppText className="font-bold">{row.category.name}</AppText>
                  <AppText tone="muted" className="mt-1 text-xs">
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
                  {formatMoney(
                    row.transaction.amount,
                    row.transaction.currency,
                  )}
                </AppText>
              </View>
            </Card>
          </Pressable>
        ))}
        {!transactionRows.length && (
          <Card>
            <AppText tone="secondary" className="text-center">
              No income or expense records yet.
            </AppText>
          </Card>
        )}

        {!!transferRows.length && (
          <View className="mt-2">
            <AppText className="text-xl font-extrabold">Transfers</AppText>
            <AppText tone="secondary" className="text-sm">
              Money moved between your accounts
            </AppText>
          </View>
        )}
        {transferRows.map((transfer) => {
          const outgoing = transfer.fromAccountId === accountId;
          const amount = outgoing
            ? transfer.sourceAmount
            : transfer.destinationAmount;
          const currency = outgoing
            ? transfer.sourceCurrency
            : transfer.destinationCurrency;
          return (
            <Card key={transfer.id}>
              <View className="flex-row items-center">
                <View
                  className="h-11 w-11 items-center justify-center rounded-xl"
                  style={{ backgroundColor: colors.background.subtle }}
                >
                  <Ionicons
                    name={outgoing ? "arrow-up" : "arrow-down"}
                    size={20}
                    color={colors.brand.primary}
                  />
                </View>
                <View className="ml-3 flex-1">
                  <AppText className="font-bold">
                    {outgoing ? "Transfer sent" : "Transfer received"}
                  </AppText>
                  <AppText tone="muted" className="mt-1 text-xs">
                    {new Intl.DateTimeFormat("en-IN", {
                      day: "numeric",
                      month: "short",
                    }).format(transfer.occurredAt)}
                  </AppText>
                </View>
                <AppText className="font-extrabold">
                  {outgoing ? "−" : "+"}
                  {formatMoney(amount, currency)}
                </AppText>
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

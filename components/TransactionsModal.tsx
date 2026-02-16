import AppText from "@/components/AppText";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  SectionList,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type TransactionType = "FIXED" | "VARIABLE";
type FilterType = "ALL" | "FIXED" | "VARIABLE";

type Transaction = {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBackground: string;
};

type TransactionSection = {
  title: string;
  data: Transaction[];
};

function formatAmount(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function TransactionsModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { colors } = useAppTheme();
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>("ALL");

  const transactions: TransactionSection[] = useMemo(
    () => [
      {
        title: "TODAY",
        data: [
          {
            id: "today-starbucks",
            title: "Starbucks",
            amount: 350,
            type: "VARIABLE",
            iconName: "cafe",
            iconColor: colors.status.success,
            iconBackground: colors.status.incomeSoft,
          },
          {
            id: "today-uber",
            title: "Uber Ride",
            amount: 185,
            type: "VARIABLE",
            iconName: "car-sport",
            iconColor: colors.category.rent.icon,
            iconBackground: colors.category.rent.iconBackground,
          },
          {
            id: "today-zudio",
            title: "Zudio Fashion",
            amount: 2499,
            type: "VARIABLE",
            iconName: "bag-handle",
            iconColor: "#F97316",
            iconBackground: "#FCE7C8",
          },
        ],
      },
      {
        title: "YESTERDAY",
        data: [
          {
            id: "yday-rent",
            title: "Monthly Rent",
            amount: 15000,
            type: "FIXED",
            iconName: "home",
            iconColor: colors.category.transport.icon,
            iconBackground: colors.category.transport.iconBackground,
          },
          {
            id: "yday-airtel",
            title: "Airtel Fiber",
            amount: 999,
            type: "FIXED",
            iconName: "wifi",
            iconColor: colors.status.expense,
            iconBackground: colors.status.expenseSoft,
          },
          {
            id: "yday-investment",
            title: "Investment Deposit",
            amount: 5000,
            type: "FIXED",
            iconName: "wallet",
            iconColor: "#10B981",
            iconBackground: "#CFF3E5",
          },
        ],
      },
      {
        title: "OCT 20",
        data: [
          {
            id: "oct-netflix",
            title: "Netflix Premium",
            amount: 649,
            type: "FIXED",
            iconName: "film",
            iconColor: "#6366F1",
            iconBackground: "#DDE1FF",
          },
          {
            id: "oct-gourmet",
            title: "The Gourmet Kitchen",
            amount: 1250,
            type: "VARIABLE",
            iconName: "restaurant",
            iconColor: "#D9A300",
            iconBackground: "#F8EFC6",
          },
        ],
      },
    ],
    [colors]
  );

  const filteredSections = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return transactions
      .map((section) => {
        const data = section.data.filter((item) => {
          const matchesFilter =
            activeFilter === "ALL" ? true : item.type === activeFilter;
          const matchesQuery =
            normalizedQuery.length === 0
              ? true
              : item.title.toLowerCase().includes(normalizedQuery);
          return matchesFilter && matchesQuery;
        });

        return { ...section, data };
      })
      .filter((section) => section.data.length > 0);
  }, [activeFilter, query, transactions]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView
        className="flex-1"
        style={{ backgroundColor: colors.background.base }}
      >
        <View
          className="px-4 pb-4"
          style={{
            backgroundColor: colors.background.surface,
            borderBottomColor: colors.border.default,
            borderBottomWidth: 1,
          }}
        >
          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-row items-center gap-3">
              <Pressable
                onPress={onClose}
                className="h-10 w-10 rounded-full items-center justify-center"
                style={{ backgroundColor: colors.background.subtle }}
              >
                <Ionicons name="arrow-back" size={20} color={colors.icon.muted} />
              </Pressable>
              <AppText className="text-3xl font-semibold">Transactions</AppText>
            </View>
            <View
              className="h-12 w-12 rounded-full items-center justify-center"
              style={{ backgroundColor: colors.background.subtle }}
            >
              <Ionicons name="search" size={22} color={colors.icon.muted} />
            </View>
          </View>

          <View
            className="mt-4 h-12 rounded-full flex-row items-center px-4"
            style={{
              backgroundColor: colors.background.subtle,
              borderColor: colors.border.default,
              borderWidth: 1,
            }}
          >
            <Ionicons name="search" size={18} color={colors.text.secondary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search transactions"
              placeholderTextColor={colors.text.muted}
              className="ml-2 flex-1 font-system text-base"
              style={{ color: colors.text.primary }}
            />
          </View>

          <View className="flex-row gap-2 mt-4">
            <Pressable
              onPress={() => setActiveFilter("ALL")}
              className="px-6 py-3 rounded-full"
              style={{
                backgroundColor:
                  activeFilter === "ALL"
                    ? colors.brand.primary
                    : colors.background.subtle,
              }}
            >
              <AppText
                tone={activeFilter === "ALL" ? "inverse" : "secondary"}
                className="text-base font-semibold"
              >
                All
              </AppText>
            </Pressable>

            <Pressable
              onPress={() => setActiveFilter("FIXED")}
              className="px-6 py-3 rounded-full"
              style={{
                backgroundColor:
                  activeFilter === "FIXED"
                    ? colors.brand.primary
                    : colors.background.subtle,
              }}
            >
              <AppText
                tone={activeFilter === "FIXED" ? "inverse" : "secondary"}
                className="text-base font-semibold"
              >
                Fixed
              </AppText>
            </Pressable>

            <Pressable
              onPress={() => setActiveFilter("VARIABLE")}
              className="px-6 py-3 rounded-full"
              style={{
                backgroundColor:
                  activeFilter === "VARIABLE"
                    ? colors.brand.primary
                    : colors.background.subtle,
              }}
            >
              <AppText
                tone={activeFilter === "VARIABLE" ? "inverse" : "secondary"}
                className="text-base font-semibold"
              >
                Variable
              </AppText>
            </Pressable>

            <View
              className="px-5 py-3 rounded-full flex-row items-center gap-2"
              style={{ backgroundColor: colors.background.subtle }}
            >
              <AppText tone="secondary" className="text-base font-semibold">
                Category
              </AppText>
              <Ionicons name="chevron-down" size={16} color={colors.icon.muted} />
            </View>
          </View>
        </View>

        <SectionList
          sections={filteredSections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 24 }}
          style={{ flex: 1 }}
          renderSectionHeader={({ section }) => (
            <View
              className="px-4 py-3"
              style={{ backgroundColor: colors.background.base }}
            >
              <AppText tone="secondary" className="text-base font-semibold">
                {section.title}
              </AppText>
            </View>
          )}
          renderItem={({ item }) => (
            <View
              className="mx-4 py-4 flex-row items-center"
              style={{ borderBottomColor: colors.border.soft, borderBottomWidth: 1 }}
            >
              <View
                className="h-14 w-14 rounded-full items-center justify-center"
                style={{ backgroundColor: item.iconBackground }}
              >
                <Ionicons name={item.iconName} size={26} color={item.iconColor} />
              </View>

              <View className="flex-1 ml-4">
                <AppText className="text-2xl font-semibold">{item.title}</AppText>
                <View
                  className="self-start mt-1 px-3 py-1 rounded-xl"
                  style={{
                    backgroundColor:
                      item.type === "FIXED"
                        ? colors.status.incomeSoft
                        : colors.background.subtle,
                  }}
                >
                  <AppText
                    tone={item.type === "FIXED" ? "success" : "secondary"}
                    className="text-sm font-semibold"
                  >
                    {item.type}
                  </AppText>
                </View>
              </View>

              <AppText className="text-2xl font-semibold">
                {formatAmount(item.amount)}
              </AppText>
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-16 px-4">
              <AppText tone="secondary" className="text-base text-center">
                No transactions found for this filter.
              </AppText>
            </View>
          }
        />
      </SafeAreaView>
    </Modal>
  );
}

export default TransactionsModal;

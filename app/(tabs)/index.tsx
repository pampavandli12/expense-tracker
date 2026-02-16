import ActionLogButton from "@/components/ActionLogButton";
import AppText from "@/components/AppText";
import BudgetViewCard from "@/components/BudgetViewCard";
import CategorySummary from "@/components/CategorySummary";
import IncomeExpenseCard from "@/components/IncomeExpenseCard";
import Screen from "@/components/Screen";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function Home() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
  const handleNextMonth = () => {
    // Logic to navigate to the next month
  };
  const handlePreviousMonth = () => {
    // Logic to navigate to the previous month
  };
  return (
    <Screen scroll className="px-4">
      {/* Month Selector */}
      <View className="flex-row items-center justify-between mb-6">
        <Pressable
          onPress={handlePreviousMonth}
          className="w-10 h-10 rounded-lg items-center justify-center active:opacity-70"
          style={{ backgroundColor: colors.background.surface }}
        >
          <Ionicons name="chevron-back" size={20} color={colors.icon.muted} />
        </Pressable>

        <View className="flex-1 items-center">
          <AppText className="text-lg font-bold">September 2024</AppText>
        </View>

        <Pressable
          onPress={handleNextMonth}
          className="w-10 h-10 rounded-lg items-center justify-center active:opacity-70"
          style={{ backgroundColor: colors.background.surface }}
        >
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.icon.muted}
          />
        </Pressable>
      </View>

      {/* Status card */}
      <View
        className="rounded-lg p-6"
        style={{
          backgroundColor: colors.background.surface,
          borderColor: colors.border.default,
          borderWidth: 1,
        }}
      >
        <AppText tone="secondary" className="text-sm">
          Remain balance
        </AppText>
        <AppText className="text-3xl font-bold mt-2">₹ 12,345</AppText>
        <View className="flex-row gap-4 mt-10">
          <IncomeExpenseCard
            title="INCOME"
            amount="12000"
            iconName="arrow-down"
          />
          <IncomeExpenseCard
            title="EXPENSE"
            amount="5000"
            iconName="arrow-up"
          />
        </View>
      </View>

      {/* Budget Information */}
      <View className="flex-row items-center justify-between mt-8">
        <AppText className="text-lg font-semibold">Montly budget</AppText>
        <AppText tone="secondary" className="text-sm">
          84% Used
        </AppText>
      </View>
      <BudgetViewCard />

      {/* expense / income log buttons */}
      <View className="flex-row items-center justify-between mt-8 gap-4">
        <ActionLogButton title="Add Expense" iconName="remove" />
        <ActionLogButton title="Add Income" iconName="add" />
      </View>

      <CategorySummary onSeeAll={() => setIsTransactionsModalOpen(true)} />
    </Screen>
  );
}

export default Home;

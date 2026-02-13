import ActionLogButton from "@/components/ActionLogButton";
import BudgetViewCard from "@/components/BudgetViewCard";
import IncomeExpenseCard from "@/components/IncomeExpenseCard";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function Home() {
  const handleNextMonth = () => {
    // Logic to navigate to the next month
  };
  const handlePreviousMonth = () => {
    // Logic to navigate to the previous month
  };
  return (
    <SafeAreaView className="flex-1 p-4 bg-background">
      {/* Month Selector */}
      <View className="flex-row items-center justify-between mb-6">
        <Pressable
          onPress={handlePreviousMonth}
          className="w-10 h-10 rounded-lg bg-background-light items-center justify-center active:opacity-70"
        >
          <Ionicons name="chevron-back" size={20} color="#666666" />
        </Pressable>

        <View className="flex-1 items-center">
          <Text className="text-lg font-bold text-text-primary">
            September 2024
          </Text>
        </View>

        <Pressable
          onPress={handleNextMonth}
          className="w-10 h-10 rounded-lg bg-background-light items-center justify-center active:opacity-70"
        >
          <Ionicons name="chevron-forward" size={20} color="#666666" />
        </Pressable>
      </View>
      {/* Status card */}
      <View className="bg-background-light rounded-lg p-6 shadow-md">
        <Text className="text-sm text-text-secondary">Remain balance</Text>
        <Text className="text-3xl font-bold text-text-primary mt-2">
          ₹ 12,345
        </Text>
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
        <Text className="text-lg font-semibold text-text-primary ">
          Montly budget
        </Text>
        <Text className="text-sm text-text-secondary">84% Used</Text>
      </View>
      <BudgetViewCard />

      {/* expense / income log buttons */}
      <View className="flex-row items-center justify-between mt-8 gap-4">
        <ActionLogButton title="Add Expense" iconName="arrow-up" />
        <ActionLogButton title="Add Income" iconName="arrow-down" />
      </View>
      {/* <View className="flex-1 items-center justify-center">
        <Text className="text-lg text-text-secondary">
          Your financial overview will appear here.
        </Text>
       <View className="w-full h-64 bg-background-light rounded-lg mt-4 items-center justify-center">
          <Text className="text-sm text-text-secondary">Charts coming soon...</Text>
         </View>
       </View> */}

      {/* Add more components like Budget Overview, Recent Transactions, etc. */}
    </SafeAreaView>
  );
}

export default Home;

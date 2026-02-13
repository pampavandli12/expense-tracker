import { COLORS } from "@/lib/constant";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

const BudgetViewCard = () => {
  return (
    <View className="flex bg-background-light p-4 mt-2 rounded-lg shadow-md">
      <View className="flex-row items-center gap-2">
        <Text className="font-semibold text-md">₹ 22000</Text>
        <Text className="text-sm text-text-secondary">spend of ₹ 40000</Text>
      </View>
      <View className="relative bg-gray-200 h-5 w-full rounded-md mt-3">
        <View className="absolute left-0 top-0 bottom-0 w-[84%] bg-primary-400 rounded-md"></View>
      </View>
      <View className="flex-row items-center gap-2 mt-3">
        <Ionicons
          name="checkmark-circle"
          size={20}
          color={true ? COLORS.checkmark : COLORS.warning}
        />
        <Text className="text-primary-400 text-sm font-semibold">
          YOU'RE WITHIN BUDGET
        </Text>
      </View>
    </View>
  );
};

export default BudgetViewCard;

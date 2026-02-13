import { COLORS } from "@/lib/constant";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

function IncomeExpenseCard({
  title,
  amount,
  iconName,
}: {
  title: string;
  amount: string;
  iconName: string;
}) {
  return (
    <View className="flex-1 flex-row items-center gap-4">
      <Ionicons
        name={iconName as any}
        size={20}
        color={title === "INCOME" ? COLORS.income : COLORS.expense}
        className="bg-primary-200 rounded-md p-4"
      />
      <View className="flex-1">
        <Text className="text-xs font-normal text-text-secondary">{title}</Text>
        <Text className="text-lg font-bold text-text-primary">₹ {amount}</Text>
      </View>
    </View>
  );
}

export default IncomeExpenseCard;

import AppText from "@/components/AppText";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

function IncomeExpenseCard({
  title,
  amount,
  iconName,
}: {
  title: string;
  amount: string;
  iconName: string;
}) {
  const { colors } = useAppTheme();
  const isIncome = title === "INCOME";

  return (
    <View className="flex-1 flex-row items-center gap-4">
      <Ionicons
        name={iconName as any}
        size={20}
        color={isIncome ? colors.status.income : colors.status.expense}
        className="rounded-md p-4"
        style={{
          backgroundColor: isIncome
            ? colors.status.incomeSoft
            : colors.status.expenseSoft,
        }}
      />
      <View className="flex-1">
        <AppText tone="secondary" className="text-xs font-normal">
          {title}
        </AppText>
        <AppText className="text-lg font-bold">
          ₹ {amount}
        </AppText>
      </View>
    </View>
  );
}

export default IncomeExpenseCard;

import AppText from "@/components/AppText";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

const BudgetViewCard = () => {
  const { colors } = useAppTheme();

  return (
    <View
      className="flex p-4 mt-2 rounded-lg"
      style={{
        backgroundColor: colors.background.surface,
        borderColor: colors.border.default,
        borderWidth: 1,
      }}
    >
      <View className="flex-row items-center gap-2">
        <AppText className="font-semibold text-md">₹ 22000</AppText>
        <AppText tone="secondary" className="text-sm">
          spend of ₹ 40000
        </AppText>
      </View>
      <View
        className="relative h-5 w-full rounded-md mt-3"
        style={{ backgroundColor: colors.chart.track }}
      >
        <View
          className="absolute left-0 top-0 bottom-0 w-[84%] rounded-md"
          style={{ backgroundColor: colors.chart.progress }}
        ></View>
      </View>
      <View className="flex-row items-center gap-2 mt-3">
        <Ionicons
          name="checkmark-circle"
          size={20}
          color={true ? colors.status.success : colors.status.warning}
        />
        <AppText tone="success" className="text-sm font-semibold">
          YOU&apos;RE WITHIN BUDGET
        </AppText>
      </View>
    </View>
  );
};

export default BudgetViewCard;

import AppText from "@/components/AppText";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View } from "react-native";

const ActionLogButton = ({
  title,
  iconName,
}: {
  title: string;
  iconName: string;
}) => {
  const { colors } = useAppTheme();
  const isExpenseButton = title === "Add Expense";

  return (
    <TouchableOpacity
      className="flex-1 flex-col rounded-lg p-4 items-center gap-4"
      style={{
        backgroundColor: isExpenseButton
          ? colors.background.surface
          : colors.brand.primary,
        borderColor: colors.border.default,
        borderWidth: isExpenseButton ? 1 : 0,
      }}
    >
      <View
        className="rounded-full p-3"
        style={{
          backgroundColor: isExpenseButton
            ? colors.background.subtle
            : colors.brand.primarySoft,
        }}
      >
        <Ionicons
          name={iconName as any}
          size={20}
          color={isExpenseButton ? colors.icon.muted : colors.text.inverse}
        />
      </View>
      <AppText
        tone={isExpenseButton ? "primary" : "inverse"}
        className="font-semibold"
      >
        {title}
      </AppText>
    </TouchableOpacity>
  );
};

export default ActionLogButton;

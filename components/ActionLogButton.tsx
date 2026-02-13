import { COLORS } from "@/lib/constant";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, TouchableOpacity } from "react-native";

const ActionLogButton = ({
  title,
  iconName,
}: {
  title: string;
  iconName: string;
}) => {
  return (
    <TouchableOpacity
      className="flex-1 flex-col rounded-lg p-4 items-center gap-4 shadow-md"
      style={{
        backgroundColor:
          title === "Add Expense" ? COLORS.backgroundLight : COLORS.textPrimary,
      }}
    >
      <Pressable className="bg-white/20  rounded-full p-3">
        <Ionicons
          name="add"
          size={20}
          color={
            title === "Add Expense"
              ? COLORS.backgroundLight
              : COLORS.textPrimary
          }
        />
      </Pressable>
      <Text className="text-text-primary">{title}</Text>
    </TouchableOpacity>
  );
};

export default ActionLogButton;

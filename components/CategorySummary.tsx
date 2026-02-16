import AppText from "@/components/AppText";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, View } from "react-native";

const categories = [
  {
    key: "food",
    title: "Food",
    amount: "₹12,400",
    iconName: "restaurant",
  },
  {
    key: "rent",
    title: "Rent",
    amount: "₹22,000",
    iconName: "home",
  },
  {
    key: "transport",
    title: "Transport",
    amount: "₹4,600",
    iconName: "car-sport",
  },
] as const;

function CategorySummary({ onSeeAll }: { onSeeAll?: () => void }) {
  const { colors } = useAppTheme();

  return (
    <View className="mt-8">
      <View className="flex-row items-center justify-between">
        <AppText className="text-lg font-semibold">Category Summary</AppText>
        <Pressable className="active:opacity-70" onPress={onSeeAll}>
          <AppText tone="success" className="text-sm font-semibold">
            SEE ALL
          </AppText>
        </Pressable>
      </View>

      <View className="flex-row justify-between mt-4">
        {categories.map((category) => {
          const palette = colors.category[category.key];

          return (
            <View
              key={category.key}
              className="w-[31.5%] h-44 rounded-2xl p-3 items-center justify-center"
              style={{
                backgroundColor: colors.background.surface,
                borderColor: colors.border.default,
                borderWidth: 1,
              }}
            >
              <View
                className="h-14 w-14 rounded-full items-center justify-center"
                style={{ backgroundColor: palette.iconBackground }}
              >
                <Ionicons
                  name={category.iconName}
                  size={22}
                  color={palette.icon}
                />
              </View>
              <AppText
                tone="secondary"
                className="mt-4 text-base font-semibold"
              >
                {category.title}
              </AppText>
              <AppText
                className="mt-2 text-xl font-bold text-center"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {category.amount}
              </AppText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default CategorySummary;

import AppText from "@/components/AppText";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import type { ComponentProps, ReactNode } from "react";
import { ActivityIndicator, Pressable, TextInput, View } from "react-native";
import Animated, { Easing, LinearTransition } from "react-native-reanimated";
export function Header({
  title,
  action,
}: {
  title: string;
  action?: ReactNode;
}) {
  const router = useRouter();
  const { colors } = useAppTheme();
  return (
    <View className="h-16 flex-row items-center justify-between px-2">
      <Pressable
        accessibilityLabel="Go back"
        onPress={() => router.back()}
        className="h-11 w-11 items-center justify-center rounded-2xl"
        style={{ backgroundColor: colors.background.surface }}
      >
        <Ionicons name="chevron-back" size={25} color={colors.text.primary} />
      </Pressable>
      <AppText className="text-xl font-extrabold">{title}</AppText>
      <View className="h-11 w-11 items-center justify-center">{action}</View>
    </View>
  );
}
export function PrimaryButton({
  title,
  onPress,
  disabled,
  loading,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      disabled={disabled || loading}
      className="overflow-hidden rounded-2xl active:opacity-90"
      style={{
        opacity: disabled ? 0.45 : 1,
        shadowColor: colors.brand.primary,
        shadowOpacity: 0.24,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 5,
      }}
    >
      <LinearGradient
        colors={[colors.brand.primarySoft, colors.brand.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="h-16 items-center justify-center"
      >
        {loading ? (
          <ActivityIndicator color="#07152C" />
        ) : (
          <View className="flex-row items-center gap-2">
            <AppText className="text-lg font-extrabold">{title}</AppText>
            <Ionicons name="checkmark-circle" size={21} color="#0A2940" />
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}
export function MoneyInput({
  value,
  onChange,
  currency = "₹",
  inverse = false,
}: {
  value: string;
  onChange: (value: string) => void;
  currency?: string;
  inverse?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <View className="my-8 flex-row items-center justify-center gap-4">
      <AppText
        tone={inverse ? "inverse" : "muted"}
        className="text-5xl font-bold"
        style={inverse ? { color: "#AFC4CE" } : undefined}
      >
        {currency}
      </AppText>
      <TextInput
        accessibilityLabel="Amount"
        keyboardType="decimal-pad"
        value={value}
        onChangeText={(v) => onChange(v.replace(/[^0-9.]/g, ""))}
        placeholder="0.00"
        placeholderTextColor={inverse ? "#FFFFFF88" : colors.text.primary}
        style={{
          color: inverse ? "white" : colors.text.primary,
          fontSize: 64,
          fontWeight: "800",
          minWidth: 210,
        }}
      />
    </View>
  );
}
export function Choice({
  selected,
  label,
  onPress,
  icon,
}: {
  selected: boolean;
  label: string;
  onPress: () => void;
  icon?: ComponentProps<typeof Ionicons>["name"];
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      className="items-center gap-2"
    >
      <Animated.View
        layout={LinearTransition.duration(180).easing(Easing.out(Easing.cubic))}
        className="h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          backgroundColor: selected
            ? colors.brand.primary
            : colors.background.subtle,
          transform: [{ scale: selected ? 1.02 : 1 }],
          shadowColor: selected ? colors.brand.primary : "transparent",
          shadowOpacity: 0.2,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <Ionicons
          name={icon ?? "ellipse"}
          size={25}
          color={selected ? "#0A2940" : colors.icon.muted}
        />
      </Animated.View>
      <AppText
        tone={selected ? "primary" : "secondary"}
        className="max-w-20 text-center text-xs font-semibold"
        numberOfLines={1}
      >
        {label}
      </AppText>
    </Pressable>
  );
}
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const { colors, isDark } = useAppTheme();
  return (
    <View
      className={`rounded-3xl p-5 ${className}`}
      style={{
        backgroundColor: colors.background.surface,
        borderWidth: 1,
        borderColor: colors.border.soft,
        shadowColor: "#07152D",
        shadowOpacity: isDark ? 0.2 : 0.065,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 9 },
        elevation: 3,
      }}
    >
      {children}
    </View>
  );
}

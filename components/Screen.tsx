import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  keyboard?: boolean;
  className?: string;
};

export default function Screen({
  children,
  scroll = false,
  keyboard = false,
  className = "",
}: Props) {
  const insets = useSafeAreaInsets();
  const tabHeight = useBottomTabBarHeight();

  const Container = keyboard ? KeyboardAvoidingView : View;

  const containerProps = keyboard
    ? {
        behavior: Platform.OS === "ios" ? "padding" : undefined,
        style: { flex: 1 },
      }
    : { style: { flex: 1 } };

  return (
    <Container {...containerProps}>
      {scroll ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: insets.top,
            paddingBottom: tabHeight + 16, // ⭐ magic line
            flexGrow: 1,
          }}
          className={`bg-neutral-50 dark:bg-neutral-900 ${className}`}
        >
          {children}
        </ScrollView>
      ) : (
        <View
          style={{
            flex: 1,
            paddingTop: insets.top,
            paddingBottom: tabHeight, // ⭐ prevents trimming
          }}
          className={`bg-neutral-50 dark:bg-neutral-900 ${className}`}
        >
          {children}
        </View>
      )}
    </Container>
  );
}

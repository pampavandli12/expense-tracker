import { useTabBarMetrics } from "@/lib/navigation/tabBar";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import Ionicons from "@expo/vector-icons/Ionicons";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import { useNavigationState } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from "expo-glass-effect";
import { Tabs } from "expo-router";
import { useEffect } from "react";
import { Platform, StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export default function RootLayout() {
  const { colors, isDark } = useAppTheme();
  const metrics = useTabBarMetrics();
  const isIOS = Platform.OS === "ios";
  const useLiquidGlass = canUseLiquidGlass();
  const { width: windowWidth } = useWindowDimensions();
  const tabBarWidth = windowWidth - metrics.leftOffset - metrics.rightOffset;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: !isIOS,
        tabBarActiveTintColor: colors.brand.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: isIOS
          ? {
              position: "absolute",
              start: metrics.leftOffset,
              end: metrics.rightOffset,
              bottom: metrics.bottomOffset,
              height: metrics.barHeight,
              paddingTop: 8,
              paddingBottom: 8,
              borderTopWidth: 0,
              borderRadius: metrics.barHeight / 2,
              backgroundColor: "transparent",
              shadowColor: isDark ? "#000000" : colors.text.primary,
              shadowOpacity: isDark ? 0.16 : 0.08,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 8 },
              elevation: 0,
            }
          : {
              backgroundColor: colors.background.surface,
              borderTopColor: colors.border.default,
              height: 76,
              paddingTop: 8,
              paddingBottom: 10,
            },
        tabBarBackground: isIOS
          ? () => (
              <IOSLiquidGlassTabBackground
                isDark={isDark}
                barWidth={tabBarWidth}
                brandColor={colors.brand.primary}
                radius={metrics.barHeight / 2}
                surfaceColor={colors.background.surface}
                useLiquidGlass={useLiquidGlass}
              />
            )
          : undefined,
        tabBarButton: isIOS ? IOSLiquidGlassTabButton : undefined,
        tabBarLabelStyle: { fontFamily: "manrope" },
        tabBarIconStyle: isIOS ? { margin: 0 } : undefined,
        sceneStyle: {
          backgroundColor: colors.background.base,
        },
        tabBarItemStyle: isIOS
          ? {
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 0,
            }
          : { paddingVertical: isDark ? 2 : 0 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon(props) {
            return <Ionicons name="home" size={24} color={props.color} />;
          },
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          tabBarIcon(props) {
            return (
              <Ionicons name="stats-chart" size={24} color={props.color} />
            );
          },
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: "Accounts",
          tabBarIcon(props) {
            return <Ionicons name="wallet" size={24} color={props.color} />;
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon(props) {
            return <Ionicons name="settings" size={24} color={props.color} />;
          },
        }}
      />
    </Tabs>
  );
}

function IOSLiquidGlassTabButton(props: BottomTabBarButtonProps) {
  const { children, style, ...pressableProps } = props;
  const selected = props["aria-selected"] === true;
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(selected ? 1 : 0, {
      duration: reducedMotion ? 0 : 210,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, reducedMotion, selected]);

  const contentStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(progress.value, [0, 1], [1, 1.025]),
      },
    ],
  }));

  return (
    <PlatformPressable {...pressableProps} style={[style, styles.iosTabButton]}>
      <Animated.View
        pointerEvents="none"
        style={[styles.iosTabContent, contentStyle]}
      >
        {children}
      </Animated.View>
    </PlatformPressable>
  );
}

function IOSLiquidGlassTabBackground({
  barWidth,
  brandColor,
  isDark,
  radius,
  surfaceColor,
  useLiquidGlass,
}: {
  barWidth: number;
  brandColor: string;
  isDark: boolean;
  radius: number;
  surfaceColor: string;
  useLiquidGlass: boolean;
}) {
  const activeIndex = useNavigationState((state) => state.index);
  const tabCount = useNavigationState((state) => state.routes.length);
  const reducedMotion = useReducedMotion();
  const indexProgress = useSharedValue(activeIndex);
  const itemWidth = barWidth / Math.max(tabCount, 1);
  const selectionSize = Math.min(48, Math.max(itemWidth - 16, 40));
  const selectionOffset = (itemWidth - selectionSize) / 2;
  const selectionTop = (radius * 2 - selectionSize) / 2;

  useEffect(() => {
    indexProgress.value = withTiming(activeIndex, {
      duration: reducedMotion ? 0 : 240,
      easing: Easing.out(Easing.cubic),
    });
  }, [activeIndex, indexProgress, reducedMotion]);

  const selectionStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: selectionOffset + indexProgress.value * itemWidth },
    ],
  }));

  return (
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          borderRadius: radius,
          overflow: "hidden",
        },
      ]}
    >
      {useLiquidGlass ? (
        <GlassView
          colorScheme={isDark ? "dark" : "light"}
          glassEffectStyle="regular"
          isInteractive={false}
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
        />
      ) : (
        <>
          <BlurView
            tint={isDark ? "dark" : "light"}
            intensity={isDark ? 58 : 72}
            style={StyleSheet.absoluteFill}
          />
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: `${surfaceColor}${isDark ? "52" : "40"}` },
            ]}
          />
        </>
      )}
      <Animated.View
        style={[
          styles.iosSelectionCapsule,
          {
            top: selectionTop,
            width: selectionSize,
            height: selectionSize,
            borderRadius: selectionSize / 2,
          },
          selectionStyle,
        ]}
      >
        {useLiquidGlass ? (
          <GlassView
            colorScheme={isDark ? "dark" : "light"}
            glassEffectStyle="clear"
            isInteractive={false}
            tintColor={`${brandColor}26`}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: isDark ? `${brandColor}24` : `${brandColor}1F`,
              },
            ]}
          />
        )}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: selectionSize / 2,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: isDark ? `${brandColor}66` : `${brandColor}5C`,
            },
          ]}
        />
      </Animated.View>
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius: radius,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: isDark ? "#FFFFFF26" : "#FFFFFFC4",
          },
        ]}
      />
    </View>
  );
}

function canUseLiquidGlass() {
  if (Platform.OS !== "ios") return false;

  try {
    return isGlassEffectAPIAvailable() && isLiquidGlassAvailable();
  } catch {
    // An existing development build may not contain the newly installed native
    // module yet. Keep it usable until the next native rebuild.
    return false;
  }
}

const styles = StyleSheet.create({
  iosTabButton: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
    padding: 0,
  },
  iosTabContent: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  iosSelectionCapsule: {
    position: "absolute",
    left: 0,
    overflow: "hidden",
    borderCurve: "continuous",
    borderWidth: StyleSheet.hairlineWidth,
  },
});

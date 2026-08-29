import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

type ContentRevealProps = {
  children: ReactNode;
  delay?: number;
  distance?: number;
  duration?: number;
  ready?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

type DataFadeProps = {
  children: ReactNode;
  duration?: number;
  ready: boolean;
  revision: number;
  style?: StyleProp<ViewStyle>;
};

export function ContentReveal({
  children,
  delay = 0,
  distance = 10,
  duration = 220,
  ready = true,
  style,
  testID,
}: ContentRevealProps) {
  const reducedMotion = useReducedMotion();
  const progress = useSharedValue(ready && reducedMotion ? 1 : 0);

  useEffect(() => {
    if (!ready || progress.value >= 1) return;

    progress.value = reducedMotion
      ? 1
      : withDelay(
          delay,
          withTiming(1, {
            duration,
            easing: Easing.out(Easing.cubic),
          }),
        );
  }, [delay, duration, progress, ready, reducedMotion]);

  useEffect(
    () => () => {
      cancelAnimation(progress);
    },
    [progress],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      {
        translateY: reducedMotion
          ? 0
          : interpolate(progress.value, [0, 1], [distance, 0]),
      },
    ],
  }));

  return (
    <Animated.View testID={testID} style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
}

export function DataFade({
  children,
  duration = 180,
  ready,
  revision,
  style,
}: DataFadeProps) {
  const reducedMotion = useReducedMotion();
  const hasShownData = useRef(ready);
  const previousRevision = useRef(revision);
  const opacity = useSharedValue(ready ? 1 : 0);

  useLayoutEffect(() => {
    if (!ready) return;

    if (!hasShownData.current) {
      hasShownData.current = true;
      previousRevision.current = revision;
      opacity.value = 1;
      return;
    }

    if (previousRevision.current === revision) return;
    previousRevision.current = revision;

    if (reducedMotion) {
      opacity.value = 1;
      return;
    }

    opacity.value = 0.45;
    opacity.value = withTiming(1, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [duration, opacity, ready, reducedMotion, revision]);

  useEffect(
    () => () => {
      cancelAnimation(opacity);
    },
    [opacity],
  );

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
}

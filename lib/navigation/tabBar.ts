import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const IOS_BAR_HEIGHT = 68;
const IOS_HORIZONTAL_MARGIN = 16;
const IOS_BOTTOM_GAP = 8;
const CONTENT_TO_BAR_GAP = 24;

export function getTabBarMetrics(
  platform: typeof Platform.OS,
  insets: { top: number; right: number; bottom: number; left: number },
) {
  const isFloating = platform === "ios";
  const bottomOffset = isFloating ? insets.bottom + IOS_BOTTOM_GAP : 0;

  return {
    isFloating,
    barHeight: isFloating ? IOS_BAR_HEIGHT : 76,
    leftOffset: isFloating ? insets.left + IOS_HORIZONTAL_MARGIN : 0,
    rightOffset: isFloating ? insets.right + IOS_HORIZONTAL_MARGIN : 0,
    bottomOffset,
    contentBottomPadding: isFloating
      ? bottomOffset + IOS_BAR_HEIGHT + CONTENT_TO_BAR_GAP
      : 36,
  };
}

export function useTabBarMetrics() {
  const insets = useSafeAreaInsets();
  return getTabBarMetrics(Platform.OS, insets);
}

import { useColorScheme } from "react-native";
import { darkColors, lightColors, type AppColors } from "./colors";

export function useAppTheme(): { isDark: boolean; colors: AppColors } {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return {
    isDark,
    colors: isDark ? darkColors : lightColors,
  };
}

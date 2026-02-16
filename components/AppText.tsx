import React from "react";
import { Text, type TextProps } from "react-native";
import { useAppTheme } from "@/lib/theme/useAppTheme";

type AppTextProps = TextProps & {
  className?: string;
  tone?:
    | "primary"
    | "secondary"
    | "muted"
    | "inverse"
    | "success"
    | "danger";
};

function AppText({ className, style, tone = "primary", ...props }: AppTextProps) {
  const { colors } = useAppTheme();
  const mergedClassName = className
    ? `font-system ${className}`
    : "font-system";
  const toneColor = {
    primary: colors.text.primary,
    secondary: colors.text.secondary,
    muted: colors.text.muted,
    inverse: colors.text.inverse,
    success: colors.status.success,
    danger: colors.status.warning,
  }[tone];

  return (
    <Text {...props} className={mergedClassName} style={[{ color: toneColor }, style]} />
  );
}

export default AppText;

import Storage from "expo-sqlite/kv-store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import { darkColors, lightColors, type AppColors } from "./colors";

export type ThemePreference = "system" | "light" | "dark";

type PreferencesContextValue = {
  themePreference: ThemePreference;
  setThemePreference: (value: ThemePreference) => Promise<void>;
  baseCurrency: string;
  setBaseCurrency: (value: string) => Promise<void>;
};

const PreferencesContext = createContext<PreferencesContextValue | undefined>(
  undefined,
);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>("system");
  const [baseCurrency, setBaseCurrencyState] = useState("INR");

  useEffect(() => {
    Promise.all([
      Storage.getItem("themePreference"),
      Storage.getItem("baseCurrency"),
    ]).then(([storedTheme, storedCurrency]) => {
      if (
        storedTheme === "system" ||
        storedTheme === "light" ||
        storedTheme === "dark"
      ) {
        setThemePreferenceState(storedTheme);
      }
      if (storedCurrency && /^[A-Z]{3}$/.test(storedCurrency)) {
        setBaseCurrencyState(storedCurrency);
      }
    });
  }, []);

  const setThemePreference = useCallback(async (value: ThemePreference) => {
    setThemePreferenceState(value);
    await Storage.setItem("themePreference", value);
  }, []);

  const setBaseCurrency = useCallback(async (value: string) => {
    const normalized = value.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(normalized)) {
      throw new Error("Currency must be a three-letter ISO code.");
    }
    setBaseCurrencyState(normalized);
    await Storage.setItem("baseCurrency", normalized);
  }, []);

  const value = useMemo(
    () => ({
      themePreference,
      setThemePreference,
      baseCurrency,
      setBaseCurrency,
    }),
    [baseCurrency, setBaseCurrency, setThemePreference, themePreference],
  );

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function useAppPreferences() {
  const value = useContext(PreferencesContext);
  if (!value) {
    throw new Error("useAppPreferences must be used inside AppThemeProvider.");
  }
  return value;
}

export function useAppTheme(): { isDark: boolean; colors: AppColors } {
  const systemColorScheme = useColorScheme();
  const { themePreference } = useAppPreferences();
  const isDark =
    themePreference === "system"
      ? systemColorScheme === "dark"
      : themePreference === "dark";

  return {
    isDark,
    colors: isDark ? darkColors : lightColors,
  };
}

import AppText from "@/components/AppText";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import {
  authenticateForAppLock,
  getBiometricCapability,
  persistAppLockEnabled,
  readAppLockEnabled,
  type AppAuthenticationResult,
  type BiometricCapability,
} from "@/services/biometrics";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ActivityIndicator,
  AppState,
  Linking,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type AppLockActionResult = AppAuthenticationResult;

type AppLockContextValue = {
  enabled: boolean;
  methodLabel: string;
  enableAppLock: () => Promise<AppLockActionResult>;
  disableAppLock: () => Promise<AppLockActionResult>;
};

const AppLockContext = createContext<AppLockContextValue | undefined>(
  undefined,
);

const unknownCapability: BiometricCapability = {
  hasHardware: false,
  isEnrolled: false,
  types: [],
  label: "device authentication",
};

const unavailableResult = (
  capability: BiometricCapability,
): AppLockActionResult => {
  if (!capability.hasHardware) {
    return {
      success: false,
      error: "not_available",
      message: "Biometric authentication is unavailable on this device.",
    };
  }
  return {
    success: false,
    error: "not_enrolled",
    message: "Set up biometrics in your device settings, then try again.",
  };
};

export function AppLockProvider({ children }: { children: ReactNode }) {
  const { colors } = useAppTheme();
  const [preferenceReady, setPreferenceReady] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [locked, setLocked] = useState(true);
  const [authenticating, setAuthenticating] = useState(false);
  const [message, setMessage] = useState<string>();
  const [capability, setCapability] =
    useState<BiometricCapability>(unknownCapability);
  const enabledRef = useRef(false);
  const authenticationInProgress = useRef(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const refreshCapability = useCallback(async () => {
    const current = await getBiometricCapability();
    setCapability(current);
    return current;
  }, []);

  const authenticate = useCallback(async (): Promise<AppLockActionResult> => {
    if (authenticationInProgress.current) {
      return {
        success: false,
        error: "app_cancel",
        message: "Authentication is already in progress.",
      };
    }

    authenticationInProgress.current = true;
    setAuthenticating(true);
    try {
      return await authenticateForAppLock();
    } finally {
      authenticationInProgress.current = false;
      setAuthenticating(false);
    }
  }, []);

  const unlock = useCallback(async () => {
    setMessage(undefined);
    await refreshCapability().catch(() => undefined);
    const result = await authenticate();
    if (result.success) {
      setLocked(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }
    setMessage(result.message);
  }, [authenticate, refreshCapability]);

  useEffect(() => {
    let active = true;
    readAppLockEnabled()
      .then(async (storedEnabled) => {
        const currentCapability = await getBiometricCapability().catch(
          () => unknownCapability,
        );
        if (!active) return;
        enabledRef.current = storedEnabled;
        setEnabled(storedEnabled);
        setCapability(currentCapability);
        setLocked(storedEnabled);
        setPreferenceReady(true);
        if (storedEnabled && AppState.currentState === "active") {
          void unlock();
        }
      })
      .catch(() => {
        if (!active) return;
        // Fail closed if the security preference cannot be read.
        setMessage("App lock could not be prepared. Restart the app to retry.");
        setPreferenceReady(true);
        setEnabled(true);
        enabledRef.current = true;
        setLocked(true);
      });

    return () => {
      active = false;
    };
  }, [unlock]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const previousState = appState.current;
      appState.current = nextState;
      if (!enabledRef.current || authenticationInProgress.current) return;

      if (nextState === "inactive" || nextState === "background") {
        setLocked(true);
        setMessage(undefined);
        return;
      }

      if (nextState === "active" && previousState !== "active") {
        setLocked(true);
        void unlock();
      }
    });
    return () => subscription.remove();
  }, [unlock]);

  const enableAppLock = useCallback(async (): Promise<AppLockActionResult> => {
    let currentCapability: BiometricCapability;
    try {
      currentCapability = await refreshCapability();
    } catch {
      return {
        success: false,
        error: "not_available",
        message: "Biometric authentication could not be checked.",
      };
    }
    if (!currentCapability.hasHardware || !currentCapability.isEnrolled) {
      return unavailableResult(currentCapability);
    }

    const result = await authenticate();
    if (!result.success) return result;
    try {
      await persistAppLockEnabled(true);
      enabledRef.current = true;
      setEnabled(true);
      setLocked(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return { success: true };
    } catch {
      return {
        success: false,
        error: "unknown",
        message: "The app lock setting could not be saved.",
      };
    }
  }, [authenticate, refreshCapability]);

  const disableAppLock = useCallback(async (): Promise<AppLockActionResult> => {
    const result = await authenticate();
    if (!result.success) return result;
    try {
      await persistAppLockEnabled(false);
      enabledRef.current = false;
      setEnabled(false);
      setLocked(false);
      setMessage(undefined);
      return { success: true };
    } catch {
      return {
        success: false,
        error: "unknown",
        message: "The app lock setting could not be saved.",
      };
    }
  }, [authenticate]);

  const value = useMemo(
    () => ({
      enabled,
      methodLabel: capability.label,
      enableAppLock,
      disableAppLock,
    }),
    [capability.label, disableAppLock, enableAppLock, enabled],
  );

  const lockVisible = !preferenceReady || (enabled && locked);
  return (
    <AppLockContext.Provider value={value}>
      <View className="flex-1">
        <View
          className="flex-1"
          pointerEvents={lockVisible ? "none" : "auto"}
          accessibilityElementsHidden={lockVisible}
          importantForAccessibility={
            lockVisible ? "no-hide-descendants" : "auto"
          }
        >
          {preferenceReady ? children : null}
        </View>

        {lockVisible && (
          <SafeAreaView
            className="flex-1"
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: colors.background.base,
                zIndex: 1000,
                elevation: 1000,
              },
            ]}
          >
            <View className="flex-1 items-center justify-center px-8">
              <View
                className="h-24 w-24 items-center justify-center rounded-[32px]"
                style={{
                  backgroundColor: colors.brand.primarySoft,
                  shadowColor: colors.brand.primary,
                  shadowOpacity: 0.22,
                  shadowRadius: 24,
                  shadowOffset: { width: 0, height: 12 },
                  elevation: 8,
                }}
              >
                <Ionicons name="lock-closed" size={42} color="#0A2940" />
              </View>
              <AppText className="mt-8 text-center text-3xl font-extrabold">
                {preferenceReady
                  ? "Expense Tracker is locked"
                  : "Securing your data"}
              </AppText>
              <AppText tone="secondary" className="mt-3 text-center leading-6">
                {preferenceReady
                  ? "Authenticate to view the financial records stored on this device."
                  : "Checking your privacy settings…"}
              </AppText>

              {message && (
                <View
                  className="mt-6 w-full rounded-2xl px-4 py-3"
                  style={{ backgroundColor: colors.status.expenseSoft }}
                >
                  <AppText className="text-center text-sm" tone="danger">
                    {message}
                  </AppText>
                </View>
              )}

              {preferenceReady && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Unlock with ${capability.label}`}
                  disabled={authenticating}
                  onPress={() => void unlock()}
                  className="mt-7 h-16 w-full flex-row items-center justify-center rounded-2xl active:opacity-90"
                  style={{
                    backgroundColor: colors.brand.primary,
                    opacity: authenticating ? 0.7 : 1,
                  }}
                >
                  {authenticating ? (
                    <ActivityIndicator color="#0A2940" />
                  ) : (
                    <>
                      <Ionicons
                        name="finger-print"
                        size={23}
                        color="#0A2940"
                      />
                      <AppText className="ml-2 font-extrabold">
                        Unlock with {capability.label}
                      </AppText>
                    </>
                  )}
                </Pressable>
              )}

              {preferenceReady &&
                (!capability.hasHardware || !capability.isEnrolled) && (
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => Linking.openSettings()}
                    className="mt-5 min-h-11 justify-center px-4"
                  >
                    <AppText tone="success" className="font-bold">
                      Open device settings
                    </AppText>
                  </Pressable>
                )}
            </View>
          </SafeAreaView>
        )}
      </View>
    </AppLockContext.Provider>
  );
}

export function useAppLock() {
  const value = useContext(AppLockContext);
  if (!value) {
    throw new Error("useAppLock must be used inside AppLockProvider.");
  }
  return value;
}

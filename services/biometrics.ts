import * as LocalAuthentication from "expo-local-authentication";
import Storage from "expo-sqlite/kv-store";
import { Platform } from "react-native";

const APP_LOCK_STORAGE_KEY = "appLockEnabled";

export type BiometricCapability = {
  hasHardware: boolean;
  isEnrolled: boolean;
  types: LocalAuthentication.AuthenticationType[];
  label: string;
};

export type AppAuthenticationResult =
  | { success: true }
  | {
      success: false;
      error: LocalAuthentication.LocalAuthenticationError;
      message: string;
    };

export function biometricMethodLabel(
  types: LocalAuthentication.AuthenticationType[],
  platform: typeof Platform.OS = Platform.OS,
) {
  const supportsFace = types.includes(
    LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
  );
  const supportsFingerprint = types.includes(
    LocalAuthentication.AuthenticationType.FINGERPRINT,
  );

  if (supportsFace && supportsFingerprint) return "biometrics";
  if (supportsFace) return platform === "ios" ? "Face ID" : "face unlock";
  if (supportsFingerprint)
    return platform === "ios" ? "Touch ID" : "fingerprint";
  return "device authentication";
}

export async function getBiometricCapability(): Promise<BiometricCapability> {
  const [hasHardware, isEnrolled, types] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
    LocalAuthentication.supportedAuthenticationTypesAsync(),
  ]);

  return {
    hasHardware,
    isEnrolled,
    types,
    label: biometricMethodLabel(types),
  };
}

function authenticationErrorMessage(
  error: LocalAuthentication.LocalAuthenticationError,
) {
  switch (error) {
    case "not_enrolled":
      return "Set up biometrics in your device settings, then try again.";
    case "not_available":
      return "Biometric authentication is unavailable on this device.";
    case "passcode_not_set":
      return "Set a device passcode before enabling app lock.";
    case "lockout":
      return "Biometrics are temporarily locked. Use your device passcode or try again later.";
    case "user_cancel":
    case "app_cancel":
    case "system_cancel":
      return "Authentication was cancelled.";
    case "timeout":
      return "Authentication timed out. Try again.";
    default:
      return "Authentication did not succeed. Try again.";
  }
}

export async function authenticateForAppLock(): Promise<AppAuthenticationResult> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Unlock Expense Tracker",
    promptSubtitle: "Your financial records are private",
    promptDescription: "Confirm it’s you to continue.",
    cancelLabel: "Cancel",
    fallbackLabel: "Use device passcode",
    disableDeviceFallback: false,
    requireConfirmation: false,
    biometricsSecurityLevel: "weak",
  });

  if (result.success) return { success: true };
  return {
    success: false,
    error: result.error,
    message: authenticationErrorMessage(result.error),
  };
}

export async function readAppLockEnabled() {
  return (await Storage.getItem(APP_LOCK_STORAGE_KEY)) === "true";
}

export async function persistAppLockEnabled(enabled: boolean) {
  await Storage.setItem(APP_LOCK_STORAGE_KEY, String(enabled));
}

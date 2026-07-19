import * as LocalAuthentication from "expo-local-authentication";
import Storage from "expo-sqlite/kv-store";
import {
  authenticateForAppLock,
  biometricMethodLabel,
  getBiometricCapability,
  persistAppLockEnabled,
  readAppLockEnabled,
} from "./biometrics";

jest.mock("expo-local-authentication", () => ({
  AuthenticationType: {
    FINGERPRINT: 1,
    FACIAL_RECOGNITION: 2,
    IRIS: 3,
  },
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn(),
  authenticateAsync: jest.fn(),
}));

jest.mock("expo-sqlite/kv-store", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

const hasHardwareAsyncMock = jest.mocked(
  LocalAuthentication.hasHardwareAsync,
);
const isEnrolledAsyncMock = jest.mocked(LocalAuthentication.isEnrolledAsync);
const supportedTypesAsyncMock = jest.mocked(
  LocalAuthentication.supportedAuthenticationTypesAsync,
);
const authenticateAsyncMock = jest.mocked(
  LocalAuthentication.authenticateAsync,
);
const storageMock = jest.mocked(Storage);

describe("biometric app lock service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("uses platform-appropriate biometric labels", () => {
    expect(
      biometricMethodLabel(
        [LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION],
        "ios",
      ),
    ).toBe("Face ID");
    expect(
      biometricMethodLabel(
        [LocalAuthentication.AuthenticationType.FINGERPRINT],
        "android",
      ),
    ).toBe("fingerprint");
  });

  it("reports hardware and enrollment capability", async () => {
    hasHardwareAsyncMock.mockResolvedValue(true);
    isEnrolledAsyncMock.mockResolvedValue(true);
    supportedTypesAsyncMock.mockResolvedValue([
      LocalAuthentication.AuthenticationType.FINGERPRINT,
    ]);

    await expect(getBiometricCapability()).resolves.toMatchObject({
      hasHardware: true,
      isEnrolled: true,
      types: [LocalAuthentication.AuthenticationType.FINGERPRINT],
    });
  });

  it("uses recoverable system authentication options", async () => {
    authenticateAsyncMock.mockResolvedValue({ success: true });

    await expect(authenticateForAppLock()).resolves.toEqual({ success: true });
    expect(authenticateAsyncMock).toHaveBeenCalledWith(
      expect.objectContaining({
        disableDeviceFallback: false,
        fallbackLabel: "Use device passcode",
        promptMessage: "Unlock Expense Tracker",
      }),
    );
  });

  it("persists only an explicit boolean setting", async () => {
    storageMock.getItem.mockResolvedValue("true");
    storageMock.setItem.mockResolvedValue(undefined);

    await expect(readAppLockEnabled()).resolves.toBe(true);
    await persistAppLockEnabled(false);
    expect(storageMock.setItem).toHaveBeenCalledWith("appLockEnabled", "false");
  });
});

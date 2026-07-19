import AppText from "@/components/AppText";
import {
  authenticateForAppLock,
  getBiometricCapability,
  readAppLockEnabled,
} from "@/services/biometrics";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { AppLockProvider } from "./AppLockProvider";

jest.mock("@/services/biometrics", () => ({
  authenticateForAppLock: jest.fn(),
  getBiometricCapability: jest.fn(),
  persistAppLockEnabled: jest.fn().mockResolvedValue(undefined),
  readAppLockEnabled: jest.fn(),
}));

jest.mock("@/lib/theme/useAppTheme", () => {
  const { lightColors } = jest.requireActual("@/lib/theme/colors");
  return {
    useAppTheme: () => ({ colors: lightColors, isDark: false }),
  };
});

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

jest.mock("expo-haptics", () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: "success" },
}));

const readAppLockEnabledMock = jest.mocked(readAppLockEnabled);
const getBiometricCapabilityMock = jest.mocked(getBiometricCapability);
const authenticateForAppLockMock = jest.mocked(authenticateForAppLock);
const capability = {
  hasHardware: true,
  isEnrolled: true,
  types: [],
  label: "fingerprint",
};

describe("AppLockProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getBiometricCapabilityMock.mockResolvedValue(capability);
  });

  it("does not authenticate when app lock is disabled", async () => {
    readAppLockEnabledMock.mockResolvedValue(false);
    const screen = render(
      <AppLockProvider>
        <AppText>Private ledger</AppText>
      </AppLockProvider>,
    );

    await waitFor(() => expect(screen.getByText("Private ledger")).toBeTruthy());
    expect(authenticateForAppLockMock).not.toHaveBeenCalled();
  });

  it("keeps app content inaccessible after cancellation and reveals it after retry", async () => {
    readAppLockEnabledMock.mockResolvedValue(true);
    authenticateForAppLockMock.mockResolvedValueOnce({
      success: false,
      error: "user_cancel",
      message: "Authentication was cancelled.",
    });
    const screen = render(
      <AppLockProvider>
        <AppText>Private ledger</AppText>
      </AppLockProvider>,
    );

    await waitFor(() =>
      expect(screen.getByText("Expense Tracker is locked")).toBeTruthy(),
    );
    fireEvent.press(
      screen.getByRole("button", { name: "Unlock with fingerprint" }),
    );
    await waitFor(() =>
      expect(screen.getByText("Authentication was cancelled.")).toBeTruthy(),
    );
    expect(screen.queryByText("Private ledger")).toBeNull();
    expect(
      screen.getByText("Private ledger", { includeHiddenElements: true }),
    ).toBeTruthy();

    authenticateForAppLockMock.mockResolvedValueOnce({ success: true });
    fireEvent.press(screen.getByRole("button", { name: "Unlock with fingerprint" }));

    await waitFor(() => expect(screen.getByText("Private ledger")).toBeTruthy());
    expect(screen.queryByText("Expense Tracker is locked")).toBeNull();
  });
});

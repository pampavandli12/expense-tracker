import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";

import Paywall from "@/app/paywall";
import { getPackages } from "@/services/purchases";

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockBack = jest.fn();
const mockPurchase = jest.fn();
const mockRestore = jest.fn();
const mockRefresh = jest.fn();
const mockConsumePaywallIntent = jest.fn();

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({}),
  useRouter: () => ({
    back: mockBack,
    canGoBack: () => true,
    replace: mockReplace,
    push: mockPush,
  }),
}));

jest.mock("@/lib/subscription/SubscriptionProvider", () => ({
  useSubscription: () => ({
    purchase: mockPurchase,
    restore: mockRestore,
    refresh: mockRefresh,
    consumePaywallIntent: mockConsumePaywallIntent,
  }),
}));

jest.mock("@/services/purchases", () => ({
  ENTITLEMENT_ID: "premium",
  getPackages: jest.fn(),
  getCustomerInfo: jest.fn().mockResolvedValue({
    entitlements: { active: {} },
  }),
  describeEntitlementMismatch: jest
    .fn()
    .mockReturnValue('RevenueCat returned no active entitlements. The app expects "premium".'),
}));

jest.mock("@/lib/theme/useAppTheme", () => {
  const { lightColors } = jest.requireActual("@/lib/theme/colors");
  return {
    useAppTheme: () => ({ colors: lightColors, isDark: false }),
  };
});

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light" },
  NotificationFeedbackType: { Success: "success" },
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

const getPackagesMock = jest.mocked(getPackages);

describe("paywall states", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("opens bundled legal content when production URLs are not configured", async () => {
    getPackagesMock.mockResolvedValue([]);
    const screen = render(<Paywall />);
    await waitFor(() => expect(screen.getByText("Terms")).toBeTruthy());

    fireEvent.press(screen.getByText("Terms"));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/legal",
      params: { document: "terms" },
    });
  });

  it("shows a retryable state when offerings are unavailable", async () => {
    getPackagesMock.mockResolvedValue([]);
    const screen = render(<Paywall />);
    await act(async () => undefined);
    await waitFor(() =>
      expect(
        screen.getByText(
          "Subscriptions are not configured for this build yet.",
        ),
      ).toBeTruthy(),
    );
    getPackagesMock.mockResolvedValue([]);
    await act(async () => fireEvent.press(screen.getByText("Retry")));
    await waitFor(() => expect(getPackagesMock).toHaveBeenCalledTimes(2));
  });

  it("explains every premium capability", async () => {
    getPackagesMock.mockResolvedValue([]);
    const screen = render(<Paywall />);
    await waitFor(() =>
      expect(
        screen.getByText(
          "Subscriptions are not configured for this build yet.",
        ),
      ).toBeTruthy(),
    );

    for (const feature of [
      "Unlimited accounts",
      "Custom categories",
      "Advanced insights",
      "Smart budgets",
      "Private alerts",
      "Cross-currency transfers",
    ]) {
      expect(screen.getByText(feature)).toBeTruthy();
    }
  });

  it("selects annual by default and handles purchase cancellation quietly", async () => {
    const annual = {
      identifier: "$rc_annual",
      packageType: "ANNUAL",
      product: {
        title: "Annual",
        priceString: "₹999",
        subscriptionPeriod: "P1Y",
      },
    } as never;
    getPackagesMock.mockResolvedValue([annual]);
    mockPurchase.mockRejectedValue({ userCancelled: true });
    mockRestore.mockResolvedValue(false);
    const alert = jest
      .spyOn(Alert, "alert")
      .mockImplementation(() => undefined);
    const screen = render(<Paywall />);
    await act(async () => undefined);
    await waitFor(() => expect(screen.getByText("Annual")).toBeTruthy());
    await act(async () =>
      fireEvent.press(screen.getByRole("button", { name: "Start with ₹999" })),
    );
    await waitFor(() =>
      expect(mockPurchase).toHaveBeenCalledWith(annual),
    );
    expect(alert).not.toHaveBeenCalledWith(
      "Purchase not completed",
      expect.anything(),
    );
    alert.mockRestore();
  });

  it("shows success and sends the user home after a successful purchase", async () => {
    const annual = {
      identifier: "$rc_annual",
      packageType: "ANNUAL",
      product: {
        title: "Annual",
        priceString: "₹999",
        subscriptionPeriod: "P1Y",
      },
    } as never;
    getPackagesMock.mockResolvedValue([annual]);
    mockPurchase.mockResolvedValue(true);
    mockRefresh.mockResolvedValue(true);
    const alert = jest
      .spyOn(Alert, "alert")
      .mockImplementation(() => undefined);
    const screen = render(<Paywall />);
    await act(async () => undefined);
    await waitFor(() => expect(screen.getByText("Annual")).toBeTruthy());
    await act(async () =>
      fireEvent.press(screen.getByRole("button", { name: "Start with ₹999" })),
    );
    await waitFor(() => expect(mockPurchase).toHaveBeenCalledWith(annual));
    await waitFor(() => expect(mockRefresh).toHaveBeenCalled());
    expect(alert).toHaveBeenCalledWith(
      "Welcome to Premium",
      "Your subscription is active. Every Premium feature is now unlocked.",
      [{ text: "Continue", onPress: expect.any(Function) }],
    );
    const continueAction = alert.mock.calls[0]?.[2]?.[0]?.onPress;
    continueAction?.();
    expect(mockConsumePaywallIntent).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/(tabs)");
    alert.mockRestore();
  });

  it("shows a failure message when premium is not activated", async () => {
    const annual = {
      identifier: "$rc_annual",
      packageType: "ANNUAL",
      product: {
        title: "Annual",
        priceString: "₹999",
        subscriptionPeriod: "P1Y",
      },
    } as never;
    getPackagesMock.mockResolvedValue([annual]);
    mockPurchase.mockResolvedValue(false);
    mockRefresh.mockResolvedValue(false);
    const alert = jest
      .spyOn(Alert, "alert")
      .mockImplementation(() => undefined);
    const screen = render(<Paywall />);
    await act(async () => undefined);
    await waitFor(() => expect(screen.getByText("Annual")).toBeTruthy());
    await act(async () =>
      fireEvent.press(screen.getByRole("button", { name: "Start with ₹999" })),
    );
    await waitFor(() =>
      expect(alert).toHaveBeenCalledWith(
        "Purchase not completed",
        expect.stringContaining("premium"),
      ),
    );
    expect(mockReplace).not.toHaveBeenCalled();
    alert.mockRestore();
  });
});

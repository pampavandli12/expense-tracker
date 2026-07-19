import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";

import Paywall from "@/app/paywall";
import {
  getPackages,
  purchasePackage,
  restorePurchases,
} from "@/services/purchases";

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock("@/db/repository", () => ({
  setPreference: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@/services/purchases", () => ({
  getPackages: jest.fn(),
  purchasePackage: jest.fn(),
  restorePurchases: jest.fn(),
}));

jest.mock("@/lib/theme/useAppTheme", () => {
  const { lightColors } = jest.requireActual("@/lib/theme/colors");
  return {
    useAppTheme: () => ({ colors: lightColors, isDark: false }),
  };
});

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light" },
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

const getPackagesMock = jest.mocked(getPackages);
const purchasePackageMock = jest.mocked(purchasePackage);
const restorePurchasesMock = jest.mocked(restorePurchases);

describe("paywall states", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    purchasePackageMock.mockRejectedValue({ userCancelled: true });
    restorePurchasesMock.mockResolvedValue(false);
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
      expect(purchasePackageMock).toHaveBeenCalledWith(annual),
    );
    expect(alert).not.toHaveBeenCalledWith(
      "Purchase not completed",
      expect.anything(),
    );
    alert.mockRestore();
  });
});

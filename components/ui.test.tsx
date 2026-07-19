import { fireEvent, render } from "@testing-library/react-native";
import { AppThemeProvider } from "@/lib/theme/useAppTheme";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { MoneyInput, PrimaryButton } from "./ui";

jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light" },
}));

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

jest.mock("expo-sqlite/kv-store", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
  },
}));

function renderWithTheme(element: React.ReactElement) {
  return render(<AppThemeProvider>{element}</AppThemeProvider>);
}

describe("shared form controls", () => {
  it("sanitizes money input before updating form state", async () => {
    const onChange = jest.fn();
    const screen = await renderWithTheme(
      <MoneyInput value="" onChange={onChange} />,
    );
    fireEvent.changeText(screen.getByLabelText("Amount"), "₹1,250.75abc");
    expect(onChange).toHaveBeenCalledWith("1250.75");
  });

  it("gives iOS and Android amount text an explicit unclipped line box", () => {
    const screen = renderWithTheme(
      <MoneyInput value="45000" onChange={jest.fn()} />,
    );
    expect(
      StyleSheet.flatten(screen.getByLabelText("Amount").props.style),
    ).toMatchObject({
      height: 92,
      paddingVertical: 0,
      textAlign: "left",
      includeFontPadding: false,
    });
  });

  it("centers primary button content with explicit gradient geometry", () => {
    const screen = renderWithTheme(
      <PrimaryButton title="Save Expense" onPress={jest.fn()} />,
    );
    expect(
      StyleSheet.flatten(screen.UNSAFE_getByType(LinearGradient).props.style),
    ).toMatchObject({
      width: "100%",
      height: 64,
      alignItems: "center",
      justifyContent: "center",
    });
  });

  it("does not invoke a disabled primary action", async () => {
    const onPress = jest.fn();
    const screen = await renderWithTheme(
      <PrimaryButton title="Save Expense" onPress={onPress} disabled />,
    );
    fireEvent.press(screen.getByRole("button", { name: "Save Expense" }));
    expect(onPress).not.toHaveBeenCalled();
  });
});

import {
  calculateAccountBalance,
  calculateBudgetPercent,
  calculateBudgetSuggestion,
  summarizeCurrency,
} from "./ledger";

describe("ledger invariants", () => {
  it("keeps remaining balance independent from the budget", () => {
    expect(
      summarizeCurrency(
        [
          { kind: "income", amount: 200_000, currency: "INR" },
          { kind: "expense", amount: 750, currency: "INR" },
        ],
        "INR",
      ).balance,
    ).toBe(199_250);
  });

  it("excludes incompatible currencies", () => {
    expect(
      summarizeCurrency(
        [
          { kind: "income", amount: 100_000, currency: "INR" },
          { kind: "expense", amount: 50_000, currency: "USD" },
        ],
        "INR",
      ),
    ).toEqual({ income: 100_000, expense: 0, balance: 100_000 });
  });

  it("includes both directions of transfers in account balance", () => {
    expect(
      calculateAccountBalance({
        openingBalance: 10_000,
        income: 5_000,
        expense: 2_000,
        transferIn: 3_000,
        transferOut: 4_000,
      }),
    ).toBe(12_000);
  });

  it("calculates budget thresholds without changing balances", () => {
    expect(calculateBudgetPercent(32_000, 40_000)).toBe(80);
    expect(calculateBudgetPercent(41_000, 40_000)).toBe(102);
  });

  it("requires three complete non-empty months for suggestions", () => {
    expect(calculateBudgetSuggestion([30_000, 45_000])).toBeNull();
    expect(calculateBudgetSuggestion([30_000, 45_000, 60_000])).toBe(45_000);
  });
});

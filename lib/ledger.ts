export function calculateAccountBalance(input: {
  openingBalance: number;
  income: number;
  expense: number;
  transferIn?: number;
  transferOut?: number;
}) {
  return (
    input.openingBalance +
    input.income -
    input.expense +
    (input.transferIn ?? 0) -
    (input.transferOut ?? 0)
  );
}

export function calculateBudgetPercent(expense: number, budget: number) {
  if (!Number.isFinite(expense) || expense < 0) {
    throw new Error("Expense must be a non-negative number.");
  }
  if (!Number.isFinite(budget) || budget <= 0) {
    throw new Error("Budget must be a positive number.");
  }
  return Math.floor((expense / budget) * 100);
}

export function calculateBudgetSuggestion(monthlyExpenses: number[]) {
  if (
    monthlyExpenses.length !== 3 ||
    monthlyExpenses.some((value) => value <= 0)
  ) {
    return null;
  }
  return Math.round(
    monthlyExpenses.reduce((sum, value) => sum + value, 0) /
      monthlyExpenses.length,
  );
}

export function summarizeCurrency(
  rows: { kind: "income" | "expense"; amount: number; currency: string }[],
  currency: string,
) {
  return rows.reduce(
    (summary, row) => {
      if (row.currency !== currency) return summary;
      summary[row.kind] += row.amount;
      summary.balance = summary.income - summary.expense;
      return summary;
    },
    { income: 0, expense: 0, balance: 0 },
  );
}

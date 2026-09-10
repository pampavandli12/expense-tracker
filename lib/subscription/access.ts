export type AccessLevel = "free" | "premium";

export type PremiumFeature =
  | "unlimited_accounts"
  | "custom_categories"
  | "advanced_stats"
  | "budgets"
  | "budget_alerts"
  | "cross_currency_transfers"
  | "advanced_filters";

export type PaywallSource =
  | "settings"
  | "account_limit"
  | "custom_category"
  | "stats"
  | "budget"
  | "budget_alert"
  | "cross_currency_transfer"
  | "advanced_filter";

export type PaywallIntent =
  | "create_account"
  | "create_category"
  | "open_budget"
  | "enable_budget_alerts"
  | "configure_budget_alerts";

export type OpenPaywallOptions = {
  returnTo?: string;
  intent?: PaywallIntent;
};

export const FREE_ACTIVE_ACCOUNT_LIMIT = 2;

export const paywallCopy: Record<
  PaywallSource,
  { title: string; description: string }
> = {
  settings: {
    title: "Make more of your money",
    description:
      "Unlock budgets, richer insights, custom categories, and more flexibility.",
  },
  account_limit: {
    title: "Unlock unlimited accounts",
    description:
      "Keep every bank, card, wallet, and cash account organised in one place.",
  },
  custom_category: {
    title: "Create categories that fit your life",
    description:
      "Build custom income and expense categories while keeping your history organised.",
  },
  stats: {
    title: "See the patterns behind your spending",
    description:
      "Unlock trends, category rankings, cash-flow charts, and longer-period comparisons.",
  },
  budget: {
    title: "Plan your month with a budget",
    description:
      "Set a monthly spending limit and get a suggestion based on your history.",
  },
  budget_alert: {
    title: "Stay ahead of your budget",
    description:
      "Receive private, on-device alerts when spending reaches important thresholds.",
  },
  cross_currency_transfer: {
    title: "Unlock cross-currency transfers",
    description:
      "Move money between accounts in different currencies using the exact received amount.",
  },
  advanced_filter: {
    title: "Find any transaction faster",
    description:
      "Combine account, category, and classification filters across your history.",
  },
};

export function featureSource(feature: PremiumFeature): PaywallSource {
  const sources: Record<PremiumFeature, PaywallSource> = {
    unlimited_accounts: "account_limit",
    custom_categories: "custom_category",
    advanced_stats: "stats",
    budgets: "budget",
    budget_alerts: "budget_alert",
    cross_currency_transfers: "cross_currency_transfer",
    advanced_filters: "advanced_filter",
  };
  return sources[feature];
}

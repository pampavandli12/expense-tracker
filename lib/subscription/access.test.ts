import {
  featureSource,
  FREE_ACTIVE_ACCOUNT_LIMIT,
  paywallCopy,
} from "./access";

describe("premium access configuration", () => {
  it("keeps the free account limit stable", () => {
    expect(FREE_ACTIVE_ACCOUNT_LIMIT).toBe(2);
  });

  it("maps every premium capability to contextual paywall copy", () => {
    const features = [
      "unlimited_accounts",
      "custom_categories",
      "advanced_stats",
      "budgets",
      "budget_alerts",
      "cross_currency_transfers",
      "advanced_filters",
    ] as const;

    for (const feature of features) {
      const source = featureSource(feature);
      expect(paywallCopy[source].title).toBeTruthy();
      expect(paywallCopy[source].description).toBeTruthy();
    }
  });
});

import {
  formatChartAxisValue,
  getBarChartLayout,
  getChartScale,
  getLineChartLayout,
} from "./chartLayout";

describe("responsive chart layout", () => {
  it("fits six bar groups and scrolls twelve without squeezing labels", () => {
    expect(getBarChartLayout(6, 276).scrollEnabled).toBe(false);
    const yearly = getBarChartLayout(12, 276);
    expect(yearly.scrollEnabled).toBe(true);
    expect(yearly.groupWidth).toBeGreaterThanOrEqual(40);
  });

  it("spreads short lines and preserves readable yearly spacing", () => {
    expect(getLineChartLayout(3, 276).spacing).toBe(126);
    expect(getLineChartLayout(6, 276).scrollEnabled).toBe(false);
    expect(getLineChartLayout(12, 276)).toMatchObject({
      spacing: 40,
      scrollEnabled: true,
    });
  });

  it("creates a rounded scale with enough headroom for the largest value", () => {
    expect(getChartScale([150_000, 1_590], "INR")).toMatchObject({
      maxValue: 200_000,
      stepValue: 50_000,
      noOfSections: 4,
    });
    expect(formatChartAxisValue(150_000, "INR")).toBe("₹150k");
  });
});

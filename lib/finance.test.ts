import { formatMoney, monthBounds, monthKey, toMinorUnits } from "./finance";

describe("finance primitives", () => {
  it("stores decimal money as integer minor units", () => { expect(toMinorUnits("45,000.25")).toBe(4_500_025); expect(toMinorUnits("12.999")).toBe(0); });
  it("handles year boundaries without fixed-day arithmetic", () => { const bounds = monthBounds("2026-12"); expect(monthKey(bounds.start)).toBe("2026-12"); expect(monthKey(bounds.end)).toBe("2027-01"); });
  it("formats the configured ISO currency", () => { expect(formatMoney(4_500_000, "INR")).toContain("45,000"); expect(formatMoney(1_050, "USD")).toContain("10.50"); });
  it("rejects invalid month keys", () => { expect(() => monthBounds("2026-13")).toThrow(); });
});

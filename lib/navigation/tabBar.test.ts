import { getTabBarMetrics } from "./tabBar";

const zeroInsets = { top: 0, right: 0, bottom: 0, left: 0 };

describe("tab bar metrics", () => {
  it("keeps the existing Android dimensions and content gutter", () => {
    expect(getTabBarMetrics("android", zeroInsets)).toMatchObject({
      isFloating: false,
      barHeight: 76,
      bottomOffset: 0,
      contentBottomPadding: 36,
    });
  });

  it("positions the iOS capsule above the safe area", () => {
    expect(
      getTabBarMetrics("ios", { top: 59, right: 0, bottom: 34, left: 0 }),
    ).toMatchObject({
      isFloating: true,
      barHeight: 68,
      leftOffset: 16,
      rightOffset: 16,
      bottomOffset: 42,
      contentBottomPadding: 134,
    });
  });

  it("adds landscape side insets to the visible capsule margins", () => {
    expect(
      getTabBarMetrics("ios", { top: 0, right: 44, bottom: 21, left: 44 }),
    ).toMatchObject({ leftOffset: 60, rightOffset: 60 });
  });
});

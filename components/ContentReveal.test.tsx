import { fireEvent, render } from "@testing-library/react-native";
import { useEffect } from "react";
import { Pressable, Text } from "react-native";
import { ContentReveal } from "./ContentReveal";

describe("ContentReveal", () => {
  it("keeps controls interactive while the entrance animation is running", () => {
    const onPress = jest.fn();
    const screen = render(
      <ContentReveal delay={60}>
        <Pressable accessibilityRole="button" onPress={onPress}>
          <Text>Add expense</Text>
        </Pressable>
      </ContentReveal>,
    );

    fireEvent.press(screen.getByRole("button", { name: "Add expense" }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not remount content when readiness or unrelated data changes", () => {
    const mounted = jest.fn();

    function Child({ value }: { value: string }) {
      useEffect(() => {
        mounted();
      }, []);

      return <Text>{value}</Text>;
    }

    const screen = render(
      <ContentReveal ready={false}>
        <Child value="Loading" />
      </ContentReveal>,
    );

    screen.rerender(
      <ContentReveal ready>
        <Child value="Ready" />
      </ContentReveal>,
    );
    screen.rerender(
      <ContentReveal ready>
        <Child value="Updated locally" />
      </ContentReveal>,
    );

    expect(screen.getByText("Updated locally")).toBeTruthy();
    expect(mounted).toHaveBeenCalledTimes(1);
  });
});

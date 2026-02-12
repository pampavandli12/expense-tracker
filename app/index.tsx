import { useRouter } from "expo-router";
import { Button, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const router = useRouter();
  const redirectToHome = () => {
    router.navigate("/(tabs)");
  };
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Know where your money goes every month</Text>
      <Text>
        Track income, expenses, subscriptions, EMI's and loans and many more
      </Text>
      <Button title="Get Started" onPress={() => redirectToHome()} />
    </SafeAreaView>
  );
}

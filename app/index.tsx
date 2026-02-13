import { useRouter } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "./global.css";

export default function Index() {
  const router = useRouter();
  const redirectToHome = () => {
    router.navigate("/(tabs)");
  };
  return (
    <SafeAreaView className="flex-1 items-center justify-center gap-4 p-4">
      {/* Add an Image here so that intro screen looks good  */}
      <Text className="text-3xl font-bold text-center text-text-primary">
        Know where your money goes every month
      </Text>
      <Text className="text-base text-center text-text-secondary">
        Track income, expenses, subscriptions, EMI, loans and stay within your
        budget.
      </Text>
      <TouchableOpacity
        onPress={() => redirectToHome()}
        className="px-6 py-3 mt-4 rounded-lg bg-primary-500 w-full"
      >
        <Text className="text-lg font-medium  text-center">Get Started</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

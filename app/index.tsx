import AppText from "@/components/AppText";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  const { colors } = useAppTheme();
  const router = useRouter();
  const redirectToHome = () => {
    router.navigate("/(tabs)");
  };
  return (
    <SafeAreaView
      className="flex-1 items-center justify-center gap-4 p-4"
      style={{ backgroundColor: colors.background.base }}
    >
      {/* Add an Image here so that intro screen looks good  */}
      <LottieView
        source={require("../assets/Manage Money.json")}
        autoPlay
        loop={true}
        style={{ width: 220, height: 220 }}
      />
      <AppText className="text-3xl font-bold text-center">
        Know where your money goes every month
      </AppText>
      <AppText tone="secondary" className="text-base text-center">
        Track income, expenses, subscriptions, EMI, loans and stay within your
        budget.
      </AppText>
      <TouchableOpacity
        onPress={() => redirectToHome()}
        className="px-6 py-3 mt-4 rounded-lg w-full"
        style={{ backgroundColor: colors.brand.primary }}
      >
        <AppText tone="inverse" className="text-lg font-medium text-center">
          Get Started
        </AppText>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

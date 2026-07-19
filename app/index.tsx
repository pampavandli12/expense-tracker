import AppText from "@/components/AppText";
import { PrimaryButton } from "@/components/ui";
import { getPreference, setPreference } from "@/db/repository";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import { hasPremium } from "@/services/purchases";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
export default function Index() {
  const { colors, isDark } = useAppTheme();
  const router: any = useRouter();
  const reduced = useReducedMotion();
  const [destination, setDestination] = useState<string>();
  useEffect(() => {
    Promise.all([
      getPreference("onboardingComplete"),
      getPreference("devUnlocked"),
      hasPremium().catch(() => false),
    ]).then(([done, dev, premium]) => {
      if (done === "true")
        setDestination(
          premium || (__DEV__ && dev === "true") ? "/(tabs)" : "/paywall",
        );
    });
  }, []);
  if (destination) return <Redirect href={destination as never} />;
  const next = async () => {
    await setPreference("onboardingComplete", "true");
    router.replace("/paywall");
  };
  return (
    <SafeAreaView
      className="flex-1 p-6"
      style={{ backgroundColor: colors.background.base }}
    >
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <View
            className="h-10 w-10 items-center justify-center rounded-xl"
            style={{ backgroundColor: colors.brand.primary }}
          >
            <Ionicons name="wallet" size={21} color="#0A2940" />
          </View>
          <AppText className="text-lg font-extrabold">Expense</AppText>
        </View>
        <View className="mt-8 overflow-hidden rounded-[32px]">
          <LinearGradient
            colors={isDark ? ["#19384A", "#123025"] : ["#E9FFF1", "#F4FAF7"]}
            className="h-80 items-center justify-center"
          >
            <View
              className="absolute -right-12 -top-10 h-44 w-44 rounded-full"
              style={{ backgroundColor: "#3DF08324" }}
            />
            <LottieView
              source={require("../assets/Manage Money.json")}
              autoPlay={!reduced}
              loop={!reduced}
              style={{ width: 250, height: 250 }}
            />
          </LinearGradient>
        </View>
        <View>
          <AppText className="mt-9 text-4xl font-extrabold leading-[46px]">
            Know where your money goes.
          </AppText>
          <AppText tone="secondary" className="mt-4 text-base leading-6">
            Track everyday spending, build calmer habits, and understand your
            finances without giving up your privacy.
          </AppText>
          <View className="mt-6 flex-row gap-5">
            <Benefit icon="shield-checkmark" text="Local first" />
            <Benefit icon="analytics" text="Clear insights" />
            <Benefit icon="notifications" text="Smart nudges" />
          </View>
        </View>
      </View>
      <View>
        <PrimaryButton title="Get Started" onPress={next} />
        <AppText tone="muted" className="mt-3 text-center text-xs">
          Your financial records stay on this device
        </AppText>
      </View>
    </SafeAreaView>
  );
}
function Benefit({ icon, text }: { icon: any; text: string }) {
  const { colors } = useAppTheme();
  return (
    <View className="flex-1 items-center">
      <View
        className="h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: colors.background.subtle }}
      >
        <Ionicons name={icon} size={19} color={colors.brand.primary} />
      </View>
      <AppText
        tone="secondary"
        className="mt-2 text-center text-[10px] font-bold uppercase tracking-wide"
      >
        {text}
      </AppText>
    </View>
  );
}

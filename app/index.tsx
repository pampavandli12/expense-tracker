import AppText from "@/components/AppText";
import { PrimaryButton } from "@/components/ui";
import { getPreference, setPreference } from "@/db/repository";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import { ScrollView, useWindowDimensions, View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
export default function Index() {
  const { colors, isDark } = useAppTheme();
  const router: any = useRouter();
  const reduced = useReducedMotion();
  const { height, width } = useWindowDimensions();
  const compact = height < 760;
  const heroHeight = compact ? 220 : Math.min(300, width * 0.72);
  const heroArtworkSize = compact ? 205 : Math.min(250, width * 0.62);
  const [destination, setDestination] = useState<string>();
  useEffect(() => {
    getPreference("onboardingComplete").then((done) => {
      if (done === "true") setDestination("/(tabs)");
    });
  }, []);
  if (destination) return <Redirect href={destination as never} />;
  const next = async () => {
    await setPreference("onboardingComplete", "true");
    router.replace("/(tabs)");
  };
  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background.base }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: compact ? 10 : 14,
          paddingBottom: 14,
        }}
      >
        <View>
          <View className="flex-row items-center gap-3">
            <View
              className="h-11 w-11 items-center justify-center rounded-2xl"
              style={{ backgroundColor: colors.brand.primary }}
            >
              <Ionicons name="wallet" size={22} color="#0A2940" />
            </View>
            <AppText className="text-xl font-extrabold">Expense</AppText>
          </View>

          <View
            className="overflow-hidden rounded-[32px]"
            style={{
              height: heroHeight,
              marginTop: compact ? 20 : 28,
              borderWidth: 1,
              borderColor: isDark ? colors.border.soft : "#DDF7E7",
            }}
          >
            <LinearGradient
              colors={
                isDark ? ["#19384A", "#123025"] : ["#E9FFF1", "#F4FAF7"]
              }
              style={{
                width: "100%",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                className="absolute -right-12 -top-10 h-44 w-44 rounded-full"
                style={{ backgroundColor: "#3DF08324" }}
              />
              <LottieView
                source={require("../assets/Manage Money.json")}
                autoPlay={!reduced}
                loop={!reduced}
                style={{ width: heroArtworkSize, height: heroArtworkSize }}
              />
            </LinearGradient>
          </View>

          <AppText
            className="font-extrabold"
            style={{
              marginTop: compact ? 24 : 32,
              fontSize: compact ? 30 : 36,
              lineHeight: compact ? 36 : 46,
            }}
            maxFontSizeMultiplier={1.3}
          >
            Know where your money goes.
          </AppText>
          <AppText
            tone="secondary"
            className="text-base leading-6"
            style={{ marginTop: compact ? 12 : 16 }}
          >
            Track everyday spending, build calmer habits, and understand your
            finances without giving up your privacy.
          </AppText>
          <View
            style={{
              marginTop: compact ? 20 : 24,
              flexDirection: "row",
              gap: 12,
            }}
          >
            <Benefit icon="shield-checkmark" text="Local first" />
            <Benefit icon="analytics" text="Clear insights" />
            <Benefit icon="notifications" text="Smart nudges" />
          </View>
        </View>

        <View style={{ marginTop: "auto", paddingTop: compact ? 24 : 34 }}>
          <PrimaryButton title="Get Started" onPress={next} />
          <View className="mt-3 flex-row items-center justify-center gap-1.5">
            <Ionicons
              name="lock-closed"
              size={13}
              color={colors.text.muted}
            />
            <AppText tone="muted" className="text-center text-xs">
              Your financial records stay on this device
            </AppText>
          </View>
        </View>
      </ScrollView>
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

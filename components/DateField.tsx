import AppText from "@/components/AppText";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { useEffect, useState, type ComponentType } from "react";
import { Alert, Modal, Pressable, TextInput, View } from "react-native";

type NativePickerProps = {
  modal: boolean;
  open: boolean;
  date: Date;
  maximumDate?: Date;
  mode: "date";
  onConfirm: (date: Date) => void;
  onCancel: () => void;
};

function toInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseInputDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

export default function DateField({
  value,
  onChange,
}: {
  value: Date;
  onChange: (value: Date) => void;
}) {
  const { colors } = useAppTheme();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(toInputValue(value));
  const [NativePicker, setNativePicker] =
    useState<ComponentType<NativePickerProps> | null>(null);

  useEffect(() => {
    setInput(toInputValue(value));
  }, [value]);

  useEffect(() => {
    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
      return;
    }
    import("react-native-date-picker")
      .then((module) =>
        setNativePicker(
          () => module.default as ComponentType<NativePickerProps>,
        ),
      )
      .catch(() => setNativePicker(null));
  }, []);

  const confirmFallback = () => {
    const date = parseInputDate(input);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    if (!date || date > endOfToday) {
      Alert.alert("Invalid date", "Enter a date up to today as YYYY-MM-DD.");
      return;
    }
    onChange(date);
    setOpen(false);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Choose transaction date"
        onPress={() => setOpen(true)}
        className="flex-row items-center rounded-3xl p-5"
        style={{
          backgroundColor: colors.background.surface,
          borderWidth: 1,
          borderColor: colors.border.soft,
        }}
      >
        <View
          className="h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: colors.background.subtle }}
        >
          <Ionicons name="calendar" size={20} color={colors.brand.primary} />
        </View>
        <View className="ml-3 flex-1">
          <AppText
            tone="muted"
            className="text-[10px] font-bold tracking-widest"
          >
            DATE
          </AppText>
          <AppText className="mt-1 font-semibold">
            {new Intl.DateTimeFormat("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(value)}
          </AppText>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
      </Pressable>

      {NativePicker ? (
        <NativePicker
          modal
          open={open}
          date={value}
          maximumDate={new Date()}
          mode="date"
          onConfirm={(date) => {
            setOpen(false);
            onChange(date);
          }}
          onCancel={() => setOpen(false)}
        />
      ) : (
        <Modal
          transparent
          visible={open}
          animationType="slide"
          onRequestClose={() => setOpen(false)}
        >
          <View
            className="flex-1 justify-end"
            style={{ backgroundColor: "#07152DAA" }}
          >
            <View
              className="rounded-t-[32px] p-6"
              style={{ backgroundColor: colors.background.base }}
            >
              <AppText className="text-xl font-extrabold">Choose date</AppText>
              <AppText tone="secondary" className="mt-1 text-sm">
                Enter a date as YYYY-MM-DD
              </AppText>
              <TextInput
                accessibilityLabel="Transaction date in YYYY-MM-DD format"
                value={input}
                onChangeText={setInput}
                keyboardType="numbers-and-punctuation"
                className="my-5 rounded-2xl p-4 text-lg"
                style={{
                  backgroundColor: colors.background.surface,
                  color: colors.text.primary,
                  borderWidth: 1,
                  borderColor: colors.border.soft,
                }}
              />
              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => setOpen(false)}
                  className="flex-1 rounded-2xl py-4"
                  style={{ backgroundColor: colors.background.subtle }}
                >
                  <AppText className="text-center font-bold">Cancel</AppText>
                </Pressable>
                <Pressable
                  onPress={confirmFallback}
                  className="flex-1 rounded-2xl py-4"
                  style={{ backgroundColor: colors.brand.primary }}
                >
                  <AppText className="text-center font-bold">Use date</AppText>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

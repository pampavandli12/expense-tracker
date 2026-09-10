import AppText from "@/components/AppText";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useEffect, useState } from "react";
import { Modal, Platform, Pressable, View } from "react-native";

function endOfToday() {
  const value = new Date();
  value.setHours(23, 59, 59, 999);
  return value;
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
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const openPicker = () => {
    setDraft(value);
    setOpen(true);
  };

  const handleAndroidChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setOpen(false);
    if (event.type === "dismissed" || !selectedDate) return;
    onChange(selectedDate);
  };

  const confirmIOS = () => {
    onChange(draft);
    setOpen(false);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Choose transaction date"
        onPress={openPicker}
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

      {Platform.OS === "android" && open && (
        <DateTimePicker
          value={draft}
          mode="date"
          maximumDate={endOfToday()}
          onChange={handleAndroidChange}
        />
      )}

      {Platform.OS === "ios" && (
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
                Select when this transaction happened
              </AppText>
              <DateTimePicker
                value={draft}
                mode="date"
                display="spinner"
                maximumDate={endOfToday()}
                onChange={(_event, selectedDate) => {
                  if (selectedDate) setDraft(selectedDate);
                }}
                style={{ marginTop: 8 }}
              />
              <View className="mt-2 flex-row gap-3">
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setOpen(false)}
                  className="flex-1 rounded-2xl py-4"
                  style={{ backgroundColor: colors.background.subtle }}
                >
                  <AppText className="text-center font-bold">Cancel</AppText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={confirmIOS}
                  className="flex-1 rounded-2xl py-4"
                  style={{ backgroundColor: colors.brand.primary }}
                >
                  <AppText className="text-center font-bold">Done</AppText>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

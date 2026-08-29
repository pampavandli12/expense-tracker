import AppText from "@/components/AppText";
import { Card, Header, PrimaryButton } from "@/components/ui";
import {
  archiveCategory,
  createCategory,
  listCategories,
  updateCategory,
} from "@/db/repository";
import type { Category } from "@/db/schema";
import { useAppTheme } from "@/lib/theme/useAppTheme";
import { useSubscription } from "@/lib/subscription/SubscriptionProvider";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const icons = [
  "restaurant",
  "cart",
  "car",
  "home",
  "heart",
  "game-controller",
  "briefcase",
  "gift",
] as const;
const categoryColors = [
  "#FF7A1A",
  "#5663F7",
  "#08BBD2",
  "#EC5BA8",
  "#15E765",
  "#8B5CF6",
];

export default function CategoriesScreen() {
  const { colors } = useAppTheme();
  const { requireFeature } = useSubscription();
  const [kind, setKind] = useState<"expense" | "income">("expense");
  const [rows, setRows] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category>();
  const [open, setOpen] = useState(false);
  const load = useCallback(() => listCategories(kind).then(setRows), [kind]);
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background.base }}
    >
      <Header
        title="Categories"
        action={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add category"
            onPress={() => {
              if (!requireFeature("custom_categories")) return;
              setEditing(undefined);
              setOpen(true);
            }}
            className="h-11 w-11 items-center justify-center rounded-2xl"
            style={{ backgroundColor: colors.brand.primary }}
          >
            <Ionicons name="add" size={24} color="#0A2940" />
          </Pressable>
        }
      />
      <ScrollView
        contentContainerStyle={{ padding: 18, paddingBottom: 60, gap: 12 }}
      >
        <View
          className="mb-3 flex-row rounded-2xl p-1"
          style={{ backgroundColor: colors.background.subtle }}
        >
          {(["expense", "income"] as const).map((value) => (
            <Pressable
              key={value}
              onPress={() => setKind(value)}
              className="flex-1 rounded-xl py-3"
              style={{
                backgroundColor:
                  kind === value ? colors.background.surface : "transparent",
              }}
            >
              <AppText className="text-center font-bold capitalize">
                {value}
              </AppText>
            </Pressable>
          ))}
        </View>

        {rows.map((category) => (
          <Pressable
            key={category.id}
            accessibilityRole="button"
            disabled={category.system}
            accessibilityLabel={
              category.system
                ? `${category.name}, built-in category`
                : `Edit ${category.name}`
            }
            onPress={() => {
              setEditing(category);
              setOpen(true);
            }}
          >
            <Card>
              <View className="flex-row items-center">
                <View
                  className="h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${category.color}18` }}
                >
                  <Ionicons
                    name={category.icon as never}
                    size={22}
                    color={category.color}
                  />
                </View>
                <View className="ml-4 flex-1">
                  <AppText className="font-extrabold">{category.name}</AppText>
                  <AppText tone="muted" className="mt-1 text-xs">
                    {category.system ? "Built in" : "Custom"}
                  </AppText>
                </View>
                <Ionicons
                  name={category.system ? "lock-closed" : "chevron-forward"}
                  size={17}
                  color={colors.text.muted}
                />
              </View>
            </Card>
          </Pressable>
        ))}
      </ScrollView>

      <CategoryModal
        visible={open}
        kind={kind}
        category={editing}
        close={() => {
          setOpen(false);
          setEditing(undefined);
        }}
        saved={() => {
          setOpen(false);
          setEditing(undefined);
          load();
        }}
      />
    </SafeAreaView>
  );
}

function CategoryModal({
  visible,
  kind,
  category,
  close,
  saved,
}: {
  visible: boolean;
  kind: "income" | "expense";
  category?: Category;
  close: () => void;
  saved: () => void;
}) {
  const { colors } = useAppTheme();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<(typeof icons)[number]>(icons[0]);
  const [color, setColor] = useState(categoryColors[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setName(category?.name ?? "");
    setIcon((category?.icon as (typeof icons)[number]) ?? icons[0]);
    setColor(category?.color ?? categoryColors[0]);
  }, [category, visible]);

  const save = async () => {
    setSaving(true);
    try {
      const input = { name, icon, color, kind };
      if (category) await updateCategory(category.id, input);
      else await createCategory(input);
      saved();
    } catch (reason) {
      Alert.alert(
        `Couldn't ${category ? "update" : "create"} category`,
        reason instanceof Error ? reason.message : "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const archive = () =>
    category &&
    Alert.alert(
      "Archive category?",
      "Historical transactions keep this category, but it will not appear in new entries.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive",
          style: "destructive",
          onPress: () =>
            archiveCategory(category.id)
              .then(saved)
              .catch((reason) =>
                Alert.alert(
                  "Couldn't archive category",
                  reason instanceof Error
                    ? reason.message
                    : "Please try again.",
                ),
              ),
        },
      ],
    );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={close}
    >
      <View
        className="flex-1 justify-end"
        style={{ backgroundColor: "#07152DAA" }}
      >
        <View
          className="rounded-t-[32px] p-6"
          style={{ backgroundColor: colors.background.base }}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <AppText className="text-2xl font-extrabold">
                {category ? "Edit category" : "New category"}
              </AppText>
              <AppText tone="secondary" className="capitalize">
                {kind}
              </AppText>
            </View>
            <Pressable accessibilityLabel="Close" onPress={close}>
              <Ionicons name="close" size={25} color={colors.text.primary} />
            </Pressable>
          </View>
          <TextInput
            accessibilityLabel="Category name"
            value={name}
            onChangeText={setName}
            placeholder="Category name"
            placeholderTextColor={colors.text.muted}
            className="my-5 rounded-2xl p-4"
            style={{
              backgroundColor: colors.background.surface,
              color: colors.text.primary,
            }}
          />
          <AppText
            tone="muted"
            className="text-[10px] font-bold tracking-widest"
          >
            ICON
          </AppText>
          <View className="mt-3 flex-row flex-wrap gap-3">
            {icons.map((value) => (
              <Pressable
                key={value}
                onPress={() => setIcon(value)}
                className="h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  backgroundColor:
                    icon === value
                      ? colors.brand.primary
                      : colors.background.subtle,
                }}
              >
                <Ionicons name={value} size={20} color={colors.text.primary} />
              </Pressable>
            ))}
          </View>
          <AppText
            tone="muted"
            className="mt-5 text-[10px] font-bold tracking-widest"
          >
            COLOR
          </AppText>
          <View className="mb-6 mt-3 flex-row gap-3">
            {categoryColors.map((value) => (
              <Pressable
                key={value}
                accessibilityLabel={`Use color ${value}`}
                onPress={() => setColor(value)}
                className="h-9 w-9 items-center justify-center rounded-full"
                style={{ backgroundColor: value }}
              >
                {color === value && (
                  <Ionicons name="checkmark" size={18} color="white" />
                )}
              </Pressable>
            ))}
          </View>
          <PrimaryButton
            title={category ? "Update Category" : "Create Category"}
            onPress={save}
            disabled={!name.trim()}
            loading={saving}
          />
          {category && (
            <Pressable onPress={archive} className="mt-3 py-3">
              <AppText tone="danger" className="text-center font-bold">
                Archive category
              </AppText>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

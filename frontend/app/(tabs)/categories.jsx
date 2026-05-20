import { useContext, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { MoneyContext } from "../../contexts/GlobalState";
import CategoryItem from "../../components/CategoryItem";
import Button from "../../components/Button";
import { globalStyles } from "../../styles/globalStyles";
import { colors } from "../../constants/colors";

const SUGGESTED_COLORS = [
  "#DE9AC3", "#DEA17B", "#E6E088", "#AB8FBE", "#82C9DE",
  "#FFB6B6", "#B6FFB6", "#B6D4FF", "#FFE4B6", "#D4B6FF",
];

const PRESET_ICONS = [
  "home", "work", "school", "restaurant", "favorite",
  "flight", "pets", "savings", "movie", "coffee",
  "shopping-cart", "fitness-center", "local-hospital", "directions-car", "music-note",
  "sports-soccer", "computer", "phone", "beach-access", "fastfood",
];

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "") || "cat";
}

const emptyForm = {
  displayName: "",
  icon: PRESET_ICONS[0],
  background: SUGGESTED_COLORS[0],
  isIncome: false,
};

export default function Categories() {
  const { categories, addCategory, removeCategory } = useContext(MoneyContext);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!form.displayName.trim()) {
      Alert.alert("Atenção", "Digite o nome da categoria.");
      return;
    }
    setSaving(true);
    try {
      const name = `${slugify(form.displayName)}_${Date.now().toString(36)}`;
      await addCategory({ ...form, name, displayName: form.displayName.trim() });
      setForm(emptyForm);
    } catch (e) {
      Alert.alert("Erro", e.message ?? "Não foi possível criar a categoria.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (cat) => {
    Alert.alert(
      "Excluir categoria",
      `Deseja excluir a categoria "${cat.displayName}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await removeCategory(cat.id);
            } catch (e) {
              Alert.alert("Erro", e.message ?? "Não foi possível excluir.");
            }
          },
        },
      ]
    );
  };

  const hasPreview = form.displayName.trim().length > 0;

  return (
    <FlatList
      style={globalStyles.screenContainer}
      contentContainerStyle={[globalStyles.content, { paddingBottom: 40 }]}
      data={categories}
      keyExtractor={(item) => String(item.id)}
      ListHeaderComponent={
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Nova categoria</Text>

          <Text style={globalStyles.inputLabel}>Nome</Text>
          <TextInput
            style={globalStyles.input}
            value={form.displayName}
            onChangeText={(v) => setForm({ ...form, displayName: v })}
            placeholder="Ex: Saúde, Academia, Streaming..."
          />

          {hasPreview && (
            <View style={styles.preview}>
              <View style={[styles.previewIcon, { backgroundColor: form.background }]}>
                <MaterialIcons name={form.icon} size={22} color="#fff" />
              </View>
              <Text style={styles.previewName}>{form.displayName.trim()}</Text>
              {form.isIncome && (
                <Text style={[styles.badge, styles.badgeIncome]}>receita</Text>
              )}
            </View>
          )}

          <Text style={globalStyles.inputLabel}>Ícone</Text>
          <View style={styles.iconGrid}>
            {PRESET_ICONS.map((ic) => (
              <TouchableOpacity
                key={ic}
                style={[
                  styles.iconBtn,
                  { backgroundColor: form.background },
                  form.icon === ic && styles.iconBtnSelected,
                ]}
                onPress={() => setForm({ ...form, icon: ic })}
              >
                <MaterialIcons name={ic} size={22} color="#fff" />
              </TouchableOpacity>
            ))}
          </View>

          <Text style={globalStyles.inputLabel}>Cor</Text>
          <View style={styles.colorPalette}>
            {SUGGESTED_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorDot,
                  { backgroundColor: c },
                  form.background === c && styles.colorDotSelected,
                ]}
                onPress={() => setForm({ ...form, background: c })}
              />
            ))}
          </View>

          <View style={styles.incomeRow}>
            <Text style={globalStyles.inputLabel}>É receita?</Text>
            <TouchableOpacity
              style={[styles.toggle, form.isIncome && styles.toggleActive]}
              onPress={() => setForm({ ...form, isIncome: !form.isIncome })}
            >
              <Text style={[styles.toggleText, form.isIncome && styles.toggleTextActive]}>
                {form.isIncome ? "Sim" : "Não"}
              </Text>
            </TouchableOpacity>
          </View>

          <Button onPress={handleCreate} disabled={saving}>
            {saving ? "Salvando..." : "Criar categoria"}
          </Button>

          <View style={globalStyles.line} />
          <Text style={styles.sectionTitle}>Categorias cadastradas</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.categoryRow}>
          <CategoryItem category={item} />
          <View style={styles.categoryInfo}>
            <Text style={globalStyles.primaryText}>{item.displayName}</Text>
            <View style={styles.badges}>
              <Text style={styles.badge}>{item.isDefault ? "padrão" : "personalizada"}</Text>
              {item.isIncome && <Text style={[styles.badge, styles.badgeIncome]}>receita</Text>}
            </View>
          </View>
          {!item.isDefault && (
            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
              <Text style={styles.deleteBtnText}>Excluir</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
      ItemSeparatorComponent={() => <View style={globalStyles.line} />}
    />
  );
}

const styles = StyleSheet.create({
  form: { gap: 8, marginBottom: 12 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primaryText,
    marginBottom: 4,
  },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(128,128,128,0.1)",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(128,128,128,0.25)",
    marginBottom: 4,
  },
  previewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  previewName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: colors.primaryText,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.5,
  },
  iconBtnSelected: {
    opacity: 1,
    borderWidth: 2,
    borderColor: colors.primaryText,
  },
  colorPalette: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorDotSelected: { borderColor: colors.primaryText },
  incomeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggle: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.secondaryText,
  },
  toggleActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleText: { color: colors.secondaryText },
  toggleTextActive: { color: colors.primaryContrast },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },
  categoryInfo: { flex: 1 },
  badges: { flexDirection: "row", gap: 6, marginTop: 2 },
  badge: {
    fontSize: 11,
    color: colors.secondaryText,
    borderWidth: 1,
    borderColor: colors.secondaryText,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  badgeIncome: { color: colors.positiveText, borderColor: colors.positiveText },
  deleteBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  deleteBtnText: { color: "#DA5567", fontSize: 14 },
});

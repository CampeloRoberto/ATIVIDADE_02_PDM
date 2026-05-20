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
import { MoneyContext } from "../../contexts/GlobalState";
import CategoryItem from "../../components/CategoryItem";
import Button from "../../components/Button";
import { globalStyles } from "../../styles/globalStyles";
import { colors } from "../../constants/colors";

const SUGGESTED_COLORS = [
  "#DE9AC3", "#DEA17B", "#E6E088", "#AB8FBE", "#82C9DE",
  "#FFB6B6", "#B6FFB6", "#B6D4FF", "#FFE4B6", "#D4B6FF",
];

const emptyForm = { name: "", displayName: "", icon: "", background: SUGGESTED_COLORS[0], isIncome: false };

export default function Categories() {
  const { categories, addCategory, removeCategory } = useContext(MoneyContext);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!form.name || !form.displayName || !form.icon) {
      Alert.alert("Atenção", "Preencha nome, rótulo e ícone.");
      return;
    }
    setSaving(true);
    try {
      await addCategory(form);
      setForm(emptyForm);
    } catch (e) {
      Alert.alert("Erro", e.message ?? "Não foi possível criar a categoria.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (cat) => {
    Alert.alert("Excluir categoria", `Excluir "${cat.displayName}"?`, [
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
    ]);
  };

  return (
    <FlatList
      style={globalStyles.screenContainer}
      contentContainerStyle={[globalStyles.content, { paddingBottom: 40 }]}
      data={categories}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Nova categoria</Text>

          <Text style={globalStyles.inputLabel}>Identificador (ex: health)</Text>
          <TextInput
            style={globalStyles.input}
            value={form.name}
            onChangeText={(v) => setForm({ ...form, name: v.toLowerCase().replace(/\s/g, "_") })}
            placeholder="health"
            autoCapitalize="none"
          />

          <Text style={globalStyles.inputLabel}>Rótulo exibido (ex: Saúde)</Text>
          <TextInput
            style={globalStyles.input}
            value={form.displayName}
            onChangeText={(v) => setForm({ ...form, displayName: v })}
            placeholder="Saúde"
          />

          <Text style={globalStyles.inputLabel}>Ícone Material (ex: favorite)</Text>
          <TextInput
            style={globalStyles.input}
            value={form.icon}
            onChangeText={(v) => setForm({ ...form, icon: v })}
            placeholder="favorite"
            autoCapitalize="none"
          />

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

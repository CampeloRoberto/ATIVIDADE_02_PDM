// frontend/app/(tabs)/categories.jsx
// Categorias agrupadas em Receitas / Despesas. FAB amarelo abre modal de criação.

import { useContext, useMemo, useState } from "react";
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MoneyContext } from "../../contexts/GlobalState";
import { useTheme } from "../../contexts/ThemeContext";
import CategoryIcon from "../../components/CategoryIcon";
import CurvedHeader from "../../components/CurvedHeader";
import CreateCategoryModal from "../../components/CreateCategoryModal";

export default function Categories() {
  const { theme } = useTheme();
  const { categories, addCategory, removeCategory } = useContext(MoneyContext);
  const insets = useSafeAreaInsets();
  const [creating, setCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  const { income, expense } = useMemo(() => ({
    income: categories.filter((c) => c.isIncome),
    expense: categories.filter((c) => !c.isIncome),
  }), [categories]);

  const handleCreate = async (data) => {
    setBusy(true);
    try {
      await addCategory(data);
      setCreating(false);
    } catch (e) {
      Alert.alert("Erro", e.message ?? "Não foi possível criar a categoria.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = (cat) => {
    Alert.alert("Excluir categoria", `Excluir "${cat.displayName}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir", style: "destructive",
        onPress: async () => {
          try { await removeCategory(cat.id); }
          catch (e) { Alert.alert("Erro", e.message ?? "Não foi possível excluir."); }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <CurvedHeader title="Categorias" height={90}>
        <Text style={{ color: "#fff", opacity: 0.85, fontSize: 12, marginTop: 4 }}>
          {categories.length} no total
        </Text>
      </CurvedHeader>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 110 + insets.bottom }}>
        <Group title="Receitas" icon="trending-up" accent={theme.primary} items={income} theme={theme} onDelete={handleDelete} />
        <Group title="Despesas" icon="trending-down" accent={theme.red} items={expense} theme={theme} onDelete={handleDelete} />
      </ScrollView>

      {/* FAB amarelo */}
      <Pressable
        onPress={() => setCreating(true)}
        style={[styles.fab, {
          backgroundColor: theme.yellow,
          shadowColor: theme.yellow,
          bottom: 100 + insets.bottom,
        }]}>
        <MaterialIcons name="add" size={28} color={theme.text} />
      </Pressable>

      <CreateCategoryModal
        visible={creating}
        busy={busy}
        onClose={() => !busy && setCreating(false)}
        onCreate={handleCreate}
      />
    </View>
  );
}

function Group({ title, icon, accent, items, theme, onDelete }) {
  return (
    <View style={{ marginTop: 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <MaterialIcons name={icon} size={18} color={accent} />
        <Text style={{
          fontWeight: "700", fontSize: 11, color: accent,
          letterSpacing: 1, textTransform: "uppercase",
        }}>{title}</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: theme.divider }} />
      </View>
      <View style={{ gap: 8 }}>
        {items.map((c) => (
          <View key={c.id} style={[styles.row, {
            backgroundColor: theme.surface,
            borderColor: theme.divider,
            shadowColor: theme.shadowColor,
          }]}>
            <CategoryIcon category={c} size={40} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ color: theme.text, fontWeight: "600", fontSize: 14 }}>{c.displayName}</Text>
              <Text style={{ color: theme.textDim, fontSize: 11, marginTop: 1 }}>
                {c.isDefault ? "padrão" : "personalizada"}
              </Text>
            </View>
            {!c.isDefault && (
              <Pressable onPress={() => onDelete(c)} hitSlop={10} style={{ padding: 6 }}>
                <MaterialIcons name="delete-outline" size={20} color={theme.textMuted} />
              </Pressable>
            )}
          </View>
        ))}
        {items.length === 0 && (
          <Text style={{ color: theme.textDim, fontSize: 13, paddingVertical: 8 }}>
            Nenhuma categoria.
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row", alignItems: "center",
    padding: 10, borderRadius: 14, borderWidth: 1,
    shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  fab: {
    position: "absolute",
    right: 24,
    width: 56, height: 56, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
});

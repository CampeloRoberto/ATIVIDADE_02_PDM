// frontend/components/CreateCategoryModal.jsx
// Bottom-sheet modal pra criar nova categoria. Quando `lockedIsIncome`
// é passado, esconde o toggle Despesa/Receita (uso: criação rápida no wizard).

import { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, Pressable, ScrollView, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";

const ICONS_EXPENSE = [
  "shopping-cart", "restaurant", "home", "directions-car", "school",
  "favorite", "flight", "pets", "music-note", "sports-esports",
  "local-hospital", "fitness-center", "theaters", "local-cafe", "bolt",
];
const ICONS_INCOME = [
  "work", "laptop-mac", "savings", "card-giftcard", "paid",
  "redeem", "trending-up", "monetization-on", "account-balance", "business",
];
const COLOR_OPTIONS = [
  "#1FAF6E", "#FFC93C", "#5BB6E6", "#FF8A57", "#9D7BD0",
  "#E15F88", "#22BFA6", "#F2A33A", "#5A8DEE", "#A05CDB",
];

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "") || "cat";
}

export default function CreateCategoryModal({ visible, onClose, onCreate, lockedIsIncome, busy }) {
  const { theme } = useTheme();
  const [name, setName] = useState("");
  const [isIncome, setIsIncome] = useState(lockedIsIncome ?? false);
  const iconOpts = isIncome ? ICONS_INCOME : ICONS_EXPENSE;
  const [icon, setIcon] = useState(iconOpts[0]);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  useEffect(() => {
    if (visible) {
      setName("");
      setIsIncome(lockedIsIncome ?? false);
      setIcon((lockedIsIncome ? ICONS_INCOME : ICONS_EXPENSE)[0]);
      setColor(COLOR_OPTIONS[0]);
    }
  }, [visible, lockedIsIncome]);

  useEffect(() => {
    setIcon((isIncome ? ICONS_INCOME : ICONS_EXPENSE)[0]);
  }, [isIncome]);

  const canCreate = name.trim().length > 0 && !busy;

  const submit = () => {
    if (!canCreate) return;
    onCreate({
      displayName: name.trim(),
      name: `${slugify(name)}_${Date.now().toString(36)}`,
      icon,
      background: color,
      isIncome,
    });
  };

  const locked = lockedIsIncome !== undefined;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={[styles.overlay, { backgroundColor: theme.overlay }]}>
        <Pressable onPress={(e) => e.stopPropagation()} style={[styles.sheet, { backgroundColor: theme.bg }]}>
          <View style={[styles.grabber, { backgroundColor: theme.divider }]} />
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: theme.text }]}>Nova categoria</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <MaterialIcons name="close" size={22} color={theme.textMuted} />
            </Pressable>
          </View>

          {!locked && (
            <View style={[styles.typeToggle, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
              {[
                { v: false, label: "Despesa", icon: "trending-down", c: theme.red, soft: theme.redSoft },
                { v: true,  label: "Receita", icon: "trending-up",   c: theme.primary, soft: theme.primarySoft },
              ].map((o) => {
                const active = isIncome === o.v;
                return (
                  <Pressable key={String(o.v)} onPress={() => setIsIncome(o.v)} style={[styles.typeBtn, active && { backgroundColor: o.soft }]}>
                    <MaterialIcons name={o.icon} size={16} color={active ? o.c : theme.textMuted} />
                    <Text style={{ fontWeight: "700", color: active ? o.c : theme.textMuted, fontSize: 13 }}>{o.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          )}
          {locked && (
            <View style={[styles.lockedBadge, { backgroundColor: isIncome ? theme.primarySoft : theme.redSoft }]}>
              <MaterialIcons name={isIncome ? "trending-up" : "trending-down"} size={16} color={isIncome ? theme.primary : theme.red} />
              <Text style={{ fontWeight: "700", fontSize: 12, color: isIncome ? theme.primary : theme.red }}>
                {isIncome ? "Categoria de receita" : "Categoria de despesa"}
              </Text>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false} style={{ flexGrow: 0 }}>
            <Text style={[styles.label, { color: theme.textMuted }]}>Nome</Text>
            <View style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
              <MaterialIcons name="label" size={18} color={theme.textMuted} />
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={isIncome ? "Ex: Bônus, Investimento" : "Ex: Saúde, Streaming"}
                placeholderTextColor={theme.textDim}
                style={{ flex: 1, fontSize: 15, color: theme.text, marginLeft: 8 }}
                autoFocus
              />
            </View>

            <Text style={[styles.label, { color: theme.textMuted }]}>Ícone</Text>
            <View style={styles.iconGrid}>
              {iconOpts.map((ic) => {
                const active = icon === ic;
                return (
                  <Pressable key={ic} onPress={() => setIcon(ic)} style={[styles.iconBtn, {
                    backgroundColor: active ? color : theme.surface,
                    borderColor: active ? color : theme.divider,
                  }]}>
                    <MaterialIcons name={ic} size={22} color={active ? "#fff" : theme.textMuted} />
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.label, { color: theme.textMuted }]}>Cor</Text>
            <View style={styles.colorRow}>
              {COLOR_OPTIONS.map((c) => {
                const active = color === c;
                return (
                  <Pressable key={c} onPress={() => setColor(c)} style={[styles.colorBtn, {
                    backgroundColor: c,
                    borderWidth: active ? 3 : 0,
                    borderColor: theme.bg,
                    shadowColor: c,
                    shadowOpacity: 0.4,
                    shadowRadius: 6,
                    elevation: 3,
                  }]}>
                    {active && <MaterialIcons name="check" size={16} color="#fff" />}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          <Pressable onPress={submit} disabled={!canCreate} style={[styles.createBtn, {
            backgroundColor: canCreate ? theme.primary : theme.divider,
            shadowColor: theme.primary,
          }]}>
            <Text style={{ color: canCreate ? "#fff" : theme.textDim, fontWeight: "700", fontSize: 15 }}>
              {busy ? "Criando..." : "Criar categoria"}
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 34,
    maxHeight: "88%",
  },
  grabber: { width: 44, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  title: { fontSize: 20, fontWeight: "700" },
  typeToggle: { flexDirection: "row", padding: 4, borderRadius: 14, borderWidth: 1, marginBottom: 14 },
  typeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6 },
  lockedBadge: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, marginBottom: 14, alignSelf: "flex-start" },
  label: { fontSize: 12, marginBottom: 6, marginLeft: 4, marginTop: 8 },
  input: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, height: 50, marginBottom: 4 },
  iconGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  iconBtn: { width: 52, height: 52, borderRadius: 14, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 8 },
  colorBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  createBtn: {
    height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center",
    marginTop: 16, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
});

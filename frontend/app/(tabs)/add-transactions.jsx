// frontend/app/(tabs)/add-transactions.jsx
// Wizard 3 etapas: Valor → Categoria → Detalhes.

import { useCallback, useContext, useState } from "react";
import {
  View, Text, TextInput, Pressable, ScrollView, Alert,
  Platform, StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { MoneyContext } from "../../contexts/GlobalState";
import { useTheme } from "../../contexts/ThemeContext";
import CategoryIcon from "../../components/CategoryIcon";
import CreateCategoryModal from "../../components/CreateCategoryModal";
import AnimatedNumber from "../../components/AnimatedNumber";

const emptyForm = {
  value: 0,
  categoryId: "",
  description: "",
  date: new Date(),
  isIncome: false,
};

const fmtBRL = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function AddTransactions() {
  const { theme } = useTheme();
  const { categories, addCategory, addTransaction } = useContext(MoneyContext);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [creatingCat, setCreatingCat] = useState(false);
  const [creatingCatBusy, setCreatingCatBusy] = useState(false);

  useFocusEffect(useCallback(() => {
    setStep(0);
    setForm({ ...emptyForm, date: new Date() });
    setCreatingCat(false);
  }, []));

  const canNext =
    (step === 0 && form.value > 0) ||
    (step === 1 && form.categoryId) ||
    (step === 2 && form.description.trim().length > 0);

  const next = () => setStep((s) => Math.min(2, s + 1));
  const prev = () => step === 0 ? router.replace("/") : setStep((s) => s - 1);

  const submit = async () => {
    setSaving(true);
    try {
      await addTransaction({
        description: form.description.trim(),
        value: form.value,
        date: form.date,
        categoryId: form.categoryId,
      });
      router.replace("/");
    } catch (e) {
      Alert.alert("Erro", e.message ?? "Não foi possível adicionar a transação.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCat = async (data) => {
    setCreatingCatBusy(true);
    try {
      const newCat = await addCategory(data);
      setForm((f) => ({ ...f, categoryId: newCat.id }));
      setCreatingCat(false);
    } catch (e) {
      Alert.alert("Erro", e.message ?? "Não foi possível criar a categoria.");
    } finally {
      setCreatingCatBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* Header com progresso */}
      <View style={{ backgroundColor: theme.primary, paddingTop: insets.top }}>
        <View style={{ paddingHorizontal: 22, paddingTop: 8, paddingBottom: 18 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <Pressable onPress={prev} hitSlop={12}>
              <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>
              {["Quanto?", "Categoria", "Detalhes"][step]}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 6 }}>
            {[0, 1, 2].map((s) => (
              <View key={s} style={{
                flex: s === step ? 2 : 1, height: 4, borderRadius: 2,
                backgroundColor: s <= step ? "#fff" : "rgba(255,255,255,0.3)",
              }} />
            ))}
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 22, paddingBottom: 160 + insets.bottom }}
        showsVerticalScrollIndicator={false}>
        {step === 0 && <Step1Value form={form} setForm={setForm} theme={theme} />}
        {step === 1 && <Step2Category form={form} setForm={setForm} theme={theme} categories={categories} onAdd={() => setCreatingCat(true)} />}
        {step === 2 && <Step3Details form={form} setForm={setForm} theme={theme} category={categories.find((c) => c.id === form.categoryId)} />}
      </ScrollView>

      {!creatingCat && (
        <Pressable
          onPress={step === 2 ? submit : next}
          disabled={!canNext || saving}
          style={[styles.bottomBtn, {
            backgroundColor: canNext ? theme.primary : theme.divider,
            shadowColor: theme.primary,
            bottom: 88 + insets.bottom,
          }]}>
          <Text style={{ color: canNext ? "#fff" : theme.textDim, fontWeight: "700", fontSize: 16 }}>
            {saving ? "Salvando..." : step === 2 ? "Adicionar" : "Próximo"}
          </Text>
          <MaterialIcons name={step === 2 ? "check" : "arrow-forward"} size={20} color={canNext ? "#fff" : theme.textDim} />
        </Pressable>
      )}

      <CreateCategoryModal
        visible={creatingCat}
        busy={creatingCatBusy}
        lockedIsIncome={form.isIncome}
        onClose={() => !creatingCatBusy && setCreatingCat(false)}
        onCreate={handleCreateCat}
      />
    </View>
  );
}

function Step1Value({ form, setForm, theme }) {
  const press = (n) => {
    setForm((f) => {
      let s = String(Math.round(f.value * 100));
      if (n === "back") s = s.slice(0, -1) || "0";
      else s = (s === "0" ? n : s + n);
      const v = parseInt(s, 10) / 100;
      return { ...f, value: isNaN(v) ? 0 : v };
    });
  };

  return (
    <View style={{ gap: 16 }}>
      <View style={{ alignItems: "center" }}>
        <Text style={{ color: theme.textMuted, fontSize: 12, letterSpacing: 0.4, textTransform: "uppercase" }}>Valor</Text>
        <View style={{ flexDirection: "row", alignItems: "flex-end", marginTop: 4 }}>
          <Text style={{ color: theme.textMuted, fontSize: 18, marginRight: 4, marginBottom: 8 }}>R$</Text>
          <AnimatedNumber
            value={form.value}
            duration={250}
            style={{ color: theme.text, fontSize: 50, fontWeight: "800", letterSpacing: -1.5 }}
          />
        </View>
      </View>

      <View style={[s1.toggle, { backgroundColor: theme.surface, borderColor: theme.divider, shadowColor: theme.shadowColor }]}>
        {[
          { id: false, label: "Despesa", icon: "trending-down", c: theme.red, soft: theme.redSoft },
          { id: true,  label: "Receita", icon: "trending-up",   c: theme.primary, soft: theme.primarySoft },
        ].map((o) => {
          const active = form.isIncome === o.id;
          return (
            <Pressable key={String(o.id)} onPress={() => setForm({ ...form, isIncome: o.id })}
              style={[s1.toggleBtn, active && { backgroundColor: o.soft }]}>
              <MaterialIcons name={o.icon} size={18} color={active ? o.c : theme.textMuted} />
              <Text style={{ fontWeight: "700", color: active ? o.c : theme.textMuted, fontSize: 14 }}>{o.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Numpad */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 }}>
        {["1","2","3","4","5","6","7","8","9","00","0","back"].map((n) => (
          <Pressable key={n} onPress={() => press(n)} style={[s1.key, {
            backgroundColor: n === "back" ? theme.surfaceAlt : theme.surface,
            borderColor: theme.divider,
            shadowColor: theme.shadowColor,
          }]}>
            {n === "back"
              ? <MaterialIcons name="backspace" size={20} color={theme.textMuted} />
              : <Text style={{ color: theme.text, fontSize: 22, fontWeight: "600" }}>{n}</Text>
            }
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const s1 = StyleSheet.create({
  toggle: {
    flexDirection: "row", padding: 4, borderRadius: 16, borderWidth: 1,
    shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  toggleBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
  },
  key: {
    width: "31%", height: 56, borderRadius: 16, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
    shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
});

function Step2Category({ form, setForm, theme, categories, onAdd }) {
  const filtered = categories.filter((c) => !!c.isIncome === !!form.isIncome);

  return (
    <View>
      <Text style={{ color: theme.textMuted, fontSize: 13, marginBottom: 14 }}>
        Escolha uma categoria de{" "}
        <Text style={{ fontWeight: "700", color: form.isIncome ? theme.primary : theme.red }}>
          {form.isIncome ? "receita" : "despesa"}
        </Text>
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 12 }}>
        {filtered.map((c) => {
          const active = form.categoryId === c.id;
          return (
            <Pressable key={c.id} onPress={() => setForm({ ...form, categoryId: c.id })}
              style={[s2.card, {
                backgroundColor: theme.surface,
                borderColor: active ? c.background : theme.divider,
                borderWidth: 2,
                shadowColor: active ? c.background : theme.shadowColor,
                shadowOpacity: active ? 0.4 : 0.06,
                transform: [{ translateY: active ? -2 : 0 }],
              }]}>
              <CategoryIcon category={c} size={44} />
              <Text numberOfLines={1} style={{ color: theme.text, fontWeight: "600", fontSize: 12, marginTop: 8 }}>
                {c.displayName}
              </Text>
            </Pressable>
          );
        })}
        {/* "+ Nova" */}
        <Pressable onPress={onAdd} style={[s2.card, {
          backgroundColor: "transparent",
          borderWidth: 2, borderStyle: "dashed", borderColor: theme.textDim,
        }]}>
          <View style={{
            width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderStyle: "dashed",
            borderColor: theme.textDim, alignItems: "center", justifyContent: "center",
          }}>
            <MaterialIcons name="add" size={24} color={theme.textMuted} />
          </View>
          <Text style={{ color: theme.textMuted, fontWeight: "600", fontSize: 12, marginTop: 8 }}>Nova</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s2 = StyleSheet.create({
  card: {
    width: "31%", alignItems: "center", padding: 12, borderRadius: 18,
    shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 2,
  },
});

function Step3Details({ form, setForm, theme, category }) {
  const [showDate, setShowDate] = useState(false);
  const dateStr = form.date.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });

  return (
    <View style={{ gap: 14 }}>
      {/* Resumo */}
      <View style={[s3.card, { backgroundColor: theme.surface, borderColor: theme.divider, shadowColor: theme.shadowColor }]}>
        <CategoryIcon category={category} size={52} />
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={{ color: theme.textMuted, fontSize: 12 }}>{category?.displayName}</Text>
          <Text style={{ color: form.isIncome ? theme.primary : theme.red, fontSize: 24, fontWeight: "800" }}>
            {form.isIncome ? "+" : "−"}{fmtBRL(form.value)}
          </Text>
        </View>
      </View>

      {/* Descrição */}
      <View>
        <Text style={s3.label(theme)}>Descrição</Text>
        <View style={[s3.input, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
          <MaterialIcons name="edit" size={18} color={theme.textMuted} />
          <TextInput
            value={form.description}
            onChangeText={(t) => setForm({ ...form, description: t })}
            placeholder="Ex: mercado da semana"
            placeholderTextColor={theme.textDim}
            style={{ flex: 1, fontSize: 15, color: theme.text, marginLeft: 8 }}
            autoFocus
          />
        </View>
      </View>

      {/* Data */}
      <View>
        <Text style={s3.label(theme)}>Data</Text>
        <Pressable onPress={() => setShowDate(true)} style={[s3.input, { backgroundColor: theme.surface, borderColor: theme.divider }]}>
          <MaterialIcons name="calendar-today" size={18} color={theme.textMuted} />
          <Text style={{ flex: 1, color: theme.text, fontSize: 15, marginLeft: 8 }}>{dateStr}</Text>
          <MaterialIcons name="expand-more" size={20} color={theme.textMuted} />
        </Pressable>
        {showDate && (
          <DateTimePicker
            value={form.date}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(_, d) => {
              setShowDate(Platform.OS === "ios");
              if (d) setForm({ ...form, date: d });
            }}
          />
        )}
      </View>
    </View>
  );
}

const s3 = StyleSheet.create({
  card: {
    flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 18, borderWidth: 1,
    shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  input: {
    flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderRadius: 14,
    paddingHorizontal: 14, height: 52,
  },
  label: (theme) => ({ color: theme.textMuted, fontSize: 12, marginBottom: 6, marginLeft: 4 }),
});

const styles = StyleSheet.create({
  bottomBtn: {
    position: "absolute", left: 22, right: 22,
    height: 54, borderRadius: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
});

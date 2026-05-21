// frontend/app/(tabs)/index.jsx
// Home (Transações) — saudação + saldo animado + lista com filtros.

import { useContext, useMemo, useState } from "react";
import {
  View, Text, FlatList, Pressable, RefreshControl,
  ActivityIndicator, Alert, StyleSheet,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MoneyContext } from "../../contexts/GlobalState";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import AnimatedNumber from "../../components/AnimatedNumber";
import CategoryIcon from "../../components/CategoryIcon";
import CurvedHeader from "../../components/CurvedHeader";

const fmtShort = (v) => {
  const abs = Math.abs(v);
  if (abs >= 1000) return `R$ ${(abs / 1000).toFixed(1)}k`;
  return `R$ ${abs.toFixed(0)}`;
};

const fmtBRL = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Home() {
  const { theme } = useTheme();
  const { transactions, loading, error, refresh, removeTransaction } = useContext(MoneyContext);
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState("all");

  const { balance, income, expense, filtered } = useMemo(() => {
    let income = 0, expense = 0;
    for (const tx of transactions) {
      if (tx.category?.isIncome) income += Number(tx.value);
      else expense += Number(tx.value);
    }
    let f = transactions;
    if (filter === "income")  f = f.filter((t) => t.category?.isIncome);
    if (filter === "expense") f = f.filter((t) => !t.category?.isIncome);
    const sorted = [...f].sort((a, b) => new Date(b.date) - new Date(a.date));
    return { balance: income - expense, income, expense, filtered: sorted };
  }, [transactions, filter]);

  const handleLongPress = (tx) => {
    Alert.alert("Excluir transação", `Excluir "${tx.description}"?`, [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => removeTransaction(tx.id) },
    ]);
  };

  if (loading && transactions.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.bg }}>
        <ActivityIndicator color={theme.primary} size="large" />
      </View>
    );
  }

  const firstName = (user?.name || "").split(" ")[0] || "você";

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <CurvedHeader height={170}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <Text style={{ color: "#fff", fontSize: 13, opacity: 0.85 }}>Olá,</Text>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700" }}>{firstName}! 👋</Text>
          </View>
          <View style={[styles.avatar, { borderColor: "rgba(255,255,255,0.25)" }]}>
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 18 }}>
              {firstName.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        <View style={{ marginTop: 18 }}>
          <Text style={{ color: "#fff", opacity: 0.85, fontSize: 11, letterSpacing: 0.4, textTransform: "uppercase" }}>
            Saldo deste mês
          </Text>
          <AnimatedNumber
            value={balance}
            prefix="R$ "
            style={{ color: "#fff", fontSize: 34, fontWeight: "800", marginTop: 2, letterSpacing: -0.8 }}
          />
          <View style={{ flexDirection: "row", gap: 10, marginTop: 8 }}>
            <Chip icon="trending-up" label="Receitas" value={fmtShort(income)} positive />
            <Chip icon="trending-down" label="Despesas" value={fmtShort(expense)} />
          </View>
        </View>
      </CurvedHeader>

      {error && (
        <View style={{ padding: 16, alignItems: "center" }}>
          <Text style={{ color: theme.red, marginBottom: 8 }}>{error}</Text>
          <Pressable onPress={refresh} style={{ padding: 10, borderRadius: 10, backgroundColor: theme.primary }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Tentar novamente</Text>
          </Pressable>
        </View>
      )}

      {/* Chips filtro */}
      <View style={{ flexDirection: "row", gap: 8, paddingHorizontal: 22, paddingTop: 14, paddingBottom: 6 }}>
        {[
          { id: "all", label: "Tudo" },
          { id: "income", label: "Receitas" },
          { id: "expense", label: "Despesas" },
        ].map((f) => {
          const active = filter === f.id;
          return (
            <Pressable key={f.id} onPress={() => setFilter(f.id)} style={[styles.filter, {
              backgroundColor: active ? theme.text : theme.surface,
              borderColor: active ? theme.text : theme.divider,
            }]}>
              <Text style={{
                color: active ? theme.bg : theme.textMuted,
                fontWeight: "600", fontSize: 13,
              }}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(t) => String(t.id)}
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 6, paddingBottom: 110 + insets.bottom }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} tintColor={theme.primary} colors={[theme.primary]} />
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <Text style={{ color: theme.textDim, fontSize: 14 }}>
              {filter === "all" ? "Nenhuma transação ainda." : "Nada nesse filtro."}
            </Text>
          </View>
        }
        renderItem={({ item: tx }) => <TxRow tx={tx} theme={theme} onLongPress={() => handleLongPress(tx)} />}
      />
    </View>
  );
}

function Chip({ icon, label, value, positive }) {
  return (
    <View style={{
      flex: 1, flexDirection: "row", alignItems: "center", gap: 8,
      paddingVertical: 8, paddingHorizontal: 12, borderRadius: 14,
      backgroundColor: "rgba(255,255,255,0.18)",
      borderWidth: 1, borderColor: "rgba(255,255,255,0.18)",
    }}>
      <MaterialIcons name={icon} size={18} color={positive ? "#BFFAD8" : "#FFD3D3"} />
      <View style={{ flex: 1 }}>
        <Text style={{ color: "#fff", fontSize: 10, opacity: 0.8 }}>{label}</Text>
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>{value}</Text>
      </View>
    </View>
  );
}

function TxRow({ tx, theme, onLongPress }) {
  const date = new Date(tx.date);
  const day = date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  const isIncome = tx.category?.isIncome;
  return (
    <Pressable onLongPress={onLongPress} style={[styles.row, {
      backgroundColor: theme.surface,
      borderColor: theme.divider,
      shadowColor: theme.shadowColor,
    }]}>
      <CategoryIcon category={tx.category} size={42} />
      <View style={{ flex: 1, marginHorizontal: 12 }}>
        <Text numberOfLines={1} style={{ color: theme.text, fontWeight: "600", fontSize: 14 }}>
          {tx.description}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
          <Text style={{ color: theme.textDim, fontSize: 11 }}>{day}</Text>
          <View style={{ width: 2, height: 2, borderRadius: 1, backgroundColor: theme.textDim }} />
          <Text style={{ color: theme.textDim, fontSize: 11 }}>{tx.category?.displayName}</Text>
        </View>
      </View>
      <Text style={{
        fontWeight: "700", fontSize: 15,
        color: isIncome ? theme.primary : theme.red,
      }}>
        {isIncome ? "+" : "−"}{fmtBRL(Number(tx.value))}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: 44, height: 44, borderRadius: 22, borderWidth: 1,
    alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  filter: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1,
  },
  row: {
    flexDirection: "row", alignItems: "center",
    padding: 12, borderRadius: 16, borderWidth: 1,
    shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
});

// frontend/app/(tabs)/summary.jsx
// Resumo financeiro mensal/anual com donut animado e barras de saldo.

import { useContext, useMemo, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MoneyContext } from "../../contexts/GlobalState";
import { useTheme } from "../../contexts/ThemeContext";
import CategoryIcon from "../../components/CategoryIcon";
import AnimatedDonut from "../../components/AnimatedDonut";
import CurvedHeader from "../../components/CurvedHeader";

const MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
];
const fmtBRL = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtShort = (v) => {
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1000) return `${sign}R$ ${(abs / 1000).toFixed(1)}k`;
  return `${sign}R$ ${abs.toFixed(0)}`;
};

export default function Summary() {
  const { theme } = useTheme();
  const { transactions, categories } = useContext(MoneyContext);
  const insets = useSafeAreaInsets();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [view, setView] = useState("monthly");

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const { byCat, balance, totalExpense } = useMemo(() => {
    const byCat = {};
    let income = 0, expense = 0;
    for (const tx of transactions) {
      const d = new Date(tx.date);
      if (d.getMonth() !== month || d.getFullYear() !== year) continue;
      const cat = tx.category;
      byCat[cat.id] = (byCat[cat.id] || 0) + Number(tx.value);
      if (cat.isIncome) income += Number(tx.value);
      else expense += Number(tx.value);
    }
    return { byCat, balance: income - expense, totalExpense: expense };
  }, [transactions, month, year]);

  const expenseSlices = categories
    .filter((c) => !c.isIncome && (byCat[c.id] || 0) > 0)
    .map((c) => ({ color: c.background, value: byCat[c.id], name: c.displayName }));

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <CurvedHeader height={120}>
        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700", textAlign: "center" }}>Resumo</Text>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 12 }}>
          <Pressable onPress={view === "monthly" ? prevMonth : () => setYear(y => y - 1)} hitSlop={10}>
            <MaterialIcons name="chevron-left" size={28} color="#fff" />
          </Pressable>
          <Text style={{ color: "#fff", fontWeight: "600", fontSize: 17, minWidth: 130, textAlign: "center" }}>
            {view === "monthly" ? `${MONTHS[month]} ${year}` : String(year)}
          </Text>
          <Pressable onPress={view === "monthly" ? nextMonth : () => setYear(y => y + 1)} hitSlop={10}>
            <MaterialIcons name="chevron-right" size={28} color="#fff" />
          </Pressable>
        </View>
      </CurvedHeader>

      <View style={{ paddingHorizontal: 22, paddingTop: 14 }}>
        <View style={[styles.tabs, { backgroundColor: theme.surface, borderColor: theme.divider, shadowColor: theme.shadowColor }]}>
          {[
            { id: "monthly", label: "Mensal" },
            { id: "annual",  label: "Anual" },
          ].map((t) => {
            const active = view === t.id;
            return (
              <Pressable key={t.id} onPress={() => setView(t.id)}
                style={[styles.tabBtn, active && { backgroundColor: theme.primary, shadowColor: theme.primary }]}>
                <Text style={{ fontWeight: "700", fontSize: 13, color: active ? "#fff" : theme.textMuted }}>
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 14, paddingBottom: 110 + insets.bottom }}>
        {view === "monthly" ? (
          <MonthlyView
            theme={theme}
            slices={expenseSlices}
            total={totalExpense}
            balance={balance}
            categories={categories}
            byCat={byCat}
          />
        ) : (
          <AnnualView theme={theme} year={year} transactions={transactions} />
        )}
      </ScrollView>
    </View>
  );
}

function MonthlyView({ theme, slices, total, balance, categories, byCat }) {
  const items = categories.filter((c) => (byCat[c.id] || 0) > 0);
  return (
    <View>
      <View style={{ alignItems: "center", marginBottom: 16 }}>
        <AnimatedDonut
          slices={slices}
          total={total}
          theme={theme}
          size={220}
          centerLabel="Total despesas"
          centerValue={fmtBRL(total)}
        />
      </View>
      {items.length === 0 ? (
        <Text style={{ color: theme.textDim, fontSize: 14, textAlign: "center", padding: 24 }}>
          Sem movimentação neste mês.
        </Text>
      ) : (
        <View style={{ gap: 6 }}>
          {items.map((c) => (
            <View key={c.id} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 8 }}>
              <CategoryIcon category={c} size={38} />
              <Text style={{ flex: 1, color: theme.text, fontWeight: "600", fontSize: 14, marginLeft: 12 }}>
                {c.displayName}
              </Text>
              <Text style={{
                fontWeight: "700", fontSize: 15,
                color: c.isIncome ? theme.primary : theme.red,
              }}>
                {c.isIncome ? "+" : "−"}{fmtBRL(byCat[c.id])}
              </Text>
            </View>
          ))}
          <View style={{ height: 1, backgroundColor: theme.divider, marginVertical: 8, opacity: 0.6 }} />
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: theme.text }}>Saldo</Text>
            <Text style={{
              fontSize: 22, fontWeight: "800",
              color: balance >= 0 ? theme.primary : theme.red,
            }}>
              {balance >= 0 ? "+" : "−"}{fmtBRL(Math.abs(balance))}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

function AnnualView({ theme, year, transactions }) {
  const data = useMemo(() => MONTHS.map((name, idx) => {
    let income = 0, expense = 0;
    for (const tx of transactions) {
      const d = new Date(tx.date);
      if (d.getMonth() !== idx || d.getFullYear() !== year) continue;
      if (tx.category?.isIncome) income += Number(tx.value);
      else expense += Number(tx.value);
    }
    return { name, income, expense, balance: income - expense };
  }), [transactions, year]);

  const total = data.reduce((s, m) => s + m.balance, 0);
  const maxAbs = Math.max(1, ...data.map((m) => Math.abs(m.balance)));
  const CHART_H = 160;
  const HALF = CHART_H / 2;

  return (
    <View>
      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.divider, shadowColor: theme.shadowColor }]}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
          <Text style={{ color: theme.textMuted, fontSize: 12 }}>Saldo por mês</Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: theme.primary }} />
              <Text style={{ fontSize: 10, color: theme.textDim }}>positivo</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: theme.red }} />
              <Text style={{ fontSize: 10, color: theme.textDim }}>negativo</Text>
            </View>
          </View>
        </View>
        <View style={{ height: CHART_H, position: "relative" }}>
          <View style={{ position: "absolute", top: HALF - 0.5, left: 0, right: 0, height: 1, backgroundColor: theme.divider }} />
          <View style={{ flexDirection: "row", height: "100%", gap: 4 }}>
            {data.map((m, i) => {
              const has = m.income > 0 || m.expense > 0;
              const ratio = Math.abs(m.balance) / maxAbs;
              const barH = has ? Math.max(2, ratio * (HALF - 6)) : 0;
              const positive = m.balance >= 0;
              return (
                <View key={i} style={{ flex: 1, position: "relative" }}>
                  {has && positive && (
                    <View style={{
                      position: "absolute", bottom: HALF, left: "20%", right: "20%",
                      height: barH, backgroundColor: theme.primary,
                      borderTopLeftRadius: 6, borderTopRightRadius: 6,
                    }} />
                  )}
                  {has && !positive && (
                    <View style={{
                      position: "absolute", top: HALF, left: "20%", right: "20%",
                      height: barH, backgroundColor: theme.red,
                      borderBottomLeftRadius: 6, borderBottomRightRadius: 6,
                    }} />
                  )}
                </View>
              );
            })}
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 4, marginTop: 8 }}>
          {data.map((m, i) => (
            <Text key={i} style={{
              flex: 1, textAlign: "center", fontSize: 9,
              color: m.balance !== 0 ? theme.text : theme.textDim,
              fontWeight: m.balance !== 0 ? "600" : "400",
            }}>{m.name.slice(0, 3)}</Text>
          ))}
        </View>
      </View>

      <View style={{ marginTop: 16, gap: 8 }}>
        {data.filter((m) => m.income > 0 || m.expense > 0).map((m, i) => (
          <View key={i} style={{
            flexDirection: "row", alignItems: "center", padding: 10,
            borderBottomWidth: 1, borderBottomColor: theme.divider,
          }}>
            <Text style={{ width: 80, color: theme.text, fontWeight: "600", fontSize: 13 }}>{m.name}</Text>
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Text style={{ color: theme.primary, fontSize: 11, fontWeight: "600" }}>+{fmtShort(m.income)}</Text>
              <Text style={{ color: theme.red, fontSize: 11, fontWeight: "600" }}>−{fmtShort(m.expense)}</Text>
            </View>
            <Text style={{
              width: 90, textAlign: "right", fontWeight: "700", fontSize: 15,
              color: m.balance >= 0 ? theme.primary : theme.red,
            }}>{m.balance >= 0 ? "+" : "−"}{fmtShort(Math.abs(m.balance))}</Text>
          </View>
        ))}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: "800", color: theme.text }}>Saldo anual</Text>
          <Text style={{
            fontSize: 22, fontWeight: "800",
            color: total >= 0 ? theme.primary : theme.red,
          }}>{total >= 0 ? "+" : "−"}{fmtBRL(Math.abs(total))}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row", padding: 4, borderRadius: 14, borderWidth: 1,
    shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  tabBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center",
    shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
  },
  card: {
    padding: 16, borderRadius: 18, borderWidth: 1,
    shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
});

import { useContext, useMemo, useState } from "react";
import { MoneyContext } from "../../contexts/GlobalState";
import { globalStyles } from "../../styles/globalStyles";
import SummaryItem from "../../components/SummaryItem";
import CategoryPieChart from "../../components/CategoryPieChart";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../constants/colors";
import { MaterialIcons } from "@expo/vector-icons";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

const fmt = (val) =>
  val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function Summary() {
  const { transactions, categories } = useContext(MoneyContext);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [viewMode, setViewMode] = useState("monthly");

  const goToPrevMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear((y) => y - 1); }
    else { setSelectedMonth((m) => m - 1); }
  };
  const goToNextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear((y) => y + 1); }
    else { setSelectedMonth((m) => m + 1); }
  };

  // Monthly calculations filtered by selected month/year
  const { totalsById, balance } = useMemo(() => {
    const totalsById = {};
    for (const cat of categories) totalsById[cat.id] = 0;

    const filtered = transactions.filter((tx) => {
      const d = new Date(tx.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });

    let balance = 0;
    for (const tx of filtered) {
      const val = Number(tx.value);
      if (tx.category.id in totalsById) totalsById[tx.category.id] += val;
      if (tx.category.isIncome) balance += val;
      else balance -= val;
    }

    return { totalsById, balance };
  }, [transactions, categories, selectedMonth, selectedYear]);

  // Annual breakdown: one entry per month
  const { annualData, annualBalance } = useMemo(() => {
    const annualData = MONTHS.map((monthName, idx) => {
      const monthTxs = transactions.filter((tx) => {
        const d = new Date(tx.date);
        return d.getMonth() === idx && d.getFullYear() === selectedYear;
      });

      let income = 0;
      let expenses = 0;
      for (const tx of monthTxs) {
        const val = Number(tx.value);
        if (tx.category.isIncome) income += val;
        else expenses += val;
      }
      return { month: monthName, income, expenses, balance: income - expenses };
    });

    const annualBalance = annualData.reduce((s, m) => s + m.balance, 0);
    return { annualData, annualBalance };
  }, [transactions, selectedYear]);

  const pieData = categories.map((cat) => ({
    color: cat.background,
    value: totalsById[cat.id] ?? 0,
  }));

  return (
    <View style={globalStyles.screenContainer}>
      {/* Navigation bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={viewMode === "monthly" ? goToPrevMonth : () => setSelectedYear((y) => y - 1)}
          style={styles.arrow}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="chevron-left" size={30} color={colors.primaryText} />
        </TouchableOpacity>

        <Text style={styles.navTitle}>
          {viewMode === "monthly"
            ? `${MONTHS[selectedMonth]} ${selectedYear}`
            : String(selectedYear)}
        </Text>

        <TouchableOpacity
          onPress={viewMode === "monthly" ? goToNextMonth : () => setSelectedYear((y) => y + 1)}
          style={styles.arrow}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="chevron-right" size={30} color={colors.primaryText} />
        </TouchableOpacity>
      </View>

      {/* View mode toggle */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === "monthly" && styles.toggleActive]}
          onPress={() => setViewMode("monthly")}
        >
          <Text style={[styles.toggleText, viewMode === "monthly" && styles.toggleTextActive]}>
            Mensal
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleBtn, viewMode === "annual" && styles.toggleActive]}
          onPress={() => setViewMode("annual")}
        >
          <Text style={[styles.toggleText, viewMode === "annual" && styles.toggleTextActive]}>
            Anual
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={globalStyles.content}>
        {viewMode === "monthly" ? (
          <>
            <CategoryPieChart data={pieData} />
            <View style={styles.itemList}>
              {categories.map((cat) => (
                <SummaryItem key={cat.id} category={cat} value={totalsById[cat.id] ?? 0} />
              ))}
              <View style={globalStyles.line} />
              <View style={styles.balanceRow}>
                <Text style={styles.balanceLabel}>Saldo</Text>
                <Text style={balance >= 0 ? globalStyles.positiveText : globalStyles.negativeText}>
                  {fmt(balance)}
                </Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.itemList}>
            {annualData.map(({ month, income, expenses, balance: mBal }) => (
              <View key={month} style={styles.annualRow}>
                <Text style={styles.annualMonth}>{month}</Text>
                <View style={styles.annualValues}>
                  <Text style={styles.annualIncome}>↑ {fmt(income)}</Text>
                  <Text style={styles.annualExpense}>↓ {fmt(expenses)}</Text>
                  <Text style={[styles.annualBalanceVal, { color: mBal >= 0 ? colors.positiveText : colors.negativeText }]}>
                    {fmt(mBal)}
                  </Text>
                </View>
              </View>
            ))}

            <View style={globalStyles.line} />

            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Saldo Anual</Text>
              <Text style={annualBalance >= 0 ? globalStyles.positiveText : globalStyles.negativeText}>
                {fmt(annualBalance)}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.background,
  },
  arrow: {
    padding: 4,
  },
  navTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primaryText,
  },
  toggleRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#e0e0e0",
  },
  toggleActive: {
    backgroundColor: colors.primary,
  },
  toggleText: {
    fontWeight: "600",
    color: colors.secondaryText,
  },
  toggleTextActive: {
    color: "#fff",
  },
  itemList: {
    marginTop: 8,
    gap: 4,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceLabel: {
    fontSize: 18,
    color: colors.primaryText,
    fontWeight: "800",
  },
  annualRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
  },
  annualMonth: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primaryText,
    width: 90,
  },
  annualValues: {
    flex: 1,
    alignItems: "flex-end",
    gap: 1,
  },
  annualIncome: {
    fontSize: 12,
    color: colors.positiveText,
  },
  annualExpense: {
    fontSize: 12,
    color: colors.negativeText,
  },
  annualBalanceVal: {
    fontSize: 15,
    fontWeight: "700",
  },
});

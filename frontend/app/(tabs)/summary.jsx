import { useContext, useMemo } from "react";
import { MoneyContext } from "../../contexts/GlobalState";
import { globalStyles } from "../../styles/globalStyles";
import SummaryItem from "../../components/SummaryItem";
import CategoryPieChart from "../../components/CategoryPieChart";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";

export default function Summary() {
  const { transactions, categories } = useContext(MoneyContext);

  const { totalsById, balance } = useMemo(() => {
    const totalsById = {};
    for (const cat of categories) {
      totalsById[cat.id] = 0;
    }

    let balance = 0;
    for (const tx of transactions) {
      const val = Number(tx.value);
      if (tx.category.id in totalsById) {
        totalsById[tx.category.id] += val;
      }
      if (tx.category.isIncome) {
        balance += val;
      } else {
        balance -= val;
      }
    }

    return { totalsById, balance };
  }, [transactions, categories]);

  const valueStyle =
    balance > 0 ? globalStyles.positiveText : globalStyles.negativeText;

  const pieData = categories.map((cat) => ({
    color: cat.background,
    value: totalsById[cat.id] ?? 0,
  }));

  return (
    <View style={globalStyles.screenContainer}>
      <ScrollView contentContainerStyle={globalStyles.content}>
        <CategoryPieChart data={pieData} />
        <View style={styles.itemList}>
          {categories.map((cat) => (
            <SummaryItem
              key={cat.id}
              category={cat}
              value={totalsById[cat.id] ?? 0}
            />
          ))}

          <View style={globalStyles.line} />

          <View style={styles.balance}>
            <Text style={styles.balanceText}>Saldo</Text>
            <Text style={valueStyle}>
              {balance.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  itemList: {
    marginTop: 16,
    gap: 4,
  },
  balance: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  balanceText: {
    fontSize: 18,
    color: colors.primaryText,
    fontWeight: "800",
  },
});

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { globalStyles } from "../styles/globalStyles";
import CategoryItem from "./CategoryItem";

export default function TransactionItem({ category, date, description, value, onLongPress }) {
  const valueStyle = category.isIncome ? globalStyles.positiveText : globalStyles.negativeText;

  return (
    <>
      <TouchableOpacity onLongPress={onLongPress} activeOpacity={0.7}>
        <View style={styles.itemContainer}>
          <CategoryItem category={category} />
          <View style={styles.textContainer}>
            <Text style={globalStyles.secondaryText}>
              {new Date(date).toLocaleDateString("pt-BR")}
            </Text>
            <View style={styles.bottomLineContainer}>
              <Text style={globalStyles.primaryText}>{description}</Text>
              <Text style={valueStyle}>
                {Number(value).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
      <View style={globalStyles.line} />
    </>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 4,
  },
  textContainer: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    marginLeft: 12,
    paddingVertical: 8,
  },
  bottomLineContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

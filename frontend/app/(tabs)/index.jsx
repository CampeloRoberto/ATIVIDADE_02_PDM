import { useContext } from "react";
import { ActivityIndicator, Alert, FlatList, RefreshControl, Text, View } from "react-native";
import { MoneyContext } from "@/contexts/GlobalState";
import TransactionItem from "../../components/TransactionItem";
import Button from "../../components/Button";
import { globalStyles } from "../../styles/globalStyles";
import { colors } from "../../constants/colors";

export default function Transactions() {
  const { transactions, loading, error, refresh, removeTransaction } = useContext(MoneyContext);

  const handleLongPress = (id) => {
    Alert.alert("Excluir transação", "Deseja excluir esta transação?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => removeTransaction(id) },
    ]);
  };

  if (loading) {
    return (
      <View style={[globalStyles.screenContainer, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[globalStyles.screenContainer, { justifyContent: "center", alignItems: "center", padding: 20, gap: 16 }]}>
        <Text style={globalStyles.primaryText}>{error}</Text>
        <Button onPress={refresh}>Tentar novamente</Button>
      </View>
    );
  }

  return (
    <View style={globalStyles.screenContainer}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <TransactionItem {...item} onLongPress={() => handleLongPress(item.id)} />
        )}
        ListEmptyComponent={
          <Text style={globalStyles.secondaryText}>Ainda não há nenhum item!</Text>
        }
        style={globalStyles.content}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} colors={[colors.primary]} />
        }
      />
    </View>
  );
}

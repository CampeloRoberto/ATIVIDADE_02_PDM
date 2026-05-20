import { useContext, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, ScrollView, StyleSheet, View } from "react-native";
import { globalStyles } from "../../styles/globalStyles";
import Button from "../../components/Button";
import DescriptionInput from "../../components/DescriptionInput";
import CurrencyInput from "../../components/CurrencyInput";
import DatePicker from "../../components/DatePicker";
import CategoryPicker from "../../components/CategoryPicker";
import { MoneyContext } from "../../contexts/GlobalState";

const emptyForm = {
  description: "",
  value: 0,
  date: new Date(),
  categoryId: "",
};

export default function AddTransactions() {
  const { categories, addTransaction } = useContext(MoneyContext);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const valueInputRef = useRef();

  const defaultCategoryId =
    categories.find((c) => c.isIncome)?.id ?? categories[0]?.id ?? "";
  const effectiveCategoryId = form.categoryId || defaultCategoryId;

  const handleAdd = async () => {
    setSaving(true);
    try {
      await addTransaction({
        description: form.description,
        value: form.value,
        date: form.date,
        categoryId: effectiveCategoryId,
      });
      setForm(emptyForm);
      Alert.alert("Sucesso!", "Transação adicionada com sucesso!");
    } catch (e) {
      Alert.alert("Erro", e.message ?? "Não foi possível adicionar a transação.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={globalStyles.screenContainer}>
      <ScrollView style={globalStyles.content}>
        <View style={styles.form}>
          <DescriptionInput form={form} setForm={setForm} valueInputRef={valueInputRef} />
          <CurrencyInput form={form} setForm={setForm} valueInputRef={valueInputRef} />
          <DatePicker form={form} setForm={setForm} />
          <CategoryPicker
            form={{ ...form, categoryId: effectiveCategoryId }}
            setForm={setForm}
          />
        </View>
        <Button onPress={handleAdd} disabled={saving}>
          {saving ? "Salvando..." : "Adicionar"}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  form: { gap: 12, marginBottom: 40, marginTop: 10 },
});

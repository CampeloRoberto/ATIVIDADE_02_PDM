// Tabs com a FloatingTabBar customizada. Headers escondidos — cada tela
// renderiza seu próprio header curvo verde.

import { Tabs } from "expo-router";
import FloatingTabBar from "../../components/FloatingTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: "transparent" },
      }}>
      <Tabs.Screen name="index"            options={{ title: "Transações" }} />
      <Tabs.Screen name="categories"       options={{ title: "Categorias" }} />
      <Tabs.Screen name="add-transactions" options={{ title: "Adicionar" }} />
      <Tabs.Screen name="summary"          options={{ title: "Resumo" }} />
      <Tabs.Screen name="settings"         options={{ title: "Configurações" }} />
    </Tabs>
  );
}

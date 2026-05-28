// frontend/components/CategoryIcon.jsx
// Círculo colorido com ícone MaterialIcons.

import { View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function CategoryIcon({ category, size = 42 }) {
  if (!category) return null;
  return (
    <View style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: category.background,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: category.background,
      shadowOpacity: 0.4,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    }}>
      <MaterialIcons name={category.icon} size={size * 0.5} color="#fff" />
    </View>
  );
}

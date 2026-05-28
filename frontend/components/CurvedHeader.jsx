// frontend/components/CurvedHeader.jsx
// Header verde com curva inferior (assinatura visual do app).

import { View, Text } from "react-native";
import Svg, { Path } from "react-native-svg";
import { useTheme } from "../contexts/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CurvedHeader({ children, title, height = 120, color }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const bg = color || theme.primary;

  return (
    <View style={{ backgroundColor: bg, paddingTop: insets.top }}>
      <View style={{ minHeight: height, paddingHorizontal: 22, paddingBottom: 18, justifyContent: "flex-end" }}>
        {title && (
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#fff" }}>{title}</Text>
        )}
        {children}
      </View>
      {/* Curva inferior */}
      <Svg
        viewBox="0 0 390 32"
        preserveAspectRatio="none"
        style={{ width: "100%", height: 28, marginTop: -1 }}>
        <Path d="M0 0 C 130 32, 260 32, 390 0 L 390 32 L 0 32 Z" fill={theme.bg} />
      </Svg>
    </View>
  );
}

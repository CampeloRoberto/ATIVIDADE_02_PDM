// frontend/components/FloatingTabBar.jsx
// Tab bar flutuante (pill arredondado) com FAB central de Adicionar.

import { View, Pressable, Text, Animated, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ICONS = {
  index: "attach-money",
  categories: "category",
  "add-transactions": "add",
  summary: "pie-chart",
  settings: "settings",
};

const LABELS = {
  index: "Transações",
  categories: "Categorias",
  "add-transactions": "",
  summary: "Resumo",
  settings: "Config.",
};

export default function FloatingTabBar({ state, navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.container, { bottom: insets.bottom + 12 }]}>
      <View style={[styles.pill, {
        backgroundColor: theme.surface,
        borderColor: theme.divider,
        shadowColor: theme.shadowColor,
      }]}>
        {state.routes.map((route, idx) => {
          const isFocused = state.index === idx;
          const isFab = route.name === "add-transactions";
          const onPress = () => {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (isFab) return <Fab key={route.key} onPress={onPress} active={isFocused} theme={theme} />;

          return (
            <Pressable key={route.key} onPress={onPress} style={styles.tab} android_ripple={{ borderless: true }}>
              <View style={[styles.iconWrap, { backgroundColor: isFocused ? theme.primarySoft : "transparent" }]}>
                <MaterialIcons
                  name={ICONS[route.name]}
                  size={22}
                  color={isFocused ? theme.primary : theme.textMuted}
                />
              </View>
              <Text style={{ fontSize: 10, fontWeight: "600", color: isFocused ? theme.primary : theme.textDim }}>
                {LABELS[route.name]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Fab({ onPress, active, theme }) {
  const scale = useRef(new Animated.Value(1)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(rotate, { toValue: active ? 1 : 0, useNativeDriver: true, friction: 6 }).start();
  }, [active]);

  const onIn  = () => Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, friction: 6 }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }).start();

  const rotateInterp = rotate.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "45deg"] });

  return (
    <Pressable onPress={onPress} onPressIn={onIn} onPressOut={onOut} style={styles.fabWrap}>
      <Animated.View style={[styles.fab, {
        backgroundColor: theme.primary,
        shadowColor: theme.primary,
        transform: [{ scale }],
      }]}>
        <Animated.View style={{ transform: [{ rotate: rotateInterp }] }}>
          <MaterialIcons name="add" size={28} color="#fff" />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    width: "100%",
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 6,
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,
  },
  tab: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  iconWrap: {
    width: 44,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  fabWrap: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -16,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
});

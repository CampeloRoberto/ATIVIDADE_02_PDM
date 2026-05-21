// frontend/app/(tabs)/settings.jsx
// Configurações: perfil + tema (claro/escuro) + paleta + preferências.

import { View, Text, Pressable, ScrollView, StyleSheet, Alert, Platform } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import { PALETTES, PALETTE_LABELS } from "../../constants/palettes";
import CurvedHeader from "../../components/CurvedHeader";

export default function Settings() {
  const { theme, mode, setMode, palette, setPalette } = useTheme();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    if (Platform.OS === "web") {
      if (window.confirm("Deseja sair da conta?")) logout();
    } else {
      Alert.alert("Sair", "Deseja sair da conta?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: logout },
      ]);
    }
  };

  const handleAbout = () => {
    const msg = "Versão 1.0.0\nAtividade 02 — PDM\nGerenciador financeiro pessoal";
    if (Platform.OS === "web") {
      window.alert(`Sobre o app\n\n${msg}`);
    } else {
      Alert.alert("Sobre o app", msg);
    }
  };

  const firstName = (user?.name || "Usuário").split(" ")[0];
  const initial = firstName.charAt(0).toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <CurvedHeader title="Configurações" height={90} />

      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 110 + insets.bottom }}>
        {/* Perfil */}
        <View style={[styles.card, {
          backgroundColor: theme.surface, borderColor: theme.divider,
          shadowColor: theme.shadowColor, flexDirection: "row", alignItems: "center", gap: 14,
        }]}>
          <View style={{
            width: 54, height: 54, borderRadius: 27, backgroundColor: theme.primary,
            alignItems: "center", justifyContent: "center",
          }}>
            <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700" }}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: "700" }}>
              {user?.name || "Usuário"}
            </Text>
            <Text style={{ color: theme.textMuted, fontSize: 12 }}>{user?.email}</Text>
          </View>
        </View>

        {/* Aparência */}
        <SectionTitle theme={theme}>Aparência</SectionTitle>
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.divider, shadowColor: theme.shadowColor }]}>
          {/* Tema */}
          <View style={{ padding: 14, borderBottomWidth: 1, borderBottomColor: theme.divider }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <IconBg color={theme.blue} icon="contrast" />
              <Text style={{ color: theme.text, fontWeight: "600", fontSize: 14 }}>Tema</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {[
                { id: "light", label: "Claro",  icon: "light-mode" },
                { id: "dark",  label: "Escuro", icon: "dark-mode" },
              ].map((o) => {
                const active = mode === o.id;
                return (
                  <Pressable key={o.id} onPress={() => setMode(o.id)} style={[styles.themeBtn, {
                    backgroundColor: active ? theme.primarySoft : theme.surfaceAlt,
                    borderColor: active ? theme.primary : "transparent",
                  }]}>
                    <MaterialIcons name={o.icon} size={22} color={active ? theme.primary : theme.textMuted} />
                    <Text style={{ fontWeight: "600", fontSize: 12, color: active ? theme.primary : theme.textMuted }}>
                      {o.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Paleta */}
          <View style={{ padding: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <IconBg color={theme.primary} icon="palette" />
              <View style={{ flex: 1 }}>
                <Text style={{ color: theme.text, fontWeight: "600", fontSize: 14 }}>Cor principal</Text>
                <Text style={{ color: theme.textDim, fontSize: 11 }}>
                  {PALETTE_LABELS[palette] || "—"}
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
              {Object.keys(PALETTES).map((p) => {
                const active = palette === p;
                return (
                  <Pressable key={p} onPress={() => setPalette(p)} style={{ alignItems: "center", gap: 4 }}>
                    <View style={{
                      width: 38, height: 38, borderRadius: 19,
                      backgroundColor: PALETTES[p].primary,
                      borderWidth: active ? 3 : 0,
                      borderColor: theme.bg,
                      shadowColor: PALETTES[p].primary,
                      shadowOpacity: active ? 0.6 : 0.3,
                      shadowRadius: active ? 10 : 4,
                      shadowOffset: { width: 0, height: 3 }, elevation: 3,
                    }} />
                    {active && (
                      <MaterialIcons name="check-circle" size={14} color={PALETTES[p].primary} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* Preferências */}
        <SectionTitle theme={theme}>Preferências</SectionTitle>
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.divider, shadowColor: theme.shadowColor }]}>
          <Row theme={theme} icon="payments" iconColor={theme.yellow} label="Moeda" value="BRL — Real Brasileiro" comingSoon />
          <Row theme={theme} icon="notifications" iconColor={theme.blue} label="Notificações" comingSoon />
          <Row theme={theme} icon="share" iconColor={theme.primary} label="Exportar dados" comingSoon last />
        </View>

        {/* Conta */}
        <SectionTitle theme={theme}>Conta</SectionTitle>
        <View style={[styles.section, { backgroundColor: theme.surface, borderColor: theme.divider, shadowColor: theme.shadowColor }]}>
          <Row theme={theme} icon="info" iconColor={theme.textMuted} label="Sobre o app" value="v1.0.0" onPress={handleAbout} />
          <Row theme={theme} icon="logout" iconColor={theme.red} label="Sair" danger onPress={handleLogout} last />
        </View>
      </ScrollView>
    </View>
  );
}

function SectionTitle({ theme, children }) {
  return (
    <Text style={{
      fontWeight: "700", fontSize: 11, color: theme.textDim,
      letterSpacing: 1, textTransform: "uppercase",
      marginLeft: 4, marginTop: 22, marginBottom: 10,
    }}>{children}</Text>
  );
}

function IconBg({ color, icon }) {
  return (
    <View style={{
      width: 36, height: 36, borderRadius: 10,
      backgroundColor: color, alignItems: "center", justifyContent: "center",
    }}>
      <MaterialIcons name={icon} size={20} color="#fff" />
    </View>
  );
}

function Row({ theme, icon, iconColor, label, value, onPress, comingSoon, danger, last }) {
  return (
    <Pressable
      onPress={comingSoon ? undefined : onPress}
      disabled={comingSoon}
      style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: theme.divider }, comingSoon && { opacity: 0.6 }]}>
      <IconBg color={iconColor} icon={icon} />
      <View style={{ flex: 1, flexShrink: 1, marginHorizontal: 12 }}>
        <Text style={{ color: danger ? theme.red : theme.text, fontWeight: "600", fontSize: 14 }}>{label}</Text>
        {value && !comingSoon && <Text numberOfLines={1} style={{ color: theme.textDim, fontSize: 11, marginTop: 1 }}>{value}</Text>}
      </View>
      {comingSoon ? (
        <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: theme.surfaceAlt }}>
          <Text style={{ color: theme.textDim, fontSize: 10, fontWeight: "700", letterSpacing: 0.5, textTransform: "uppercase" }}>
            Em breve
          </Text>
        </View>
      ) : onPress && !danger ? (
        <MaterialIcons name="chevron-right" size={20} color={theme.textDim} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 14, borderRadius: 18, borderWidth: 1,
    shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  section: {
    borderRadius: 18, borderWidth: 1, overflow: "hidden",
    shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2,
  },
  themeBtn: {
    flex: 1, paddingVertical: 12, paddingHorizontal: 8, borderRadius: 12,
    alignItems: "center", borderWidth: 1.5, gap: 4,
  },
  row: { flexDirection: "row", alignItems: "center", padding: 14 },
});

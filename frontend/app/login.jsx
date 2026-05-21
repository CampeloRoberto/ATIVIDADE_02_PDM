// frontend/app/login.jsx
// Tela de Login / Criar conta — hero verde no topo + form abaixo.
// Cadastro requer apenas e-mail + senha; o nome enviado ao backend é
// derivado do prefixo do e-mail para não quebrar a API existente.

import { useState } from "react";
import {
  View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform,
  ActivityIndicator, StyleSheet, Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

export default function Login() {
  const { theme } = useTheme();
  const { login, register } = useAuth();
  const insets = useSafeAreaInsets();
  const { height } = Dimensions.get("window");

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isRegister = mode === "register";

  const handle = async () => {
    setError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) { setError("Digite seu e-mail."); return; }
    if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) { setError("E-mail inválido."); return; }
    if (!pass) { setError("Digite sua senha."); return; }
    if (isRegister && pass.length < 6) { setError("A senha deve ter ao menos 6 caracteres."); return; }

    setLoading(true);
    try {
      if (isRegister) {
        const derivedName = cleanEmail.split("@")[0];
        await register(derivedName, cleanEmail, pass);
      } else {
        await login(cleanEmail, pass);
      }
    } catch (e) {
      setError(e.message ?? "Falha ao autenticar.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((m) => m === "login" ? "register" : "login");
    setError(null);
    setPass("");
  };

  const heroH = Math.round(height * 0.42);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Hero verde */}
        <View style={{ height: heroH, backgroundColor: theme.primary, paddingTop: insets.top, overflow: "hidden" }}>
          {/* Bolhas decorativas */}
          <View style={[styles.bubble, { width: 240, height: 240, top: -60, right: -60, backgroundColor: "rgba(255,255,255,0.08)" }]} />
          <View style={[styles.bubble, { width: 160, height: 160, bottom: -40, left: -40, backgroundColor: "rgba(255,255,255,0.06)" }]} />
          <View style={[styles.bubble, { width: 60, height: 60, top: heroH * 0.35, left: 40, backgroundColor: theme.yellow, opacity: 0.85 }]} />
          <View style={[styles.bubble, { width: 36, height: 36, top: heroH * 0.65, right: 60, backgroundColor: theme.blue }]} />

          {/* Marca */}
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <View style={[styles.logo, { borderColor: "rgba(255,255,255,0.25)" }]}>
              <MaterialIcons name="savings" size={40} color="#fff" />
            </View>
            <Text style={{ color: "#fff", fontSize: 28, fontWeight: "800", marginTop: 14, letterSpacing: -0.5 }}>
              Minhas Finanças
            </Text>
            <Text style={{ color: "#fff", fontSize: 13, opacity: 0.85, marginTop: 4 }}>
              Controle seu dia a dia com leveza
            </Text>
          </View>

          {/* Curva inferior */}
          <Svg viewBox="0 0 390 40" preserveAspectRatio="none" style={{ width: "100%", height: 36, marginTop: -1 }}>
            <Path d="M0 0 C 130 40, 260 40, 390 0 L 390 40 L 0 40 Z" fill={theme.bg} />
          </Svg>
        </View>

        {/* Formulário */}
        <View style={{ paddingHorizontal: 28, paddingTop: 28, paddingBottom: insets.bottom + 28, gap: 14 }}>
          <Text style={{ color: theme.text, fontSize: 22, fontWeight: "700" }}>
            {isRegister ? "Criar conta" : "Entrar"}
          </Text>

          <Field theme={theme} icon="mail" value={email} onChangeText={setEmail}
            placeholder="E-mail" keyboardType="email-address" autoCapitalize="none" />

          <Field theme={theme} icon="lock" value={pass} onChangeText={setPass}
            placeholder={isRegister ? "Senha (mín. 6 caracteres)" : "Senha"}
            secureTextEntry={!showPass}
            right={
              <Pressable onPress={() => setShowPass(v => !v)} hitSlop={8}>
                <MaterialIcons name={showPass ? "visibility-off" : "visibility"} size={18} color={theme.textMuted} />
              </Pressable>
            } />

          {error && (
            <View style={{
              flexDirection: "row", alignItems: "center", gap: 6,
              backgroundColor: theme.redSoft, padding: 10, borderRadius: 10,
            }}>
              <MaterialIcons name="info-outline" size={16} color={theme.red} />
              <Text style={{ color: theme.red, fontSize: 13, fontWeight: "500", flex: 1 }}>{error}</Text>
            </View>
          )}

          {!isRegister && (
            <Pressable style={{ alignSelf: "flex-end" }}>
              <Text style={{ color: theme.primary, fontSize: 13, fontWeight: "600" }}>Esqueci a senha</Text>
            </Pressable>
          )}

          <Pressable
            onPress={handle}
            disabled={loading}
            style={[styles.btn, { backgroundColor: theme.primary, shadowColor: theme.primary }]}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                  {isRegister ? "Criar conta" : "Entrar"}
                </Text>
                <MaterialIcons name="arrow-forward" size={20} color="#fff" />
              </>
            )}
          </Pressable>

          <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 8 }}>
            <Text style={{ color: theme.textMuted, fontSize: 13 }}>
              {isRegister ? "Já tem uma conta?" : "Não tem conta?"}
            </Text>
            <Pressable onPress={switchMode}>
              <Text style={{ color: theme.primary, fontSize: 13, fontWeight: "700" }}>
                {isRegister ? "Entrar" : "Criar conta"}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ theme, icon, right, ...inputProps }) {
  const [focus, setFocus] = useState(false);
  return (
    <View style={[styles.field, {
      backgroundColor: theme.surface,
      borderColor: focus ? theme.primary : theme.divider,
      shadowColor: theme.primary,
      shadowOpacity: focus ? 0.12 : 0,
    }]}>
      <MaterialIcons name={icon} size={20} color={focus ? theme.primary : theme.textMuted} />
      <TextInput
        {...inputProps}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        placeholderTextColor={theme.textDim}
        style={{ flex: 1, fontSize: 15, color: theme.text, marginLeft: 10 }}
      />
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: { position: "absolute", borderRadius: 9999 },
  logo: {
    width: 76, height: 76, borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1, alignItems: "center", justifyContent: "center",
  },
  field: {
    flexDirection: "row", alignItems: "center", gap: 4,
    borderWidth: 1.5, borderRadius: 14,
    paddingHorizontal: 14, height: 52,
    shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, elevation: 0,
  },
  btn: {
    height: 54, borderRadius: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    marginTop: 8,
    shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
});

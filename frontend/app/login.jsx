import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { colors } from "../constants/colors";

export default function Login() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"

  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const isRegister = mode === "register";

  const handleSubmit = async () => {
    setError(null);
    if (isRegister && !name.trim()) { setError("Digite seu nome."); return; }
    if (!email.trim())              { setError("Digite seu e-mail."); return; }
    if (!password)                  { setError("Digite sua senha."); return; }
    if (isRegister && password.length < 6) { setError("Senha deve ter ao menos 6 caracteres."); return; }

    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch (e) {
      setError(e.message ?? "Erro ao entrar.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setError(null);
    setName("");
    setEmail("");
    setPassword("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.logoWrap}>
            <MaterialIcons name="account-balance-wallet" size={48} color={colors.primary} />
          </View>

          <Text style={styles.title}>{isRegister ? "Criar conta" : "Bem-vindo"}</Text>
          <Text style={styles.subtitle}>
            {isRegister ? "Preencha os dados para se cadastrar" : "Faça login para continuar"}
          </Text>

          <View style={styles.fields}>
            {isRegister && (
              <View style={styles.inputWrap}>
                <MaterialIcons name="person" size={20} color={colors.secondaryText} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Nome"
                  placeholderTextColor={colors.secondaryText}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputWrap}>
              <MaterialIcons name="email" size={20} color={colors.secondaryText} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="E-mail"
                placeholderTextColor={colors.secondaryText}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputWrap}>
              <MaterialIcons name="lock" size={20} color={colors.secondaryText} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder={isRegister ? "Senha (mín. 6 caracteres)" : "Senha"}
                placeholderTextColor={colors.secondaryText}
                secureTextEntry={!showPass}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPass((v) => !v)} style={styles.eyeBtn}>
                <MaterialIcons
                  name={showPass ? "visibility-off" : "visibility"}
                  size={20}
                  color={colors.secondaryText}
                />
              </TouchableOpacity>
            </View>

            {error && (
              <View style={styles.errorWrap}>
                <MaterialIcons name="error-outline" size={16} color={colors.negativeText} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>{isRegister ? "Criar conta" : "Entrar"}</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              {isRegister ? "Já tem uma conta?" : "Não tem uma conta?"}
            </Text>
            <TouchableOpacity onPress={switchMode}>
              <Text style={styles.switchLink}>
                {isRegister ? "Entrar" : "Criar conta"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 32,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    gap: 8,
  },
  logoWrap: {
    alignSelf: "center",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}18`,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.primaryText,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: colors.secondaryText,
    textAlign: "center",
    marginBottom: 8,
  },
  fields: {
    gap: 14,
    marginTop: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.secondaryText,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: colors.background,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.primaryText,
  },
  eyeBtn: {
    padding: 4,
  },
  errorWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#ffeaea",
    borderRadius: 8,
    padding: 10,
  },
  errorText: {
    color: colors.negativeText,
    fontSize: 13,
    flex: 1,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
  },
  switchText: {
    fontSize: 14,
    color: colors.secondaryText,
  },
  switchLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "700",
  },
});

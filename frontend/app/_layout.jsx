// Layout raiz: SafeArea + ThemeProvider + Auth + GlobalState.

import { useEffect } from "react";
import { useRouter, useSegments, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import GlobalState from "../contexts/GlobalState";
import AuthProvider, { useAuth } from "../contexts/AuthContext";
import ThemeProvider, { useTheme } from "../contexts/ThemeContext";

function AuthGate() {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    const inTabs = segments[0] === "(tabs)";
    const inLogin = segments[0] === "login";

    if (!isAuthenticated && inTabs) {
      router.replace("/login");
    } else if (isAuthenticated && inLogin) {
      router.replace("/");
    }
  }, [isAuthenticated, loading, segments]);

  return null;
}

function RootLayoutInner() {
  const { loading } = useAuth();
  const { theme } = useTheme();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: theme.bg }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <>
      <AuthGate />
      <StatusBar style={theme.isDark ? "light" : "dark"} />
      <Stack screenOptions={{ contentStyle: { backgroundColor: theme.bg } }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <GlobalState>
            <RootLayoutInner />
          </GlobalState>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

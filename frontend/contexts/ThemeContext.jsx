// frontend/contexts/ThemeContext.jsx
// Tema (claro/escuro) + paleta, persistidos em AsyncStorage.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { buildTheme } from "../constants/palettes";

const MODE_KEY = "@pdm_theme_mode";
const PALETTE_KEY = "@pdm_theme_palette";

const ThemeContext = createContext(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

export default function ThemeProvider({ children }) {
  const [mode, setModeState] = useState("light");
  const [palette, setPaletteState] = useState("pine");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(MODE_KEY),
      AsyncStorage.getItem(PALETTE_KEY),
    ]).then(([m, p]) => {
      if (m === "light" || m === "dark") setModeState(m);
      if (p) setPaletteState(p);
      setHydrated(true);
    });
  }, []);

  const setMode = useCallback((m) => {
    setModeState(m);
    AsyncStorage.setItem(MODE_KEY, m).catch(() => {});
  }, []);

  const setPalette = useCallback((p) => {
    setPaletteState(p);
    AsyncStorage.setItem(PALETTE_KEY, p).catch(() => {});
  }, []);

  const theme = useMemo(() => buildTheme(mode, palette), [mode, palette]);

  return (
    <ThemeContext.Provider value={{ theme, mode, palette, setMode, setPalette, hydrated }}>
      {children}
    </ThemeContext.Provider>
  );
}

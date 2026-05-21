// frontend/constants/palettes.js
// 4 paletas + builder de tema (light/dark).
// Tudo derivado de uma cor primária + acentos amarelo/azul fixos.

export const PALETTES = {
  pine:    { primary: "#1F6A47", primaryDim: "#0F4A2F", primarySoft: "#D2EAD9", yellow: "#F2BD3B", yellowSoft: "#FBE7AC", blue: "#6EB0C4", blueSoft: "#D4E8EE" },
  cobalt:  { primary: "#1F4FBF", primaryDim: "#13328A", primarySoft: "#D5DFFA", yellow: "#FFC93C", yellowSoft: "#FFEDB2", blue: "#7AB8D9", blueSoft: "#D2EBF7" },
  rouge:   { primary: "#C84A6E", primaryDim: "#9A2F50", primarySoft: "#FAD9E2", yellow: "#FFC93C", yellowSoft: "#FFEDB2", blue: "#7AB8D9", blueSoft: "#D2EBF7" },
  swedish: { primary: "#F4C211", primaryDim: "#C99416", primarySoft: "#FFEBB5", yellow: "#F4C211", yellowSoft: "#FFEBB5", blue: "#0C5DA5", blueSoft: "#CFE0F0" },
};

export const PALETTE_LABELS = {
  pine:    "Pinheiro escuro",
  cobalt:  "Azul cobalto",
  rouge:   "Rosa rouge",
  swedish: "Amarelo sueco",
};

const light = (p) => ({
  bg:           "#F5F8F4",
  surface:      "#FFFFFF",
  surfaceAlt:   "#EFF3EE",
  surfaceMuted: "rgba(0,0,0,0.03)",
  divider:      "rgba(20,28,24,0.10)",
  overlay:      "rgba(20,28,24,0.45)",
  text:         "#1A2520",
  textMuted:    "#5A6661",
  textDim:      "#8C948F",
  textOnPrimary:"#FFFFFF",
  primary:      p.primary,
  primaryDim:   p.primaryDim,
  primarySoft:  p.primarySoft,
  yellow:       p.yellow,
  yellowSoft:   p.yellowSoft,
  blue:         p.blue,
  blueSoft:     p.blueSoft,
  red:          "#E15F62",
  redSoft:      "#FBDEDE",
  shadowColor:  "#1A2520",
  isDark:       false,
});

const dark = (p) => ({
  bg:           "#0E1614",
  surface:      "#172220",
  surfaceAlt:   "#1F2C29",
  surfaceMuted: "rgba(255,255,255,0.04)",
  divider:      "rgba(255,255,255,0.10)",
  overlay:      "rgba(0,0,0,0.55)",
  text:         "#ECF1EE",
  textMuted:    "#9AA8A3",
  textDim:      "#6F7B77",
  textOnPrimary:"#0E1614",
  primary:      p.primary,
  primaryDim:   p.primaryDim,
  primarySoft:  "rgba(255,255,255,0.10)",
  yellow:       p.yellow,
  yellowSoft:   "rgba(255,201,60,0.18)",
  blue:         p.blue,
  blueSoft:     "rgba(91,182,230,0.18)",
  red:          "#EF7A7D",
  redSoft:      "rgba(225,95,98,0.20)",
  shadowColor:  "#000",
  isDark:       true,
});

export function buildTheme(mode = "light", paletteKey = "pine") {
  const p = PALETTES[paletteKey] || PALETTES.pine;
  return mode === "dark" ? dark(p) : light(p);
}

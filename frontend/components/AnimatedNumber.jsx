// frontend/components/AnimatedNumber.jsx
// Contador animado de 0 → value usando setInterval (mais confiável em apps).

import { useEffect, useRef, useState } from "react";
import { Text } from "react-native";

export default function AnimatedNumber({ value, prefix = "", suffix = "", duration = 800, fractionDigits = 2, style }) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const startTs = Date.now();
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - startTs) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplay(from + (to - from) * eased);
      if (t >= 1) {
        clearInterval(id);
        fromRef.current = to;
      }
    }, 16);
    return () => clearInterval(id);
  }, [value, duration]);

  const formatted = display.toLocaleString("pt-BR", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

  return <Text style={style}>{prefix}{formatted}{suffix}</Text>;
}

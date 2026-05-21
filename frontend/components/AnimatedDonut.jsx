// frontend/components/AnimatedDonut.jsx
// Gráfico donut animado em SVG. Cada fatia desenha proporcionalmente,
// com easing out-quart durante ~900ms. Substitui o antigo CategoryPieChart.

import { useEffect, useRef, useState } from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";

export default function AnimatedDonut({ slices = [], total = 0, size = 220, stroke = 24, theme, centerLabel, centerValue }) {
  const [progress, setProgress] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    setProgress(0);
    fromRef.current = 0;
    const startTs = Date.now();
    const id = setInterval(() => {
      const t = Math.min(1, (Date.now() - startTs) / 900);
      const eased = 1 - Math.pow(1 - t, 4);
      setProgress(eased);
      if (t >= 1) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [JSON.stringify(slices.map((s) => s.value))]);

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - stroke / 2 - 2;
  const C = 2 * Math.PI * r;

  let acc = 0;
  const hasData = slices.length > 0 && total > 0;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={cx} cy={cy} r={r} fill="none" stroke={theme.divider} strokeWidth={stroke} opacity={0.6} />
        {hasData && slices.map((s, i) => {
          if (s.value <= 0) return null;
          const pct = s.value / total;
          const dash = pct * C * progress;
          const offset = -acc * C;
          acc += pct;
          return (
            <Circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${C}`}
              strokeDashoffset={offset}
              strokeLinecap="butt"
            />
          );
        })}
      </Svg>
      <View style={{ position: "absolute", alignItems: "center" }}>
        {centerLabel && (
          <Text style={{ fontSize: 11, color: theme.textMuted, letterSpacing: 0.6, textTransform: "uppercase" }}>
            {centerLabel}
          </Text>
        )}
        {centerValue && (
          <Text style={{ fontSize: 22, fontWeight: "800", color: theme.text, marginTop: 2 }}>
            {centerValue}
          </Text>
        )}
      </View>
    </View>
  );
}

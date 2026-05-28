import { View, StyleSheet } from "react-native";
import { Svg, Path, Circle } from "react-native-svg";

const polarToCartesian = (cx, cy, r, angle) => ({
  x: cx + r * Math.cos(angle - Math.PI / 2),
  y: cy + r * Math.sin(angle - Math.PI / 2),
});

const arcPath = (cx, cy, r, startAngle, endAngle) => {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const large = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y} Z`;
};

export default function CategoryPieChart({ data, size = 220 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 8;

  if (total === 0) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle cx={cx} cy={cy} r={r} fill="#E0E0E0" />
        </Svg>
      </View>
    );
  }

  const slices = [];
  let angle = 0;
  for (const d of data) {
    if (d.value <= 0) continue;
    const sweep = (d.value / total) * 2 * Math.PI;
    slices.push({ color: d.color, start: angle, end: angle + sweep });
    angle += sweep;
  }

  // Fatia única ocupa 360°: SVG não renderiza arco com ponto inicial = final
  if (slices.length === 1) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle cx={cx} cy={cy} r={r} fill={slices[0].color} />
        </Svg>
      </View>
    );
  }

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {slices.map((s, i) => (
          <Path
            key={i}
            d={arcPath(cx, cy, r, s.start, s.end)}
            fill={s.color}
            stroke="#F5F5F5"
            strokeWidth={1.5}
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignSelf: "center" },
});

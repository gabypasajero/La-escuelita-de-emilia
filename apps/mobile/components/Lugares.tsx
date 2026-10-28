import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Rect, Text as SvgText } from "react-native-svg";

/** Dibujos de los lugares del barrio. Todos usan un lienzo de 200×200 con el suelo abajo. */
export type LugarId = "casa" | "escuelita" | "taller" | "tiendita" | "plaza" | "granja" | "huerto" | "paradero" | "disfraces";

export function LugarDibujo({ id, tamano }: { id: LugarId; tamano: number }) {
  return (
    <Svg width={tamano} height={tamano} viewBox="0 0 200 200">
      {DIBUJOS[id]}
    </Svg>
  );
}

const ventana = (x: number, y: number, color = "#BBDEFB") => (
  <G key={`v${x}${y}`}>
    <Rect x={x} y={y} width="26" height="26" rx="4" fill={color} stroke="#fff" strokeWidth="4" />
    <Line x1={x + 13} y1={y} x2={x + 13} y2={y + 26} stroke="#fff" strokeWidth="3" />
  </G>
);

const DIBUJOS: Record<LugarId, React.ReactElement> = {
  // Casa amarilla de Emilia, con chimenea y flores.
  casa: (
    <G>
      <Rect x="128" y="28" width="16" height="36" fill="#8D6E63" />
      <Polygon points="20,92 100,30 180,92" fill="#E57373" />
      <Rect x="34" y="88" width="132" height="102" rx="6" fill="#FDD835" />
      {ventana(48, 108)}
      {ventana(126, 108)}
      <Rect x="86" y="128" width="30" height="62" rx="14" fill="#8D6E63" />
      <Circle cx="108" cy="160" r="3" fill="#FDD835" />
      <Circle cx="42" cy="186" r="7" fill="#F06292" />
      <Circle cx="158" cy="186" r="7" fill="#BA68C8" />
      <Circle cx="56" cy="188" r="6" fill="#FFB74D" />
    </G>
  ),
  // La Escuelita: celeste, con campana y "ABC 123" en la fachada.
  escuelita: (
    <G>
      <Rect x="88" y="8" width="24" height="30" fill="#4FC3F7" />
      <Circle cx="100" cy="26" r="7" fill="#FFCA28" />
      <Polygon points="10,80 100,32 190,80" fill="#1E88E5" />
      <Rect x="22" y="78" width="156" height="112" rx="6" fill="#4FC3F7" />
      <Rect x="40" y="88" width="120" height="26" rx="6" fill="#fff" />
      <SvgText x="100" y="108" fontSize="20" fontWeight="bold" fill="#3B2F5C" textAnchor="middle">ABC 123</SvgText>
      {ventana(34, 126, "#E3F2FD")}
      {ventana(140, 126, "#E3F2FD")}
      <Rect x="84" y="130" width="32" height="60" rx="6" fill="#1565C0" />
      <Line x1="100" y1="130" x2="100" y2="190" stroke="#0D47A1" strokeWidth="2" />
    </G>
  ),
  // Taller de arte: naranjo, con una paleta gigante.
  taller: (
    <G>
      <Polygon points="20,88 100,40 180,88" fill="#EF6C00" />
      <Rect x="32" y="86" width="136" height="104" rx="6" fill="#FFB74D" />
      <Ellipse cx="100" cy="64" rx="34" ry="22" fill="#FFF3E0" />
      <Circle cx="84" cy="58" r="6" fill="#E53935" />
      <Circle cx="100" cy="54" r="6" fill="#1E88E5" />
      <Circle cx="116" cy="60" r="6" fill="#43A047" />
      <Circle cx="96" cy="72" r="6" fill="#FDD835" />
      {ventana(46, 104, "#FFF3E0")}
      {ventana(128, 104, "#FFF3E0")}
      <Rect x="84" y="130" width="32" height="60" rx="14" fill="#6D4C41" />
      <Path d="M44 150 L66 150 L60 186 L50 186 Z" fill="#8D6E63" />
      <Rect x="40" y="140" width="30" height="12" fill="#fff" stroke="#8D6E63" strokeWidth="2" />
    </G>
  ),
  // Tiendita de Doña Rosa: almacén con toldo a rayas.
  tiendita: (
    <G>
      <Rect x="26" y="70" width="148" height="120" rx="6" fill="#FFE082" />
      <Rect x="40" y="40" width="120" height="30" rx="8" fill="#fff" stroke="#8D6E63" strokeWidth="3" />
      <SvgText x="100" y="62" fontSize="18" fontWeight="bold" fill="#8D6E63" textAnchor="middle">ALMACÉN</SvgText>
      {[0, 1, 2, 3, 4, 5, 6].map((k) => (
        <Path key={k} d={`M${26 + k * 21.1} 74 h21.1 v20 q-10.5 10 -21.1 0 z`} fill={k % 2 ? "#fff" : "#E53935"} />
      ))}
      <Rect x="40" y="110" width="64" height="50" rx="4" fill="#E3F2FD" stroke="#fff" strokeWidth="4" />
      <Circle cx="56" cy="148" r="7" fill="#E53935" />
      <Circle cx="72" cy="150" r="7" fill="#FDD835" />
      <Circle cx="88" cy="148" r="7" fill="#FB8C00" />
      <Rect x="118" y="116" width="40" height="74" rx="6" fill="#8D6E63" />
    </G>
  ),
  // Plaza de juegos: columpio y resbalín.
  plaza: (
    <G>
      <Ellipse cx="100" cy="186" rx="96" ry="12" fill="#C5E1A5" />
      <Line x1="20" y1="186" x2="40" y2="70" stroke="#E53935" strokeWidth="8" strokeLinecap="round" />
      <Line x1="100" y1="186" x2="80" y2="70" stroke="#E53935" strokeWidth="8" strokeLinecap="round" />
      <Line x1="36" y1="70" x2="84" y2="70" stroke="#C62828" strokeWidth="8" strokeLinecap="round" />
      <Line x1="52" y1="72" x2="52" y2="140" stroke="#795548" strokeWidth="3" />
      <Line x1="68" y1="72" x2="68" y2="140" stroke="#795548" strokeWidth="3" />
      <Rect x="46" y="138" width="28" height="8" rx="3" fill="#FDD835" />
      <Line x1="128" y1="186" x2="128" y2="96" stroke="#1E88E5" strokeWidth="7" />
      <Line x1="146" y1="186" x2="146" y2="96" stroke="#1E88E5" strokeWidth="7" />
      {[110, 126, 142, 158, 174].map((y) => <Line key={y} x1="128" y1={y} x2="146" y2={y} stroke="#1E88E5" strokeWidth="4" />)}
      <Rect x="122" y="88" width="30" height="10" rx="4" fill="#1565C0" />
      <Path d="M150 92 Q170 120 196 182" stroke="#43A047" strokeWidth="12" strokeLinecap="round" fill="none" />
    </G>
  ),
  // Granja de Don Pedro: granero rojo con cerca.
  granja: (
    <G>
      <Polygon points="30,86 100,30 170,86" fill="#B71C1C" />
      <Rect x="40" y="84" width="120" height="106" fill="#E53935" />
      <Rect x="70" y="120" width="60" height="70" fill="#fff" />
      <Line x1="70" y1="120" x2="130" y2="190" stroke="#E53935" strokeWidth="6" />
      <Line x1="130" y1="120" x2="70" y2="190" stroke="#E53935" strokeWidth="6" />
      <Rect x="86" y="92" width="28" height="20" fill="#FFF8E1" stroke="#fff" strokeWidth="3" />
      {[4, 22, 178, 196].map((x) => <Rect key={x} x={x - 3} y="150" width="6" height="40" fill="#A1887F" />)}
      <Rect x="0" y="160" width="40" height="6" fill="#A1887F" />
      <Rect x="160" y="160" width="40" height="6" fill="#A1887F" />
      <Rect x="0" y="176" width="40" height="6" fill="#A1887F" />
      <Rect x="160" y="176" width="40" height="6" fill="#A1887F" />
    </G>
  ),
  // Huerto: surcos con brotes, zanahorias y un espantapájaros simpático.
  huerto: (
    <G>
      {[130, 154, 178].map((y) => <Ellipse key={y} cx="100" cy={y} rx="90" ry="10" fill="#8D6E63" />)}
      {[30, 60, 90, 120, 150, 172].map((x, k) => (
        <G key={x}>
          <Path d={`M${x} ${124 + (k % 3) * 24} q-8 -16 0 -24 q8 8 0 24`} fill="#66BB6A" />
          <Path d={`M${x} ${124 + (k % 3) * 24} q10 -14 14 -16 q-2 12 -14 16`} fill="#43A047" />
        </G>
      ))}
      <Line x1="160" y1="40" x2="160" y2="120" stroke="#8D6E63" strokeWidth="6" />
      <Line x1="132" y1="66" x2="188" y2="66" stroke="#8D6E63" strokeWidth="6" />
      <Circle cx="160" cy="38" r="14" fill="#FFE0B2" />
      <Path d="M140 30 L180 30 L170 16 L150 16 Z" fill="#FDD835" />
      <Rect x="146" y="58" width="28" height="34" rx="4" fill="#42A5F5" />
    </G>
  ),
  // Tienda de disfraces: rosada, con una corona en el letrero y vitrina.
  disfraces: (
    <G>
      <Polygon points="18,84 100,36 182,84" fill="#AD1457" />
      <Rect x="30" y="82" width="140" height="108" rx="6" fill="#F48FB1" />
      <Rect x="50" y="46" width="100" height="26" rx="8" fill="#fff" stroke="#AD1457" strokeWidth="3" />
      <SvgText x="100" y="65" fontSize="15" fontWeight="bold" fill="#AD1457" textAnchor="middle">DISFRACES</SvgText>
      <Rect x="42" y="100" width="70" height="56" rx="6" fill="#FCE4EC" stroke="#fff" strokeWidth="4" />
      <Path d="M58 132 l6 -14 l8 10 l8 -10 l6 14 z" fill="#FDD835" />
      <Circle cx="96" cy="140" r="8" fill="#7E57C2" />
      <Rect x="124" y="118" width="34" height="72" rx="14" fill="#880E4F" />
      <Circle cx="150" cy="156" r="3" fill="#FDD835" />
    </G>
  ),
  // Paradero de los amigos: donde llega el bus con amigos de otros países.
  paradero: (
    <G>
      <Rect x="20" y="70" width="110" height="10" rx="4" fill="#5C6BC0" />
      <Rect x="26" y="80" width="8" height="106" fill="#7986CB" />
      <Rect x="116" y="80" width="8" height="106" fill="#7986CB" />
      <Rect x="36" y="140" width="78" height="10" rx="4" fill="#8D6E63" />
      <Line x1="160" y1="60" x2="160" y2="190" stroke="#9E9E9E" strokeWidth="6" />
      <Circle cx="160" cy="54" r="22" fill="#FDD835" stroke="#fff" strokeWidth="4" />
      <SvgText x="160" y="61" fontSize="20" fontWeight="bold" fill="#3B2F5C" textAnchor="middle">BUS</SvgText>
    </G>
  ),
};

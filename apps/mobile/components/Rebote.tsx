import { useRef, type ReactNode } from "react";
import { Animated, Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { sonido } from "../lib/sonidos";

/**
 * Botón que se siente de verdad: se hunde al tocarlo, rebota al soltarlo y
 * hace "pop". Reemplaza a `Pressable` en los botones grandes de la app.
 */
export function Rebote({ children, style, onPress, mudo = false, ...resto }: Omit<PressableProps, "style" | "children"> & { children: ReactNode; style?: StyleProp<ViewStyle>; mudo?: boolean }) {
  const escala = useRef(new Animated.Value(1)).current;
  const a = (v: number) => Animated.spring(escala, { toValue: v, friction: 4, tension: 240, useNativeDriver: true }).start();
  return (
    <Animated.View style={{ transform: [{ scale: escala }] }}>
      <Pressable
        {...resto}
        style={style}
        onPressIn={() => a(0.9)}
        onPressOut={() => a(1)}
        onPress={(e) => { if (!mudo) sonido.toque(); onPress?.(e); }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

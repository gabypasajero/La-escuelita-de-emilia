import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ProveedorJuego } from "../lib/juego";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <ProveedorJuego>
        <StatusBar hidden />
        <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
      </ProveedorJuego>
    </SafeAreaProvider>
  );
}

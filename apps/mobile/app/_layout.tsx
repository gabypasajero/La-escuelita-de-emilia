import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TocarParaEmpezar } from "../components/TocarParaEmpezar";
import { ProveedorJuego } from "../lib/juego";

const esVentana = (route: { params?: object }) => (route.params as { ventana?: string } | undefined)?.ventana === "1";

export default function Layout() {
  return (
    <SafeAreaProvider>
      <ProveedorJuego>
        <StatusBar hidden />
        <Stack
          screenOptions={({ route }) => ({
            headerShown: false,
            animation: "fade",
            // Los juegos abiertos desde el mundo 3D flotan sobre el escenario.
            presentation: esVentana(route) ? "transparentModal" : "card",
          })}
          screenLayout={({ children, route }) =>
            esVentana(route) ? (
              // Ventana flotante: el escenario 3D se asoma por los bordes sombreados.
              <View style={estilos.velo}>
                <View style={estilos.marco}>{children}</View>
              </View>
            ) : (
              <>{children}</>
            )
          }
        />
        <TocarParaEmpezar />
      </ProveedorJuego>
    </SafeAreaProvider>
  );
}

const estilos = StyleSheet.create({
  velo: { flex: 1, backgroundColor: "rgba(28,20,56,0.4)", paddingHorizontal: 22, paddingVertical: 16 },
  marco: {
    flex: 1, borderRadius: 30, borderWidth: 5, borderColor: "#FFFFFF", overflow: "hidden", backgroundColor: "#FFF8E1",
    boxShadow: "0 0 0 3px rgba(59,47,92,0.25), 0 14px 44px rgba(20,12,48,0.6)",
  },
});

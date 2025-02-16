import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from "../theme/ThemeProvider";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <SafeAreaProvider>
        <ThemeProvider>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: "#1a365d",
              },
              headerTintColor: "#fff",
              headerTitleStyle: {
                fontWeight: "bold",
              },
              headerBackVisible: false,
              gestureEnabled: false,
            }}
          >
            <Stack.Screen
              name="(auth)"
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="(app)"
              options={{
                headerShown: false,
              }}
            />
          </Stack>
        </ThemeProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

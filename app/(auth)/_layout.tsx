import { Stack } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";
import { router } from "expo-router";

export default function AuthLayout() {
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      router.replace('/(app)');
    }
  }, [session]);

  return (
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
    />
  );
} 
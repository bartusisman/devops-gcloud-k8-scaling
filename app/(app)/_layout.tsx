import { Tabs } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { NotesProvider } from "../../context/NotesContext";

export default function AppLayout() {
  const { session } = useAuth();

  useEffect(() => {
    if (!session) {
      router.replace('/login');
    }
  }, [session]);

  return (
    <NotesProvider>
      <Tabs
        screenOptions={{
          headerStyle: {
            backgroundColor: "#1a365d",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          tabBarStyle: {
            backgroundColor: "#fff",
            borderTopColor: "#e2e8f0",
          },
          tabBarActiveTintColor: "#1a365d",
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="notes"
          options={{
            title: "Notes",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="document-text-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </NotesProvider>
  );
} 
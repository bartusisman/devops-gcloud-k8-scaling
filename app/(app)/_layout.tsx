import { Tabs } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { NotesProvider } from "../../context/NotesContext";
import { useNotes } from "../../context/NotesContext";
import { View } from "react-native";

// This wrapper is needed because we need to access the NotesContext
function TabsWithNotifications() {
  const { hasUnreadNotifications, checkForNewNotifications } = useNotes();
  
  // Check for new notifications when the component mounts
  useEffect(() => {
    checkForNewNotifications();
  }, []);
  
  return (
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
          title: "Activity",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: "Notes",
          tabBarIcon: ({ color, size }) => (
            <>
              <Ionicons name="newspaper-outline" size={size} color={color} />
              {hasUnreadNotifications && (
                <View style={{
                  position: 'absolute',
                  right: -6,
                  top: -2,
                  backgroundColor: '#3182ce',
                  borderRadius: 6,
                  width: 12,
                  height: 12,
                }} />
              )}
            </>
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
  );
}

export default function AppLayout() {
  const { session } = useAuth();

  useEffect(() => {
    if (!session) {
      router.replace('/login');
    }
  }, [session]);

  return (
    <NotesProvider>
      <TabsWithNotifications />
    </NotesProvider>
  );
} 
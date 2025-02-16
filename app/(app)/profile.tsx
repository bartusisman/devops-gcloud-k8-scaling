import { View, Text, StyleSheet, Alert, Pressable } from "react-native";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotes } from "../../context/NotesContext";
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const { userNotes } = useNotes();
  const [showStats, setShowStats] = useState(true);
  const username = session?.user?.user_metadata?.username;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  const stats = [
    {
      icon: "document-text",
      label: "Total Notes",
      value: userNotes.length,
    },
    {
      icon: "time",
      label: "Last Active",
      value: userNotes.length > 0 
        ? new Date(userNotes[0].timestamp).toLocaleDateString()
        : "No activity yet",
    },
  ];

  return (
    <View style={styles.container}>
      <Animated.View 
        entering={FadeIn}
        style={styles.header}
      >
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {username?.[0]?.toUpperCase() || "?"}
          </Text>
        </View>
        <Text style={styles.username}>@{username}</Text>
      </Animated.View>

      <Animated.View 
        entering={FadeInDown.delay(200)}
        style={styles.statsContainer}
      >
        <Pressable 
          style={[styles.statsHeader, showStats && styles.statsHeaderActive]}
          onPress={() => setShowStats(!showStats)}
        >
          <Text style={styles.statsTitle}>Activity Stats</Text>
          <Ionicons 
            name={showStats ? "chevron-up" : "chevron-down"} 
            size={20} 
            color="#4a5568"
          />
        </Pressable>

        {showStats && (
          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
              <View key={stat.label} style={styles.statCard}>
                <Ionicons name={stat.icon} size={24} color="#1a365d" />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        )}
      </Animated.View>

      <View style={styles.menuContainer}>
        <Pressable 
          style={styles.menuItem}
          onPress={() => Alert.alert('Coming Soon', 'This feature is under development')}
        >
          <Ionicons name="settings-outline" size={22} color="#4a5568" />
          <Text style={styles.menuText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#718096" style={styles.menuArrow} />
        </Pressable>

        <Pressable 
          style={styles.menuItem}
          onPress={() => Alert.alert('Coming Soon', 'This feature is under development')}
        >
          <Ionicons name="help-circle-outline" size={22} color="#4a5568" />
          <Text style={styles.menuText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color="#718096" style={styles.menuArrow} />
        </Pressable>

        <Pressable 
          style={[styles.menuItem, styles.signOutButton]}
          onPress={handleSignOut}
        >
          <Ionicons name="log-out-outline" size={22} color="#e53e3e" />
          <Text style={[styles.menuText, styles.signOutText]}>Sign Out</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7fafc",
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1a365d',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: '#fff',
  },
  username: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2d3748",
  },
  statsContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statsHeaderActive: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statsTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2d3748",
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f7fafc',
    borderRadius: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a365d",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#4a5568",
    textAlign: 'center',
  },
  menuContainer: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  menuText: {
    fontSize: 16,
    color: "#2d3748",
    marginLeft: 12,
    flex: 1,
  },
  menuArrow: {
    marginLeft: 'auto',
  },
  signOutButton: {
    borderBottomWidth: 0,
  },
  signOutText: {
    color: "#e53e3e",
  },
}); 
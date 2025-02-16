import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { session } = useAuth();
  const username = session?.user?.user_metadata?.username;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome back,</Text>
        <Text style={styles.username}>{username}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>Recent Activity</Text>
        {/* Add your recent activity content here */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7fafc",
  },
  header: {
    padding: 24,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  welcome: {
    fontSize: 16,
    color: "#4a5568",
  },
  username: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a365d",
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2d3748",
    marginBottom: 16,
  },
}); 
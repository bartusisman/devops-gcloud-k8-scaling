import { View, Text, StyleSheet, Alert } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "../../components/ui/Button";

export default function ProfileScreen() {
  const { session, signOut } = useAuth();
  const username = session?.user?.user_metadata?.username;

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.label}>Username</Text>
          <Text style={styles.value}>{username}</Text>
        </View>
        
        <Button 
          title="Sign Out" 
          onPress={handleSignOut}
          variant="secondary"
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7fafc",
  },
  content: {
    padding: 24,
  },
  section: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: "#4a5568",
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#2d3748",
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#e53e3e",
  },
}); 
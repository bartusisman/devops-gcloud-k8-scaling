import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotesScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>My Notes</Text>
        {/* Add your notes content here */}
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
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a365d",
    marginBottom: 16,
  },
}); 
import { View, Text, StyleSheet, FlatList, TextInput, Pressable, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useNotes } from "../../context/NotesContext";
import { Ionicons } from '@expo/vector-icons';

function formatDateTime(timestamp: string) {
  const date = new Date(timestamp);
  return {
    date: date.toLocaleDateString(),
    time: date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    })
  };
}

export default function NotesScreen() {
  const { notes, loading, createNote, loadNotes } = useNotes();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    loadNotes();
  }, []);

  const handleCreateNote = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Content is required');
      return;
    }

    try {
      await createNote(content, title.trim());
      setTitle("");
      setContent("");
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Community Notes</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Note title..."
          />
          <TextInput
            style={styles.contentInput}
            value={content}
            onChangeText={setContent}
            placeholder="Write your note..."
            multiline
          />
          <Pressable 
            style={styles.sendButton} 
            onPress={handleCreateNote}
            disabled={loading}
          >
            <Ionicons name="send" size={24} color="#1a365d" />
          </Pressable>
        </View>

        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          refreshing={loading}
          onRefresh={loadNotes}
          renderItem={({ item }) => {
            const { date, time } = formatDateTime(item.timestamp);
            return (
              <View style={styles.noteCard}>
                <Text style={styles.noteTitle}>{item.title}</Text>
                <Text style={styles.noteUsername}>@{item.username}</Text>
                <Text style={styles.noteContent}>{item.content}</Text>
                <View style={styles.noteFooter}>
                  <Text style={styles.noteDate}>{date}</Text>
                  <Text style={styles.noteTime}>{time}</Text>
                </View>
              </View>
            );
          }}
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
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a365d",
    marginBottom: 16,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    padding: 8,
  },
  contentInput: {
    fontSize: 16,
    minHeight: 80,
    padding: 8,
  },
  sendButton: {
    padding: 8,
    alignSelf: 'flex-end',
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a365d",
    marginBottom: 4,
  },
  noteUsername: {
    fontSize: 14,
    color: "#4a5568",
    marginBottom: 8,
    fontWeight: "500",
  },
  noteContent: {
    fontSize: 16,
    color: "#2d3748",
    marginBottom: 8,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  noteDate: {
    fontSize: 12,
    color: "#718096",
  },
  noteTime: {
    fontSize: 12,
    color: "#718096",
    fontWeight: "500",
  },
}); 
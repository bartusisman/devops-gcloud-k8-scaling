import { View, Text, StyleSheet, FlatList, TextInput, Pressable, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { useNotes } from "../../context/NotesContext";
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { 
  FadeIn, 
  FadeOut, 
  SlideInDown, 
  SlideOutDown,
  Layout,
  BounceIn,
} from 'react-native-reanimated';

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

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function NotesScreen() {
  const { notes, loading, createNote, loadNotes } = useNotes();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

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
      setIsModalVisible(false);
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Community Notes</Text>
        <Ionicons name="newspaper-outline" size={24} color="#1a365d" />
      </View>

      <Animated.FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadNotes}
        contentContainerStyle={styles.listContent}
        style={styles.list}
        itemLayoutAnimation={Layout.springify()}
        renderItem={({ item, index }) => {
          const { date, time } = formatDateTime(item.timestamp);
          return (
            <Animated.View 
              entering={FadeIn.delay(index * 100)}
              layout={Layout.springify()}
              style={styles.noteCard}
            >
              <View style={styles.noteHeader}>
                <Text style={styles.noteTitle}>{item.title}</Text>
                <Text style={styles.noteUsername}>@{item.username}</Text>
              </View>
              <Text style={styles.noteContent}>{item.content}</Text>
              <View style={styles.noteFooter}>
                <Text style={styles.noteDate}>{date}</Text>
                <Text style={styles.noteTime}>{time}</Text>
              </View>
            </Animated.View>
          );
        }}
      />

      <AnimatedPressable 
        style={styles.fab}
        onPress={() => setIsModalVisible(true)}
        entering={BounceIn}
      >
        <View style={styles.fabContent}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.fabText}>New Note</Text>
        </View>
      </AnimatedPressable>

      <Modal
        visible={isModalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Animated.View 
          style={styles.modalOverlay}
          entering={FadeIn}
          exiting={FadeOut}
        >
          <BlurView intensity={20} style={styles.blurView}>
            <Animated.View 
              style={styles.modalContent}
              entering={SlideInDown.springify()}
              exiting={SlideOutDown.springify()}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Note</Text>
                <Pressable 
                  onPress={() => setIsModalVisible(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#4a5568" />
                </Pressable>
              </View>

              <TextInput
                style={styles.titleInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Note title..."
                placeholderTextColor="#718096"
              />

              <TextInput
                style={styles.contentInput}
                value={content}
                onChangeText={setContent}
                placeholder="Write your note..."
                placeholderTextColor="#718096"
                multiline
                textAlignVertical="top"
              />

              <Pressable 
                style={({ pressed }) => [
                  styles.createButton,
                  pressed && styles.createButtonPressed
                ]}
                onPress={handleCreateNote}
              >
                <Text style={styles.createButtonText}>Create Note</Text>
              </Pressable>
            </Animated.View>
          </BlurView>
        </Animated.View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7fafc",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a365d",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Increased padding for FAB
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    transform: [{ scale: 1 }],
  },
  noteHeader: {
    marginBottom: 12,
  },
  noteTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a365d",
    marginBottom: 4,
  },
  noteUsername: {
    fontSize: 14,
    color: "#4a5568",
    fontWeight: "500",
  },
  noteContent: {
    fontSize: 16,
    color: "#2d3748",
    marginBottom: 16,
    lineHeight: 24,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  noteDate: {
    fontSize: 13,
    color: "#718096",
  },
  noteTime: {
    fontSize: 13,
    color: "#718096",
    fontWeight: "500",
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#1a365d',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    transform: [{ scale: 1 }],
  },
  fabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  blurView: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a365d",
  },
  closeButton: {
    padding: 4,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: "500",
    color: "#2d3748",
    padding: 16,
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    marginBottom: 16,
  },
  contentInput: {
    fontSize: 16,
    color: "#2d3748",
    padding: 16,
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    marginBottom: 20,
    minHeight: 150,
  },
  createButton: {
    backgroundColor: '#1a365d',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    transform: [{ scale: 1 }],
  },
  createButtonPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#2c5282',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: "600",
  },
}); 
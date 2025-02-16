import { View, Text, StyleSheet, FlatList, Pressable, Alert, Modal, TextInput } from "react-native";
import { useState, useEffect } from "react";
import { useNotes } from "../../context/NotesContext";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, Layout, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Note } from "../../api/notes";

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

export default function ActivityScreen() {
  const { userNotes, loading, loadUserNotes, updateNote, deleteNote } = useNotes();
  const { session } = useAuth();
  const username = session?.user?.user_metadata?.username;

  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    loadUserNotes();
  }, []);

  const handleEdit = async () => {
    if (!editingNote) return;
    
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Content is required');
      return;
    }

    try {
      await updateNote(editingNote.id, { title: title.trim(), content });
      setEditingNote(null);
      setTitle("");
      setContent("");
      loadUserNotes();
    } catch (error) {
      Alert.alert('Error', 'Failed to update note');
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      loadUserNotes();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete note');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Notes</Text>
          <Text style={styles.subtitle}>@{username}</Text>
        </View>
        <Ionicons name="list-outline" size={24} color="#1a365d" />
      </View>

      <Animated.FlatList
        data={userNotes}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadUserNotes}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        itemLayoutAnimation={Layout.springify()}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color="#718096" style={styles.emptyIcon} />
            <Text style={styles.emptyText}>You haven't created any notes yet</Text>
            <Text style={styles.emptySubtext}>Your notes will appear here</Text>
          </View>
        )}
        renderItem={({ item, index }) => {
          const { date, time } = formatDateTime(item.timestamp);
          return (
            <Animated.View 
              entering={FadeIn.delay(index * 100)}
              layout={Layout.springify()}
              style={styles.noteCard}
            >
              <View style={styles.cardContent}>
                <View>
                  <View style={styles.titleRow}>
                    <Text style={styles.noteTitle}>{item.title}</Text>
                    <Pressable
                      onPress={() => {
                        Alert.alert(
                          'Note Options',
                          '',
                          [
                            {
                              text: 'Edit',
                              onPress: () => {
                                setEditingNote(item);
                                setTitle(item.title);
                                setContent(item.content);
                              },
                              style: 'default'
                            },
                            {
                              text: 'Delete',
                              onPress: () => {
                                Alert.alert(
                                  'Delete Note',
                                  'Are you sure you want to delete this note?',
                                  [
                                    { text: 'Cancel', style: 'cancel' },
                                    { 
                                      text: 'Delete', 
                                      onPress: () => handleDelete(item.id),
                                      style: 'destructive'
                                    },
                                  ]
                                );
                              },
                              style: 'destructive'
                            },
                            { text: 'Cancel', style: 'cancel' }
                          ]
                        );
                      }}
                      hitSlop={8}
                      style={styles.menuButton}
                    >
                      <Ionicons name="ellipsis-vertical" size={16} color="#4a5568" />
                    </Pressable>
                  </View>
                  <Text style={styles.noteContent} numberOfLines={4}>{item.content}</Text>
                </View>
                <View style={styles.cardFooter}>
                  <View style={styles.timeContainer}>
                    <Ionicons name="time-outline" size={12} color="#718096" /> 
                    <Text style={styles.noteDate}>{date}</Text>
                  </View>
                  <Text style={styles.noteTime}>{time}</Text>
                </View>
              </View>
            </Animated.View>
          );
        }}
      />

      <Modal
        visible={!!editingNote}
        transparent
        animationType="none"
        onRequestClose={() => {
          setEditingNote(null);
          setTitle("");
          setContent("");
        }}
      >
        <Animated.View 
          entering={FadeIn}
          style={styles.modalOverlay}
        >
          <BlurView intensity={20} style={styles.blurView}>
            <Animated.View 
              entering={SlideInDown.springify()}
              exiting={SlideOutDown.springify()}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Edit Note</Text>
                <Pressable 
                  onPress={() => {
                    setEditingNote(null);
                    setTitle("");
                    setContent("");
                  }}
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
                onPress={handleEdit}
              >
                <Text style={styles.createButtonText}>Save Changes</Text>
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#4a5568",
    fontWeight: "500",
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  noteCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
    flex: 1,
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a365d",
    flex: 1,
    marginRight: 12,
  },
  noteContent: {
    fontSize: 15,
    color: "#4a5568",
    lineHeight: 22,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: '#e2e8f0',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  noteDate: {
    fontSize: 13,
    color: "#718096",
    fontWeight: "500",
  },
  noteTime: {
    fontSize: 13,
    color: "#718096",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4a5568",
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: "#718096",
    textAlign: 'center',
  },
  menuButton: {
    padding: 4,
    backgroundColor: '#f7fafc',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
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
  },
  createButtonPressed: {
    backgroundColor: '#2c5282',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
}); 
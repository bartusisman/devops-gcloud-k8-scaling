import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Dimensions, Alert, TextInput } from "react-native";
import { useState, useEffect } from "react";
import { useNotes } from "../../context/NotesContext";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeIn, 
  Layout,
  BounceIn,
  FadeInDown,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Note } from "../../api/notes";

const { width } = Dimensions.get('window');
const GRID_PADDING = 12;
const CARD_MARGIN = 6;
const CARD_WIDTH = (width - GRID_PADDING * 2 - CARD_MARGIN * 4) / 2;
const CARD_HEIGHT = CARD_WIDTH * 1.2;

// Replace AnimatedPressable with Animated.createAnimatedComponent
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
  const { notes, loading, loadNotes, deleteNote, createNote, updateNote } = useNotes();
  const { session } = useAuth();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

  const handleDelete = async (noteId: string) => {
    try {
      await deleteNote(noteId);
      loadNotes();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete note');
    }
  };

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
      loadNotes();
    } catch (error) {
      Alert.alert('Error', 'Failed to create note');
    }
  };

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
      loadNotes();
    } catch (error) {
      Alert.alert('Error', 'Failed to update note');
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
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        renderItem={({ item, index }) => {
          const { time } = formatDateTime(item.timestamp);
          const isOwnNote = item.user_id === session?.user?.id;

          return (
            <Animated.View 
              entering={FadeInDown.delay(index * 100).springify()}
              layout={Layout.springify()}
              style={styles.noteCard}
            >
              <Pressable 
                style={styles.cardContent}
                onPress={() => setSelectedNote(item)}
              >
                <View>
                  <View style={styles.titleRow}>
                    <Text style={styles.noteTitle} numberOfLines={1}>{item.title}</Text>
                    {isOwnNote && (
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
                    )}
                  </View>
                  <Text style={styles.noteContent} numberOfLines={4}>{item.content}</Text>
                </View>
                <View style={styles.cardFooter}>
                  <Text style={styles.noteUsername}>@{item.username}</Text>
                  <Text style={styles.noteTime}>{time}</Text>
                </View>
              </Pressable>
            </Animated.View>
          );
        }}
      />

      <AnimatedPressable 
        style={styles.fab}
        onPress={() => setIsModalVisible(true)}
        entering={BounceIn}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.fabText}>New Note</Text>
      </AnimatedPressable>

      <Modal
        visible={!!selectedNote}
        transparent
        animationType="none"
        onRequestClose={() => setSelectedNote(null)}
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
              {selectedNote && (
                <>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>{selectedNote.title}</Text>
                    <Pressable 
                      onPress={() => setSelectedNote(null)}
                      style={styles.closeButton}
                    >
                      <Ionicons name="close" size={24} color="#4a5568" />
                    </Pressable>
                  </View>
                  <Text style={styles.modalUsername}>@{selectedNote.username}</Text>
                  <Text style={styles.modalText}>{selectedNote.content}</Text>
                  <Text style={styles.modalTime}>
                    {formatDateTime(selectedNote.timestamp).date} at {formatDateTime(selectedNote.timestamp).time}
                  </Text>
                </>
              )}
            </Animated.View>
          </BlurView>
        </Animated.View>
      </Modal>

      <Modal
        visible={isModalVisible || !!editingNote}
        transparent
        animationType="none"
        onRequestClose={() => {
          setIsModalVisible(false);
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
                <Text style={styles.modalTitle}>
                  {editingNote ? 'Edit Note' : 'Create Note'}
                </Text>
                <Pressable 
                  onPress={() => {
                    setIsModalVisible(false);
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
                onPress={editingNote ? handleEdit : handleCreateNote}
              >
                <Text style={styles.createButtonText}>
                  {editingNote ? 'Save Changes' : 'Create Note'}
                </Text>
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1a365d",
  },
  grid: {
    padding: GRID_PADDING,
    paddingBottom: 80,
  },
  row: {
    justifyContent: 'space-between',
  },
  noteCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    margin: CARD_MARGIN,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: '#e2e8f0',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a365d",
    flex: 1,
    marginRight: 8,
  },
  noteContent: {
    fontSize: 13,
    color: "#4a5568",
    lineHeight: 18,
  },
  noteUsername: {
    fontSize: 11,
    color: "#4a5568",
    fontWeight: "600",
  },
  noteTime: {
    fontSize: 11,
    color: "#718096",
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
  modalText: {
    fontSize: 16,
    color: "#2d3748",
    lineHeight: 24,
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  modalTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: "700",
    color: "#1a365d",
    marginRight: 16,
  },
  closeButton: {
    padding: 4,
  },
  modalUsername: {
    fontSize: 16,
    color: "#4a5568",
    fontWeight: "500",
    marginBottom: 16,
  },
  modalTime: {
    fontSize: 14,
    color: "#718096",
    textAlign: 'right',
  },
  fab: {
    position: 'absolute',
    left: 20,
    bottom: 20,
    backgroundColor: '#1a365d',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    gap: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: "600",
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
    color: '#fff',
    fontSize: 16,
    fontWeight: "600",
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
}); 
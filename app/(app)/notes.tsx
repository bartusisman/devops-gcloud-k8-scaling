import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Dimensions } from "react-native";
import { useState, useEffect } from "react";
import { useNotes } from "../../context/NotesContext";
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
  const { notes, loading, loadNotes } = useNotes();
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  useEffect(() => {
    loadNotes();
  }, []);

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
                <View style={styles.cardHeader}>
                  <Text style={styles.noteTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.noteUsername}>@{item.username}</Text>
                </View>
                <Text style={styles.noteContent} numberOfLines={4}>{item.content}</Text>
                <Text style={styles.noteTime}>{time}</Text>
              </Pressable>
            </Animated.View>
          );
        }}
      />

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
  cardHeader: {
    marginBottom: 6,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1a365d",
    marginBottom: 2,
  },
  noteContent: {
    fontSize: 13,
    color: "#4a5568",
    lineHeight: 18,
    flex: 1,
  },
  noteUsername: {
    fontSize: 11,
    color: "#4a5568",
    fontWeight: "600",
  },
  noteTime: {
    fontSize: 11,
    color: "#718096",
    marginTop: 6,
    textAlign: 'right',
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
}); 
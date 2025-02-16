import { View, Text, StyleSheet, FlatList } from "react-native";
import { useState, useEffect } from "react";
import { useNotes } from "../../context/NotesContext";
import { useAuth } from "../../context/AuthContext";
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, Layout } from 'react-native-reanimated';

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
  const { userNotes, loading, loadUserNotes } = useNotes();
  const { session } = useAuth();
  const username = session?.user?.user_metadata?.username;

  useEffect(() => {
    loadUserNotes();
  }, []);

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
              <View style={styles.noteHeader}>
                <Text style={styles.noteTitle}>{item.title}</Text>
                <Text style={styles.noteDate}>{date} at {time}</Text>
              </View>
              <Text style={styles.noteContent}>{item.content}</Text>
            </Animated.View>
          );
        }}
      />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  noteTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#1a365d",
    marginRight: 12,
  },
  noteContent: {
    fontSize: 16,
    color: "#2d3748",
    lineHeight: 24,
  },
  noteDate: {
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
}); 
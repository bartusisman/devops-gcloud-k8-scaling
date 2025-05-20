import React from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { useNotes } from '../../context/NotesContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import { Notification } from "../../context/NotesContext";

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

// NotificationItem component
const NotificationItem = ({ notification, onPress, index }: { notification: Notification, onPress: () => void, index: number }) => {
  const { time } = formatDateTime(notification.timestamp);
  
  return (
    <Animated.View
      entering={FadeInDown.springify()}
      layout={Layout.springify()}
      style={[
        styles.notificationItem,
        notification.read ? styles.readNotification : styles.unreadNotification
      ]}
    >
      <Pressable style={styles.notificationContent} onPress={onPress}>
        <View style={styles.notificationIcon}>
          <Ionicons 
            name={notification.read ? "notifications-outline" : "notifications"} 
            size={20} 
            color={notification.read ? "#718096" : "#3182ce"} 
          />
        </View>
        <View style={styles.notificationTextContainer}>
          <Text style={[
            styles.notificationTitle,
            notification.read ? styles.readText : styles.unreadText
          ]} numberOfLines={1}>
            New note: "{notification.title}"
          </Text>
          <Text style={styles.notificationTime}>{time}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default function NotificationsScreen() {
  const { notifications, markNotificationsAsRead, notes } = useNotes();
  const router = useRouter();
  
  // Ensure notifications array has unique items by ID
  const uniqueNotifications = React.useMemo(() => {
    const seen = new Set();
    return notifications.filter(item => {
      const duplicate = seen.has(item.id);
      seen.add(item.id);
      return !duplicate;
    });
  }, [notifications]);
  
  const handleNotificationPress = (noteId: string) => {
    // Find the note corresponding to this notification
    const note = notes.find(n => n.id === noteId);
    if (note) {
      // Mark as read
      markNotificationsAsRead();
      
      // Navigate back
      router.back();
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1a365d" />
          </Pressable>
          <Text style={styles.title}>Notifications</Text>
        </View>
        
        {uniqueNotifications.length > 0 && (
          <Pressable onPress={markNotificationsAsRead} style={styles.markAllReadButton}>
            <Text style={styles.markAllReadText}>Mark all as read</Text>
          </Pressable>
        )}
      </View>
      
      <FlatList
        data={uniqueNotifications}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.list}
        renderItem={({item, index}) => (
          <NotificationItem 
            notification={item} 
            onPress={() => handleNotificationPress(item.id)}
            index={index}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={48} color="#718096" />
            <Text style={styles.emptyText}>No notifications</Text>
          </View>
        )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a365d',
  },
  markAllReadButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#e6f7ff',
  },
  markAllReadText: {
    fontSize: 14,
    color: '#3182ce',
    fontWeight: '500',
  },
  list: {
    padding: 16,
  },
  notificationItem: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
  },
  readNotification: {
    backgroundColor: '#f7fafc',
    borderLeftColor: '#e2e8f0',
  },
  unreadNotification: {
    backgroundColor: '#fff',
    borderLeftColor: '#3182ce',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIcon: {
    marginRight: 12,
  },
  notificationTextContainer: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 15,
    marginBottom: 4,
  },
  readText: {
    color: '#718096',
    fontWeight: '400',
  },
  unreadText: {
    color: '#2d3748',
    fontWeight: '600',
  },
  notificationTime: {
    fontSize: 13,
    color: '#a0aec0',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#718096',
  },
}); 
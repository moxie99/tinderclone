import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { useMatches } from '@/context/AppContext';
import { Match } from '@/types';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

// Mock chat data
const mockMatches: Match[] = [
  {
    id: '1',
    users: ['current_user', 'alex_user'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    isActive: true,
    lastMessage: {
      id: 'msg1',
      matchId: '1',
      senderId: 'alex_user',
      content: 'Hey! How was your weekend?',
      timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      type: 'text',
      read: false,
    },
  },
  {
    id: '2',
    users: ['current_user', 'jordan_user'],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    isActive: true,
    lastMessage: {
      id: 'msg2',
      matchId: '2',
      senderId: 'current_user',
      content: 'Thanks for the great conversation!',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      type: 'text',
      read: true,
    },
  },
  {
    id: '3',
    users: ['current_user', 'sam_user'],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    isActive: true,
    lastMessage: {
      id: 'msg3',
      matchId: '3',
      senderId: 'sam_user',
      content: 'Looking forward to our coffee date! ☕',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      type: 'text',
      read: false,
    },
  },
];

// Mock user data for display
const mockUsers = {
  alex_user: { name: 'Alex', age: 25, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
  jordan_user: { name: 'Jordan', age: 28, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100' },
  sam_user: { name: 'Sam', age: 26, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
};

export default function ChatsScreen() {
  const router = useRouter();
  const { matches } = useMatches();
  const [searchQuery, setSearchQuery] = useState('');

  // Combine real matches with mock data for demo
  const allMatches = useMemo(() => {
    return [...matches, ...mockMatches];
  }, [matches]);

  // Filter matches based on search
  const filteredMatches = useMemo(() => {
    if (!searchQuery.trim()) return allMatches;
    
    return allMatches.filter(match => {
      const otherUserId = match.users.find(id => id !== 'current_user');
      const user = mockUsers[otherUserId as keyof typeof mockUsers];
      if (!user) return false;
      
      return user.name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [allMatches, searchQuery]);

  // Handle match press
  const handleMatchPress = useCallback((match: Match) => {
    router.push(`/chat/${match.id}`);
  }, [router]);

  // Format last message time
  const formatLastMessageTime = useCallback((timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return timestamp.toLocaleDateString();
  }, []);

  // Get other user info
  const getOtherUser = useCallback((match: Match) => {
    const otherUserId = match.users.find(id => id !== 'current_user');
    return mockUsers[otherUserId as keyof typeof mockUsers];
  }, []);

  // Render match item
  const renderMatchItem = useCallback(({ item: match }: { item: Match }) => {
    const otherUser = getOtherUser(match);
    if (!otherUser) return null;

    const isUnread = match.lastMessage && !match.lastMessage.read && match.lastMessage.senderId !== 'current_user';

    return (
      <TouchableOpacity
        style={[styles.matchItem, isUnread && styles.unreadMatchItem]}
        onPress={() => handleMatchPress(match)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: otherUser.avatar }}
            style={styles.avatar}
            contentFit="cover"
          />
          {isUnread && <View style={styles.unreadDot} />}
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText type="heading" variant="primary">
              {otherUser.name}, {otherUser.age}
            </ThemedText>
            {match.lastMessage && (
              <ThemedText type="caption" variant="secondary">
                {formatLastMessageTime(match.lastMessage.timestamp)}
              </ThemedText>
            )}
          </View>
          
          {match.lastMessage && (
            <ThemedText 
              type="body"
              variant={isUnread ? "primary" : "secondary"}
              numberOfLines={1}
            >
              {match.lastMessage.content}
            </ThemedText>
          )}
        </View>

        {/* Unread indicator */}
        {isUnread && <View style={styles.unreadIndicator} />}
      </TouchableOpacity>
    );
  }, [getOtherUser, handleMatchPress, formatLastMessageTime]);

  // Empty state
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <ThemedText type="title" variant="primary">No matches yet</ThemedText>
      <ThemedText type="body" variant="secondary">
        Start swiping to find your perfect match!
      </ThemedText>
    </View>
  ), [])

  return (
    <SafeAreaWrapper>
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <ThemedText type="title" variant="primary" style={styles.titleText}>Chats</ThemedText>
          </View>
        </View>

        {/* Matches list */}
        <FlatList
          data={filteredMatches}
          keyExtractor={(item) => item.id}
          renderItem={renderMatchItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />
      </ThemedView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  titleContainer: {
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 8,
  },
  titleText: {
    lineHeight: 40,
  },
  listContainer: {
    flexGrow: 1,
    paddingTop: 4,
    paddingBottom: 20,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderBottomWidth: 0,
  },
  unreadMatchItem: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  unreadDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FF6B6B',
    borderWidth: 2,
    borderColor: 'white',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
});

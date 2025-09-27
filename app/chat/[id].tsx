import { ChatInput } from '@/components/chat/ChatInput';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { Message } from '@/types';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';


// Mock messages data
const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: 'msg1',
      matchId: '1',
      senderId: 'alex_user',
      content: 'Hey! How was your weekend?',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      type: 'text',
      read: false,
    },
    {
      id: 'msg2',
      matchId: '1',
      senderId: 'current_user',
      content: 'It was amazing! Went hiking in the mountains 🏔️',
      timestamp: new Date(Date.now() - 1 * 60 * 1000),
      type: 'text',
      read: true,
    },
    {
      id: 'msg3',
      matchId: '1',
      senderId: 'alex_user',
      content: 'That sounds incredible! I love hiking too. Which trail did you take?',
      timestamp: new Date(Date.now() - 30 * 1000),
      type: 'text',
      read: false,
    },
  ],
  '2': [
    {
      id: 'msg4',
      matchId: '2',
      senderId: 'jordan_user',
      content: 'Thanks for the great conversation!',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      type: 'text',
      read: true,
    },
    {
      id: 'msg5',
      matchId: '2',
      senderId: 'current_user',
      content: 'You too! Looking forward to meeting up soon.',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      type: 'text',
      read: true,
    },
  ],
  '3': [
    {
      id: 'msg6',
      matchId: '3',
      senderId: 'sam_user',
      content: 'Looking forward to our coffee date! ☕',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      type: 'text',
      read: false,
    },
  ],
};

// Mock user data
const mockUsers = {
  alex_user: { name: 'Alex', age: 25, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
  jordan_user: { name: 'Jordan', age: 28, avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100' },
  sam_user: { name: 'Sam', age: 26, avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
};

export default function ChatScreen() {
  const { id, userName, userAge, userAvatar } = useLocalSearchParams<{ 
    id: string;
    userName?: string;
    userAge?: string;
    userAvatar?: string;
  }>();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Get other user info
  const otherUser = React.useMemo(() => {
    // Check if it's a new match (from the card stack)
    if (id && id.startsWith('match_')) {
      // Use the passed user data from navigation parameters
      return {
        name: userName || 'New Match',
        age: userAge ? parseInt(userAge) : 25,
        avatar: userAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
      };
    }
    
    // For existing chats, use the user map
    const userMap: Record<string, keyof typeof mockUsers> = {
      '1': 'alex_user',
      '2': 'jordan_user',
      '3': 'sam_user',
    };
    const userId = userMap[id];
    return userId ? mockUsers[userId] : null;
  }, [id]);

  // Load messages
  useEffect(() => {
    if (id && mockMessages[id]) {
      setMessages(mockMessages[id]);
    } else if (id && id.startsWith('match_')) {
      // For new matches, start with an empty conversation
      setMessages([]);
    }
  }, [id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  // Handle send message
  const handleSendMessage = useCallback((content: string) => {
    if (!id || !content.trim()) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      matchId: id,
      senderId: 'current_user',
      content: content.trim(),
      timestamp: new Date(),
      type: 'text',
      read: false,
    };

    setMessages(prev => [...prev, newMessage]);

    // Simulate typing indicator and response
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responseMessage: Message = {
        id: `msg_${Date.now()}_response`,
        matchId: id,
        senderId: otherUser ? Object.keys(mockUsers).find(key => mockUsers[key as keyof typeof mockUsers] === otherUser) || 'alex_user' : 'alex_user',
        content: "That's interesting! Tell me more about it.",
        timestamp: new Date(),
        type: 'text',
        read: false,
      };
      setMessages(prev => [...prev, responseMessage]);
    }, 2000);
  }, [id, otherUser]);

  // Render message item
  const renderMessage = useCallback(({ item: message }: { item: Message }) => {
    const isCurrentUser = message.senderId === 'current_user';
    
    return (
      <MessageBubble
        message={message}
        isCurrentUser={isCurrentUser}
        showTimestamp={true}
      />
    );
  }, []);

  // Render typing indicator
  const renderTypingIndicator = useCallback(() => {
    if (!isTyping) return null;

    return (
      <View style={styles.typingContainer}>
        <ThemedView style={styles.typingBubble}>
          <ThemedText style={styles.typingText}>
            {otherUser?.name} is typing...
          </ThemedText>
        </ThemedView>
      </View>
    );
  }, [isTyping, otherUser]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);


  if (!otherUser) {
    return (
      <SafeAreaWrapper>
        <ThemedView style={styles.container}>
          <ThemedText type="body" variant="error">Chat not found</ThemedText>
        </ThemedView>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header with user info and back button */}
        <ThemedView style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <ThemedText type="title" variant="accent">←</ThemedText>
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Image
              source={{ uri: otherUser.avatar }}
              style={styles.headerAvatar}
              contentFit="cover"
            />
            <View style={styles.headerInfo}>
              <ThemedText type="heading" variant="primary">
                {otherUser.name}, {otherUser.age}
              </ThemedText>
              <ThemedText type="caption" variant="success">
                Online
              </ThemedText>
            </View>
          </View>
        </ThemedView>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item: { id: any; }) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={renderTypingIndicator}
      />

        {/* Input */}
        <ChatInput
          onSendMessage={handleSendMessage}
          placeholder={`Message ${otherUser.name}...`}
        />
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  messagesContainer: {
    paddingVertical: 16,
    flexGrow: 1,
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  typingBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    maxWidth: '75%',
  },
  typingText: {
    fontSize: 16,
    opacity: 0.7,
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});

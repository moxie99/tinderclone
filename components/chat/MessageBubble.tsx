import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Message } from '@/types';
import React, { memo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  showAvatar?: boolean;
  showTimestamp?: boolean;
  onPress?: () => void;
}

// Memoized message bubble component with advanced animations
export const MessageBubble = memo<MessageBubbleProps>(({ 
  message, 
  isCurrentUser, 
  showAvatar = false,
  showTimestamp = true,
  onPress 
}) => {
  const colorScheme = useColorScheme();
  // Animation values
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  // Animate in on mount
  React.useEffect(() => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    opacity.value = withTiming(1, { duration: 300 });
    translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
  }, [scale, opacity, translateY]);

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: translateY.value },
    ],
    opacity: opacity.value,
  }));

  // Get message bubble style based on sender
  const getBubbleStyle = () => {
    if (isCurrentUser) {
      return [styles.bubble, styles.currentUserBubble, { backgroundColor: Colors[colorScheme ?? 'light'].tint }];
    }
    return [styles.bubble, styles.otherUserBubble, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }];
  };

  // Get text style based on sender
  const getTextStyle = () => {
    if (isCurrentUser) {
      return [styles.messageText, styles.currentUserText];
    }
    return [styles.messageText, styles.otherUserText, { color: Colors[colorScheme ?? 'light'].text }];
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <ThemedView 
        style={getBubbleStyle()}
        onTouchEnd={onPress}
      >
        {/* Message content */}
        <ThemedText style={getTextStyle()}>
          {message.content}
        </ThemedText>

        {/* Timestamp */}
        {showTimestamp && (
          <ThemedText style={[
            styles.timestamp,
            isCurrentUser ? styles.currentUserTimestamp : styles.otherUserTimestamp
          ]}>
            {formatTimestamp(message.timestamp)}
          </ThemedText>
        )}

        {/* Read status for current user messages */}
        {isCurrentUser && (
          <View style={styles.readStatus}>
            <ThemedText style={styles.readStatusText}>
              {message.read ? '✓✓' : '✓'}
            </ThemedText>
          </View>
        )}
      </ThemedView>
    </Animated.View>
  );
});

MessageBubble.displayName = 'MessageBubble';

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  bubble: {
    maxWidth: SCREEN_WIDTH * 0.75,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentUserBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.light.tint,
    borderBottomRightRadius: 4,
  },
  otherUserBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  currentUserText: {
    color: 'white',
  },
  otherUserText: {
    color: Colors.light.text,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  currentUserTimestamp: {
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'right',
  },
  otherUserTimestamp: {
    color: Colors.light.text,
    textAlign: 'left',
  },
  readStatus: {
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  readStatusText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
});

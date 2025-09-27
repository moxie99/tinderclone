import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useCards, useMatches } from '@/context/AppContext';
import { SwipeAction, User } from '@/types';
import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { Alert, Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle
} from 'react-native-reanimated';
import { SimpleSwipeCard } from './SimpleSwipeCard';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.7;
const MAX_VISIBLE_CARDS = 3;

interface SwipeableCardStackProps {
  onCardPress: (user: User) => void;
  onEmptyStack?: () => void;
}

// Memoized card stack component with advanced layering and animations
export const SwipeableCardStack = memo<SwipeableCardStackProps>(({ 
  onCardPress, 
  onEmptyStack 
}) => {
  const { cards, addSwipe, hasCards } = useCards();
  const { addMatch } = useMatches();

  // Get visible cards (max 3 for performance)
  const visibleCards = useMemo(() => 
    cards.slice(0, MAX_VISIBLE_CARDS), 
    [cards]
  );

  // Handle swipe actions with sophisticated logic
  const handleSwipe = useCallback((action: SwipeAction) => {
    // Add swipe to history
    addSwipe(action);
    
    // Simulate match logic (in real app, this would be API call)
    if (action.type === 'like' && Math.random() > 0.7) {
      // Simulate match
      const match = {
        id: `match_${Date.now()}`,
        users: [action.userId, 'current_user_id'] as [string, string],
        createdAt: new Date(),
        isActive: true,
      };
      addMatch(match);
      
      // Show match animation/alert
      Alert.alert('🎉 It\'s a Match!', 'You and this person liked each other!');
    }
  }, [addSwipe, addMatch]);

  // Handle card press
  const handleCardPress = useCallback((user: User) => {
    onCardPress(user);
  }, [onCardPress]);

  // Check if stack is empty
  useEffect(() => {
    if (cards.length === 0 && onEmptyStack) {
      onEmptyStack();
    }
  }, [cards.length, onEmptyStack]);

  // Animated styles for each card layer
  const getCardStyle = useCallback((index: number) => {
    return useAnimatedStyle(() => {
      const scale = interpolate(
        index,
        [0, 1, 2],
        [1, 0.95, 0.9],
        Extrapolate.CLAMP
      );
      
      const translateY = interpolate(
        index,
        [0, 1, 2],
        [0, 10, 20],
        Extrapolate.CLAMP
      );
      
      const opacity = interpolate(
        index,
        [0, 1, 2],
        [1, 0.8, 0.6],
        Extrapolate.CLAMP
      );
      
      return {
        transform: [
          { scale },
          { translateY },
        ],
        opacity,
        zIndex: MAX_VISIBLE_CARDS - index,
      };
    });
  }, []);

  // Empty state component
  const EmptyState = memo(() => (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText style={styles.emptyTitle}>No more cards!</ThemedText>
      <ThemedText style={styles.emptySubtitle}>
        Check back later for new people to discover
      </ThemedText>
    </ThemedView>
  ));

  // Loading state component
  const LoadingState = memo(() => (
    <ThemedView style={styles.loadingContainer}>
      <ThemedText style={styles.loadingText}>Loading new cards...</ThemedText>
    </ThemedView>
  ));

  if (!hasCards) {
    return <EmptyState />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.stackContainer}>
        {visibleCards.map((user, index) => (
          <Animated.View
            key={user.id}
            style={[
              styles.cardWrapper,
              getCardStyle(index),
            ]}
          >
            <SimpleSwipeCard
              user={user}
              onSwipe={handleSwipe}
              onPress={() => handleCardPress(user)}
              index={index}
            />
          </Animated.View>
        ))}
      </View>
    </View>
  );
});

SwipeableCardStack.displayName = 'SwipeableCardStack';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  stackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  cardWrapper: {
    position: 'absolute',
    width: SCREEN_WIDTH - 40,
    height: CARD_HEIGHT,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    opacity: 0.7,
  },
});

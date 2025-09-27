import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useCards, useMatches } from '@/context/AppContext';
import { useMatchModal } from '@/context/MatchModalContext';
import { SwipeAction, User } from '@/types';
import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { SimpleSwipeCard } from './SimpleSwipeCard';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.7;
const MAX_VISIBLE_CARDS = 3;

interface SimpleCardStackProps {
  onCardPress: (user: User) => void;
  onEmptyStack?: () => void;
}

/**
 * Simple and robust card stack implementation
 * No complex hooks or animations to prevent crashes
 */
export const SimpleCardStack = memo<SimpleCardStackProps>(({ 
  onCardPress, 
  onEmptyStack 
}) => {
  const { cards, addSwipe, hasCards } = useCards();
  const { addMatch } = useMatches();
  const { showMatchModal } = useMatchModal();
  
  // Get visible cards (max 3 for performance)
  const visibleCards = useMemo(() => 
    cards.slice(0, MAX_VISIBLE_CARDS), 
    [cards]
  );

  // Handle swipe actions with simple logic
  const handleSwipe = useCallback((action: SwipeAction) => {
    try {
      // Add swipe to history
      addSwipe(action);
      
      // Simulate match logic (in real app, this would be API call)
      if (action.type === 'like' && Math.random() > 0.7) {
        // Find the matched user
        const matchedUser = cards.find(card => card.id === action.userId);
        
        if (matchedUser) {
          // Simulate match
          const match = {
            id: `match_${Date.now()}`,
            users: [action.userId, 'current_user_id'] as [string, string],
            createdAt: new Date(),
            isActive: true,
          };
          addMatch(match);
          
          // Show beautiful match modal
          showMatchModal(matchedUser);
        }
      }
    } catch (error) {
      console.warn('Swipe handling error:', error);
    }
  }, [addSwipe, addMatch, showMatchModal, cards]);

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

  // Empty state component
  const EmptyState = memo(() => (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText type="title" variant="primary">No more cards!</ThemedText>
      <ThemedText type="body" variant="secondary">
        Check back later for new people to discover
      </ThemedText>
    </ThemedView>
  ));

  // Loading state component
  const LoadingState = memo(() => (
    <ThemedView style={styles.loadingContainer}>
      <ThemedText type="body" variant="secondary">Loading new cards...</ThemedText>
    </ThemedView>
  ));

  if (!hasCards) {
    return <EmptyState />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.stackContainer}>
        {visibleCards.map((user, index) => (
          <View
            key={user.id}
            style={[
              styles.cardWrapper,
              {
                transform: [
                  { scale: 1 - index * 0.05 },
                  { translateY: index * 10 },
                ],
                opacity: 1 - index * 0.1,
                zIndex: MAX_VISIBLE_CARDS - index,
              },
            ]}
          >
            <SimpleSwipeCard
              user={user}
              onSwipe={handleSwipe}
              onPress={() => handleCardPress(user)}
              index={index}
            />
          </View>
        ))}
      </View>
    </View>
  );
});

SimpleCardStack.displayName = 'SimpleCardStack';

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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

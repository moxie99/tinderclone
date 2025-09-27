import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSwipeGestureSimple } from '@/hooks/useSwipeGestureSimple';
import { SwipeAction, User } from '@/types';
import { Image } from 'expo-image';
import React, { memo, useCallback } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.7;

interface UserCardProps {
  user: User;
  onSwipe: (action: SwipeAction) => void;
  onPress: () => void;
  style?: any;
  index?: number;
}

// Memoized card component for performance
export const UserCard = memo<UserCardProps>(({ 
  user, 
  onSwipe, 
  onPress, 
  style, 
  index = 0 
}) => {
  const colorScheme = useColorScheme();
  // Shared values for card positioning and layering
  const cardScale = useSharedValue(1 - index * 0.05);
  const cardTranslateY = useSharedValue(index * 10);
  const cardOpacity = useSharedValue(1 - index * 0.1);

  // Swipe gesture hook
  const {
    panGesture,
    animatedStyle,
    likeOverlayStyle,
    passOverlayStyle,
    superlikeOverlayStyle,
    reset,
  } = useSwipeGestureSimple({
    onSwipe: useCallback((action: SwipeAction) => {
      onSwipe({ ...action, userId: user.id });
    }, [onSwipe, user.id]),
    onSwipeStart: useCallback(() => {
      // Add haptic feedback here
    }, []),
    onSwipeEnd: useCallback(() => {
      // Add haptic feedback here
    }, []),
  });

  // Animated style for card layering effect
  const cardLayerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: cardScale.value },
      { translateY: cardTranslateY.value },
    ],
    opacity: cardOpacity.value,
  }));

  // Overlay components for swipe feedback
  const LikeOverlay = memo(() => (
    <Animated.View style={[styles.overlay, styles.likeOverlay, likeOverlayStyle]}>
      <ThemedText style={styles.overlayText}>LIKE</ThemedText>
    </Animated.View>
  ));

  const PassOverlay = memo(() => (
    <Animated.View style={[styles.overlay, styles.passOverlay, passOverlayStyle]}>
      <ThemedText style={styles.overlayText}>PASS</ThemedText>
    </Animated.View>
  ));

  const SuperlikeOverlay = memo(() => (
    <Animated.View style={[styles.overlay, styles.superlikeOverlay, superlikeOverlayStyle]}>
      <ThemedText style={styles.overlayText}>SUPER LIKE</ThemedText>
    </Animated.View>
  ));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.card, cardLayerStyle, animatedStyle, style]}>
        {/* Main card content */}
        <ThemedView style={styles.cardContent}>
          {/* User photos with lazy loading */}
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: user.photos[0]?.url }}
              style={styles.primaryImage}
              contentFit="cover"
              transition={200}
              placeholder={require('@/assets/images/icon.png')}
              cachePolicy="memory-disk"
            />
            
            {/* Additional photos indicator */}
            {user.photos.length > 1 && (
              <View style={styles.photoCountBadge}>
                <ThemedText style={styles.photoCountText}>
                  +{user.photos.length - 1}
                </ThemedText>
              </View>
            )}
          </View>

          {/* User info */}
          <View style={styles.userInfo}>
            <View style={styles.nameRow}>
              <ThemedText style={styles.name}>
                {user.name}, {user.age}
              </ThemedText>
              {user.verified && (
                <View style={styles.verifiedBadge}>
                  <ThemedText style={styles.verifiedText}>✓</ThemedText>
                </View>
              )}
            </View>
            
            <ThemedText style={styles.bio} numberOfLines={2}>
              {user.bio}
            </ThemedText>
            
            <View style={styles.locationRow}>
              <ThemedText style={styles.location}>
                📍 {user.location.city}, {user.location.state}
              </ThemedText>
            </View>
          </View>

          {/* Interests tags */}
          <View style={styles.interestsContainer}>
            {user.interests.slice(0, 3).map((interest, idx) => (
              <View key={idx} style={styles.interestTag}>
                <ThemedText style={styles.interestText}>{interest}</ThemedText>
              </View>
            ))}
            {user.interests.length > 3 && (
              <View style={styles.interestTag}>
                <ThemedText style={styles.interestText}>
                  +{user.interests.length - 3} more
                </ThemedText>
              </View>
            )}
          </View>
        </ThemedView>

        {/* Swipe feedback overlays */}
        <LikeOverlay />
        <PassOverlay />
        <SuperlikeOverlay />
      </Animated.View>
    </GestureDetector>
  );
});

UserCard.displayName = 'UserCard';

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - 40,
    height: CARD_HEIGHT,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  cardContent: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  primaryImage: {
    width: '100%',
    height: '100%',
  },
  photoCountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  photoCountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  userInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginRight: 8,
  },
  verifiedBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bio: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
    lineHeight: 20,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  interestTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  interestText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  likeOverlay: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  passOverlay: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
  },
  superlikeOverlay: {
    backgroundColor: 'rgba(33, 150, 243, 0.8)',
  },
  overlayText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

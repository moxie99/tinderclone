import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SwipeAction, User } from '@/types';
import { Image } from 'expo-image';
import React, { memo, useCallback } from 'react';
import { Animated, Dimensions, PanResponder, StyleSheet, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_HEIGHT = SCREEN_HEIGHT * 0.7;

interface SimpleSwipeCardProps {
  user: User;
  onSwipe: (action: SwipeAction) => void;
  onPress: () => void;
  style?: any;
  index?: number;
}

/**
 * Simple and robust swipe card implementation
 * Uses PanResponder instead of complex gesture handling
 */
export const SimpleSwipeCard = memo<SimpleSwipeCardProps>(({ 
  user, 
  onSwipe, 
  onPress, 
  style, 
  index = 0 
}) => {
  const colorScheme = useColorScheme();

  // Animated values - using useRef to prevent hook dependency issues
  const pan = React.useRef(new Animated.ValueXY()).current;
  const scale = React.useRef(new Animated.Value(1 - index * 0.05)).current;
  const opacity = React.useRef(new Animated.Value(1 - index * 0.1)).current;

  // Pan responder for swipe gestures with error handling
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      // Optional: Add haptic feedback
    },
    onPanResponderMove: (_, gestureState) => {
      try {
        pan.setValue({ x: gestureState.dx, y: gestureState.dy });
      } catch (error) {
        console.warn('Pan move error:', error);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      try {
        const { dx, dy, vx, vy } = gestureState;
        const threshold = SCREEN_WIDTH * 0.25;
        
        // Determine swipe action
        let action: SwipeAction['type'] | null = null;
        
        if (dy < -100 || vy < -1000) {
          action = 'superlike';
        } else if (dx > threshold || vx > 1000) {
          action = 'like';
        } else if (dx < -threshold || vx < -1000) {
          action = 'pass';
        }
        
        if (action) {
          // Animate card off screen
          const exitDirection = action === 'like' ? SCREEN_WIDTH : -SCREEN_WIDTH;
          Animated.parallel([
            Animated.timing(pan, {
              toValue: { x: exitDirection, y: dy },
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start((finished) => {
            if (finished) {
              try {
                onSwipe({
                  type: action!,
                  userId: user.id,
                  timestamp: new Date(),
                });
              } catch (error) {
                console.warn('Swipe callback error:', error);
              }
            }
          });
        } else {
          // Return to center
          Animated.parallel([
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              useNativeDriver: true,
            }),
            Animated.spring(opacity, {
              toValue: 1 - index * 0.1,
              useNativeDriver: true,
            }),
          ]).start();
        }
      } catch (error) {
        console.warn('Pan release error:', error);
        // Reset to center on error
        pan.setValue({ x: 0, y: 0 });
        opacity.setValue(1 - index * 0.1);
      }
    },
  });

  // Card press handler
  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: scale },
          ],
          opacity: opacity,
          backgroundColor: Colors[colorScheme ?? 'light'].cardBackground,
        },
        style,
      ]}
      {...panResponder.panHandlers}
    >
      <ThemedView style={styles.cardContent}>
        {/* User photos with gradient overlay */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: user.photos[0]?.url }}
            style={styles.primaryImage}
            contentFit="cover"
            transition={200}
            placeholder={require('@/assets/images/icon.png')}
            cachePolicy="memory-disk"
          />
          
          {/* Gradient overlay for better text readability */}
          <View style={styles.gradientOverlay} />
          
          {/* Additional photos indicator */}
          {user.photos.length > 1 && (
            <View style={styles.photoCountBadge}>
              <ThemedText style={styles.photoCountText}>
                +{user.photos.length - 1}
              </ThemedText>
            </View>
          )}
        </View>

        {/* User info with better spacing */}
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <ThemedText type="heading" variant="primary" style={styles.name}>
              {user.name}, {user.age}
            </ThemedText>
            {user.verified && (
              <View style={styles.verifiedBadge}>
                <ThemedText type="caption" variant="success">✓</ThemedText>
              </View>
            )}
          </View>
          
          <ThemedText type="body" variant="primary" style={styles.bio}>
            {user.bio}
          </ThemedText>
          
          <View style={styles.locationRow}>
            <ThemedText type="body" variant="secondary" style={styles.location}>
              📍 {user.location.city}, {user.location.state}
            </ThemedText>
          </View>
        </View>

        {/* Interests tags with better layout */}
        <View style={styles.interestsContainer}>
          {user.interests.slice(0, 4).map((interest, idx) => (
            <View key={idx} style={[
              styles.interestTag,
              { 
                backgroundColor: 'rgba(0,0,0,0.8)',
                borderColor: 'rgba(255,255,255,0.3)'
              }
            ]}>
              <ThemedText type="caption" variant="primary" style={styles.interestText}>
                {interest}
              </ThemedText>
            </View>
          ))}
          {user.interests.length > 4 && (
            <View style={[
              styles.interestTag,
              { 
                backgroundColor: 'rgba(0,0,0,0.8)',
                borderColor: 'rgba(255,255,255,0.3)'
              }
            ]}>
              <ThemedText type="caption" variant="primary" style={styles.interestText}>
                +{user.interests.length - 4} more
              </ThemedText>
            </View>
          )}
        </View>
      </ThemedView>

      {/* Swipe feedback overlays with better positioning */}
      <View style={[styles.overlay, styles.likeOverlay]}>
        <View style={styles.overlayContent}>
          <ThemedText style={styles.overlayText}>LIKE</ThemedText>
        </View>
      </View>
      <View style={[styles.overlay, styles.passOverlay]}>
        <View style={styles.overlayContent}>
          <ThemedText style={styles.overlayText}>PASS</ThemedText>
        </View>
      </View>
      <View style={[styles.overlay, styles.superlikeOverlay]}>
        <View style={styles.overlayContent}>
          <ThemedText style={styles.overlayText}>SUPERLIKE</ThemedText>
        </View>
      </View>
    </Animated.View>
  );
});

SimpleSwipeCard.displayName = 'SimpleSwipeCard';

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - 40,
    height: CARD_HEIGHT,
    borderRadius: 20,
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
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  photoCountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  verifiedBadge: {
    marginLeft: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4ADE80',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bio: {
    fontSize: 16,
    color: 'white',
    lineHeight: 22,
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  locationRow: {
    marginBottom: 16,
  },
  location: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 8,
    gap: 8,
  },
  interestTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  interestText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
  },
  overlayContent: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 3,
  },
  likeOverlay: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  passOverlay: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  superlikeOverlay: {
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
  },
  overlayText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { User } from '@/types';
import { useRouter } from 'expo-router';
import React, { memo, useCallback, useEffect } from 'react';
import { Dimensions, Modal, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MatchModalProps {
  visible: boolean;
  onClose: () => void;
  matchedUser: User | null;
}

/**
 * Beautiful, pixel-perfect match modal with smooth animations
 * Tinder-like design with heart animations and gradient effects
 */
export const MatchModal = memo<MatchModalProps>(({ 
  visible, 
  onClose, 
  matchedUser 
}) => {
  const colorScheme = useColorScheme();
  const router = useRouter();
  
  // Animation values
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const heartScale = useSharedValue(0);
  const heartRotation = useSharedValue(0);
  const backgroundOpacity = useSharedValue(0);
  const userImageScale = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0);

  // Start animations when modal becomes visible
  useEffect(() => {
    if (visible) {
      // Simple animations to prevent black screen
      backgroundOpacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      heartScale.value = withSpring(1, { damping: 15, stiffness: 150 });
      userImageScale.value = withSpring(1, { damping: 15, stiffness: 150 });
      textOpacity.value = withTiming(1, { duration: 200 });
      buttonScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    } else {
      // Reset animations
      scale.value = 0;
      opacity.value = 0;
      heartScale.value = 0;
      heartRotation.value = 0;
      backgroundOpacity.value = 0;
      userImageScale.value = 0;
      textOpacity.value = 0;
      buttonScale.value = 0;
    }
  }, [visible]);

  // Animated styles
  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const heartStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: heartScale.value },
      { rotate: `${heartRotation.value}deg` },
    ],
  }));

  const userImageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: userImageScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleClose = useCallback(() => {
    // Animate out before closing
    scale.value = withTiming(0, { duration: 200 });
    opacity.value = withTiming(0, { duration: 200 });
    backgroundOpacity.value = withTiming(0, { duration: 200 });
    
    setTimeout(() => {
      onClose();
    }, 200);
  }, [onClose, scale, opacity, backgroundOpacity]);

  const handleSendMessage = useCallback(() => {
    // Navigate to chat with the matched user
    handleClose();
    // Create a new match ID for the chat
    const matchId = `match_${matchedUser?.id}`;
    // Pass the matched user data as navigation parameters
    router.push({
      pathname: `/chat/${matchId}`,
      params: {
        userName: matchedUser?.name,
        userAge: matchedUser?.age?.toString(),
        userAvatar: matchedUser?.photos[0]?.url,
      }
    });
  }, [handleClose, router, matchedUser]);

  if (!matchedUser) return null;

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.simpleContainer}>
        <View style={styles.simpleModal}>
          <ThemedText style={styles.simpleTitle}>It's a Match!</ThemedText>
          <ThemedText style={styles.simpleSubtitle}>
            You and {matchedUser.name} liked each other
          </ThemedText>
          
          <View style={styles.simpleButtons}>
            <TouchableOpacity
              style={styles.simpleButton}
              onPress={handleSendMessage}
            >
              <ThemedText style={styles.simpleButtonText}>Send Message</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.simpleButton}
              onPress={handleClose}
            >
              <ThemedText style={styles.simpleButtonText}>Keep Swiping</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

MatchModal.displayName = 'MatchModal';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: SCREEN_WIDTH * 0.9,
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  heartContainer: {
    marginBottom: 30,
  },
  heart: {
    fontSize: 80,
    textAlign: 'center',
  },
  matchTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  matchSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    color: '#666',
  },
  userImagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  userImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  currentUserImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 4,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  userImage: {
    width: '100%',
    height: '100%',
  },
  heartIcon: {
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIconText: {
    fontSize: 40,
  },
  buttonsContainer: {
    width: '100%',
    gap: 16,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  sendMessageButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sendMessageButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  keepSwipingButton: {
    // Border styles applied inline
  },
  keepSwipingButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  simpleContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  simpleModal: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 40,
    margin: 20,
    alignItems: 'center',
  },
  simpleTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  simpleSubtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 32,
    textAlign: 'center',
  },
  simpleButtons: {
    width: '100%',
    gap: 16,
  },
  simpleButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
  },
  simpleButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

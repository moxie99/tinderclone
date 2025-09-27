import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { memo, useCallback, useRef, useState } from 'react';
import { Keyboard, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

// Advanced chat input with animations and features
export const ChatInput = memo<ChatInputProps>(({ 
  onSendMessage, 
  placeholder = "Type a message...",
  disabled = false 
}) => {
  const colorScheme = useColorScheme();
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  // Animation values
  const inputScale = useSharedValue(1);
  const sendButtonScale = useSharedValue(0);
  const inputHeight = useSharedValue(44);
  
  const inputRef = useRef<TextInput>(null);

  // Handle input focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    inputScale.value = withSpring(1.02, { damping: 15, stiffness: 150 });
    inputHeight.value = withTiming(100, { duration: 200 });
  }, [inputScale, inputHeight]);

  // Handle input blur
  const handleBlur = useCallback(() => {
    setIsFocused(false);
    inputScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    inputHeight.value = withTiming(44, { duration: 200 });
  }, [inputScale, inputHeight]);

  // Handle text change
  const handleTextChange = useCallback((text: string) => {
    setMessage(text);
    
    // Animate send button based on text length
    if (text.length > 0) {
      sendButtonScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    } else {
      sendButtonScale.value = withSpring(0, { damping: 15, stiffness: 150 });
    }
  }, [sendButtonScale]);

  // Handle send message
  const handleSend = useCallback(() => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      sendButtonScale.value = withSpring(0, { damping: 15, stiffness: 150 });
      Keyboard.dismiss();
    }
  }, [message, onSendMessage, disabled, sendButtonScale]);

  // Handle submit (Enter key)
  const handleSubmit = useCallback(() => {
    handleSend();
  }, [handleSend]);

  // Animated styles
  const inputContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputScale.value }],
    height: inputHeight.value,
  }));

  const sendButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendButtonScale.value }],
    opacity: interpolate(sendButtonScale.value, [0, 1], [0, 1], Extrapolate.CLAMP),
  }));

  const sendButtonTextStyle = useAnimatedStyle(() => ({
    opacity: interpolate(sendButtonScale.value, [0, 1], [0, 1], Extrapolate.CLAMP),
  }));

  return (
    <ThemedView style={styles.container}>
      <Animated.View style={[
        styles.inputContainer, 
        inputContainerStyle,
        { backgroundColor: Colors[colorScheme ?? 'light'].borderColor + '20' }
      ]}>
        {/* Text input */}
        <TextInput
          ref={inputRef}
          style={[
            styles.textInput,
            isFocused && styles.focusedInput,
            { 
              color: Colors[colorScheme ?? 'light'].text,
              backgroundColor: 'transparent',
            }
          ]}
          value={message}
          onChangeText={handleTextChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmitEditing={handleSubmit}
          placeholder={placeholder}
          placeholderTextColor={Colors[colorScheme ?? 'light'].text + '80'}
          multiline
          maxLength={500}
          editable={!disabled}
          returnKeyType="default"
          blurOnSubmit={false}
        />

        {/* Send button */}
        <Animated.View style={[styles.sendButton, sendButtonStyle]}>
          <TouchableOpacity
            style={styles.sendButtonTouchable}
            onPress={handleSend}
            disabled={!message.trim() || disabled}
            activeOpacity={0.7}
          >
            <Animated.View style={sendButtonTextStyle}>
              <ThemedText style={styles.sendButtonText}>
                Send
              </ThemedText>
            </Animated.View>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Character count */}
      {message.length > 0 && (
        <View style={styles.characterCount}>
          <ThemedText style={styles.characterCountText}>
            {message.length}/500
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
});

ChatInput.displayName = 'ChatInput';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
    maxHeight: 100,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: 8,
    paddingHorizontal: 0,
    textAlignVertical: 'top',
  },
  focusedInput: {
    // Additional styles when focused
  },
  sendButton: {
    marginLeft: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  sendButtonTouchable: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  characterCount: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  characterCountText: {
    fontSize: 12,
    color: Colors.light.text,
    opacity: 0.6,
  },
});

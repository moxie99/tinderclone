import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderTopColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 85 : 80,
          paddingBottom: Platform.OS === 'ios' ? 25 : 20,
          paddingTop: 12,
          paddingHorizontal: 16,
          // Add extra margin for Android navigation buttons
          marginBottom: Platform.OS === 'android' ? 8 : 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
          marginBottom: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 8,
          minHeight: 50,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              size={focused ? 28 : 24} 
              name={focused ? "heart" : "heart-outline"} 
              color={color} 
            />
          ),
        }}
      />
          <Tabs.Screen
            name="chats"
            options={{
              title: 'Chats',
              tabBarIcon: ({ color, focused }) => (
                <Ionicons 
                  size={focused ? 28 : 24} 
                  name={focused ? "chatbubbles" : "chatbubbles-outline"} 
                  color={color} 
                />
              ),
            }}
          />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              size={focused ? 28 : 24} 
              name={focused ? "person" : "person-outline"} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}

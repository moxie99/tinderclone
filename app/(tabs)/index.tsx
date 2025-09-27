import { SimpleCardStack } from '@/components/cards/SimpleCardStack';
import { LoadingStates } from '@/components/LoadingStates';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { useAppState, useCards } from '@/context/AppContext';
import { User } from '@/types';
import React, { useCallback, useEffect } from 'react';
import { StyleSheet } from 'react-native';

// Mock data for demonstration with professional Unsplash images
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah',
    age: 25,
    bio: 'Adventure seeker and coffee enthusiast. Love hiking, photography, and trying new restaurants.',
    photos: [
      { id: '1', url: 'https://images.unsplash.com/photo-1635080472002-ca760a070e37?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8UG9ydHJhaXQlMjBiZWF1dGlmdWwlMjBsYWRpZXN8ZW58MHx8MHx8fDA%3D', alt: 'Profile photo', isPrimary: true, order: 0 },
      { id: '2', url: 'https://images.unsplash.com/photo-1645143151714-2045a9a3c830?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8UG9ydHJhaXQlMjBiZWF1dGlmdWwlMjBsYWRpZXN8ZW58MHx8MHx8fDA%3D', alt: 'Adventure photo', isPrimary: false, order: 1 },
    ],
    location: {
      city: 'San Francisco',
      state: 'CA',
      country: 'USA',
      coordinates: { latitude: 37.7749, longitude: -122.4194 }
    },
    interests: ['Photography', 'Hiking', 'Coffee', 'Travel'],
    verified: true,
    lastActive: new Date(),
  },
  {
    id: '2',
    name: 'Alex',
    age: 28,
    bio: 'Software engineer by day, chef by night. Love cooking, coding, and exploring new cuisines.',
    photos: [
      { id: '3', url: 'https://images.unsplash.com/photo-1645143151591-36edd14da050?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8UG9ydHJhaXQlMjBiZWF1dGlmdWwlMjBsYWRpZXN8ZW58MHx8MHx8fDA%3D', alt: 'Profile photo', isPrimary: true, order: 0 },
    ],
    location: {
      city: 'Seattle',
      state: 'WA',
      country: 'USA',
      coordinates: { latitude: 47.6062, longitude: -122.3321 }
    },
    interests: ['Cooking', 'Technology', 'Gaming', 'Music'],
    verified: false,
    lastActive: new Date(),
  },
  {
    id: '3',
    name: 'Emma',
    age: 23,
    bio: 'Artist and free spirit. Love painting, dancing, and spontaneous adventures.',
    photos: [
      { id: '4', url: 'https://images.unsplash.com/photo-1645143077850-f2b15914f4e0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fFBvcnRyYWl0JTIwYmVhdXRpZnVsJTIwbGFkaWVzfGVufDB8fDB8fHww', alt: 'Profile photo', isPrimary: true, order: 0 },
      { id: '5', url: 'https://images.unsplash.com/photo-1647957864251-255a78d97850?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8UG9ydHJhaXQlMjBiZWF1dGlmdWwlMjBsYWRpZXN8ZW58MHx8MHx8fDA%3D', alt: 'Art photo', isPrimary: false, order: 1 },
    ],
    location: {
      city: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      coordinates: { latitude: 34.0522, longitude: -118.2437 }
    },
    interests: ['Art', 'Dancing', 'Music', 'Travel'],
    verified: true,
    lastActive: new Date(),
  },
  {
    id: '4',
    name: 'Michael',
    age: 30,
    bio: 'Entrepreneur and fitness enthusiast. Always looking for new challenges and adventures.',
    photos: [
      { id: '6', url: 'https://images.unsplash.com/photo-1666979600252-0417c65706e6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8UG9ydHJhaXQlMjBoYW5kc29tZSUyMG1lbnxlbnwwfHwwfHx8MA%3D%3D', alt: 'Profile photo', isPrimary: true, order: 0 },
    ],
    location: {
      city: 'New York',
      state: 'NY',
      country: 'USA',
      coordinates: { latitude: 40.7128, longitude: -74.0060 }
    },
    interests: ['Fitness', 'Business', 'Travel', 'Reading'],
    verified: true,
    lastActive: new Date(),
  },
  {
    id: '5',
    name: 'Jessica',
    age: 26,
    bio: 'Yoga instructor and wellness coach. Passionate about healthy living and mindfulness.',
    photos: [
      { id: '7', url: 'https://images.unsplash.com/photo-1598547461182-45d03f6661e4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8UG9ydHJhaXQlMjBoYW5kc29tZSUyMG1lbnxlbnwwfHwwfHx8MA%3D%3D', alt: 'Profile photo', isPrimary: true, order: 0 },
      { id: '8', url: 'https://images.unsplash.com/photo-1656005947222-206f8d571974?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fFBvcnRyYWl0JTIwaGFuZHNvbWUlMjBtZW58ZW58MHx8MHx8fDA%3D', alt: 'Yoga photo', isPrimary: false, order: 1 },
    ],
    location: {
      city: 'Austin',
      state: 'TX',
      country: 'USA',
      coordinates: { latitude: 30.2672, longitude: -97.7431 }
    },
    interests: ['Yoga', 'Wellness', 'Meditation', 'Nature'],
    verified: true,
    lastActive: new Date(),
  },
  {
    id: '6',
    name: 'David',
    age: 32,
    bio: 'Photographer and world traveler. Capturing moments and exploring new cultures.',
    photos: [
      { id: '9', url: 'https://images.unsplash.com/photo-1551393195-ba272fed3a7d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fFBvcnRyYWl0JTIwaGFuZHNvbWUlMjBtZW58ZW58MHx8MHx8fDA%3D', alt: 'Profile photo', isPrimary: true, order: 0 },
    ],
    location: {
      city: 'Miami',
      state: 'FL',
      country: 'USA',
      coordinates: { latitude: 25.7617, longitude: -80.1918 }
    },
    interests: ['Photography', 'Travel', 'Art', 'Music'],
    verified: true,
    lastActive: new Date(),
  },
];

export default function HomeScreen() {
  const { cards, setCards } = useCards();
  const { loading, setLoading } = useAppState();

  // Load mock data on component mount
  useEffect(() => {
    const loadCards = async () => {
      setLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCards(mockUsers);
      setLoading(false);
    };

    if (cards.length === 0) {
      loadCards();
    }
  }, [cards.length, setCards, setLoading]);

  const handleCardPress = useCallback((user: User) => {
    console.log('Card pressed:', user.name);
    // Navigate to user profile
  }, []);

  const handleEmptyStack = useCallback(() => {
    console.log('No more cards!');
    // Load more cards or show empty state
  }, []);

  if (loading) {
    return (
      <SafeAreaWrapper>
        <LoadingStates type="cards" message="Finding new people..." />
      </SafeAreaWrapper>
    );
  }

      return (
        <SafeAreaWrapper>
          <SimpleCardStack
            onCardPress={handleCardPress}
            onEmptyStack={handleEmptyStack}
          />
        </SafeAreaWrapper>
      );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

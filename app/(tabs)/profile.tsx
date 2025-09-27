import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SafeAreaWrapper } from '@/components/ui/SafeAreaWrapper';
import { useUser } from '@/context/AppContext';
import { Image } from 'expo-image';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

// Mock current user data
const mockCurrentUser = {
  id: 'current_user',
  name: 'Your Name',
  age: 24,
  bio: 'Love traveling, photography, and trying new restaurants. Looking for someone to share adventures with!',
  photos: [
    { id: '1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', alt: 'Profile photo', isPrimary: true, order: 0 },
    { id: '2', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400', alt: 'Travel photo', isPrimary: false, order: 1 },
    { id: '3', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', alt: 'Hiking photo', isPrimary: false, order: 2 },
  ],
  location: {
    city: 'San Francisco',
    state: 'CA',
    country: 'USA',
    coordinates: { latitude: 37.7749, longitude: -122.4194 }
  },
  interests: ['Photography', 'Travel', 'Food', 'Hiking', 'Coffee', 'Art'],
  verified: true,
  lastActive: new Date(),
};

export default function ProfileScreen() {
  const { user, setUser } = useUser();
  const [isEditing, setIsEditing] = useState(false);

  // Initialize user data if not set
  React.useEffect(() => {
    if (!user) {
      setUser(mockCurrentUser);
    }
  }, [user, setUser]);

  // Handle edit profile
  const handleEditProfile = useCallback(() => {
    Alert.alert(
      'Edit Profile',
      'This would open the profile editing screen in a real app.',
      [{ text: 'OK' }]
    );
  }, []);

  // Handle photo press
  const handlePhotoPress = useCallback((photoIndex: number) => {
    Alert.alert(
      'Photo Options',
      'This would open photo options in a real app.',
      [
        { text: 'View', onPress: () => console.log('View photo') },
        { text: 'Edit', onPress: () => console.log('Edit photo') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  }, []);

  // Handle interest press
  const handleInterestPress = useCallback((interest: string) => {
    Alert.alert(
      'Interest',
      `This would show more about "${interest}" in a real app.`,
      [{ text: 'OK' }]
    );
  }, []);

  if (!user) {
    return (
      <SafeAreaWrapper>
        <ThemedView style={styles.container}>
          <ThemedText type="body" variant="secondary">Loading profile...</ThemedText>
        </ThemedView>
      </SafeAreaWrapper>
    );
  }

  return (
    <SafeAreaWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title" variant="primary">Profile</ThemedText>
          <TouchableOpacity onPress={handleEditProfile} style={styles.editButton}>
            <ThemedText type="body" variant="accent" style={styles.editButtonText}>Edit</ThemedText>
          </TouchableOpacity>
        </ThemedView>

      {/* Profile Photos */}
      <View style={styles.photosSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photosContainer}
        >
          {user.photos.map((photo, index) => (
            <TouchableOpacity
              key={photo.id}
              onPress={() => handlePhotoPress(index)}
              style={styles.photoContainer}
            >
              <Image
                source={{ uri: photo.url }}
                style={styles.photo}
                contentFit="cover"
              />
              {photo.isPrimary && (
                <View style={styles.primaryBadge}>
                  <ThemedText style={styles.primaryBadgeText}>Main</ThemedText>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* User Info */}
      <ThemedView style={styles.infoSection}>
        <View style={styles.nameRow}>
          <ThemedText type="heading" variant="primary">
            {user.name}, {user.age}
          </ThemedText>
          {user.verified && (
            <View style={styles.verifiedBadge}>
              <ThemedText type="caption" variant="success">✓</ThemedText>
            </View>
          )}
        </View>
        
        <ThemedText type="body" variant="primary">
          {user.bio}
        </ThemedText>
        
        <View style={styles.locationRow}>
          <ThemedText type="body" variant="secondary">
            📍 {user.location.city}, {user.location.state}
          </ThemedText>
        </View>
      </ThemedView>

      {/* Interests */}
      <ThemedView style={styles.interestsSection}>
        <ThemedText type="subtitle" variant="primary">Interests</ThemedText>
        <View style={styles.interestsContainer}>
          {user.interests.map((interest, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleInterestPress(interest)}
              style={styles.interestTag}
            >
              <ThemedText type="caption" variant="primary">{interest}</ThemedText>
            </TouchableOpacity>
          ))}
        </View>
      </ThemedView>

      {/* Stats */}
      <ThemedView style={styles.statsSection}>
        <ThemedText type="subtitle" variant="primary">Your Stats</ThemedText>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText type="title" variant="accent">24</ThemedText>
            <ThemedText type="caption" variant="secondary">Matches</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="title" variant="accent">156</ThemedText>
            <ThemedText type="caption" variant="secondary">Likes</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="title" variant="accent">89%</ThemedText>
            <ThemedText type="caption" variant="secondary">Match Rate</ThemedText>
          </View>
        </View>
      </ThemedView>

      {/* Settings */}
      <ThemedView style={styles.settingsSection}>
        <ThemedText type="subtitle" variant="primary">Settings</ThemedText>
        <TouchableOpacity style={styles.settingItem}>
          <ThemedText type="body" variant="primary">Notifications</ThemedText>
          <ThemedText type="body" variant="secondary">›</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <ThemedText type="body" variant="primary">Privacy</ThemedText>
          <ThemedText type="body" variant="secondary">›</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <ThemedText type="body" variant="primary">Account</ThemedText>
          <ThemedText type="body" variant="secondary">›</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  editButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  photosSection: {
    paddingVertical: 20,
  },
  photosContainer: {
    paddingHorizontal: 20,
  },
  photoContainer: {
    position: 'relative',
    marginRight: 16,
  },
  photo: {
    width: 120,
    height: 160,
    borderRadius: 12,
  },
  primaryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  primaryBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
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
    lineHeight: 22,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  location: {
    fontSize: 14,
    opacity: 0.7,
  },
  interestsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  interestText: {
    fontSize: 14,
    fontWeight: '500',
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  settingsSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingText: {
    fontSize: 16,
  },
  settingArrow: {
    fontSize: 18,
    opacity: 0.5,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});

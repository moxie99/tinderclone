// Core domain types for the Tinder clone
export interface User {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: Photo[];
  location: Location;
  interests: string[];
  verified: boolean;
  lastActive: Date;
}

export interface Photo {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  order: number;
}

export interface Location {
  city: string;
  state: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface Match {
  id: string;
  users: [string, string]; // User IDs
  createdAt: Date;
  lastMessage?: Message;
  isActive: boolean;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'gif';
  read: boolean;
}

export interface SwipeAction {
  type: 'like' | 'pass' | 'superlike';
  userId: string;
  timestamp: Date;
}

// State management types
export interface AppState {
  user: User | null;
  cards: User[];
  matches: Match[];
  swipeHistory: SwipeAction[];
  loading: boolean;
  error: string | null;
}

export type AppAction =
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_CARDS'; payload: User[] }
  | { type: 'ADD_MATCH'; payload: Match }
  | { type: 'ADD_SWIPE'; payload: SwipeAction }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET_STATE' };

// Animation and gesture types
export interface CardGestureState {
  translateX: number;
  translateY: number;
  rotation: number;
  scale: number;
}

export interface SwipeThresholds {
  like: number;
  pass: number;
  superlike: number;
}

// Component prop types
export interface CardProps {
  user: User;
  onSwipe: (action: SwipeAction) => void;
  onPress: () => void;
  style?: any;
}

export interface SwipeableCardStackProps {
  users: User[];
  onSwipe: (action: SwipeAction) => void;
  onCardPress: (user: User) => void;
  threshold?: SwipeThresholds;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Navigation types
export type RootStackParamList = {
  '(tabs)': undefined;
  modal: undefined;
  profile: { userId: string };
  chat: { matchId: string };
};

export type TabParamList = {
  index: undefined;
  explore: undefined;
  matches: undefined;
  profile: undefined;
};

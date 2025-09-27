import { useColorScheme } from '@/hooks/use-color-scheme';
import { AppAction, AppState, Match, SwipeAction, User } from '@/types';
import React, { createContext, useCallback, useContext, useEffect, useReducer } from 'react';

// Initial state
const initialState: AppState = {
  user: null,
  cards: [],
  matches: [],
  swipeHistory: [],
  loading: false,
  error: null,
};

// Reducer with sophisticated state management
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        error: null,
      };
    
    case 'SET_CARDS':
      return {
        ...state,
        cards: action.payload,
        loading: false,
        error: null,
      };
    
    case 'ADD_MATCH':
      return {
        ...state,
        matches: [action.payload, ...state.matches],
      };
    
    case 'ADD_SWIPE':
      return {
        ...state,
        swipeHistory: [action.payload, ...state.swipeHistory],
        cards: state.cards.slice(1), // Remove the swiped card
      };
    
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
        error: action.payload ? null : state.error,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
}

// Context type
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // Action creators with memoization
  setUser: (user: User) => void;
  setCards: (cards: User[]) => void;
  addMatch: (match: Match) => void;
  addSwipe: (swipe: SwipeAction) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetState: () => void;
  // Computed values
  hasCards: boolean;
  hasMatches: boolean;
  isAuthenticated: boolean;
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component with performance optimizations
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const colorScheme = useColorScheme();

  // Memoized action creators to prevent unnecessary re-renders
  const setUser = useCallback((user: User) => {
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  const setCards = useCallback((cards: User[]) => {
    dispatch({ type: 'SET_CARDS', payload: cards });
  }, []);

  const addMatch = useCallback((match: Match) => {
    dispatch({ type: 'ADD_MATCH', payload: match });
  }, []);

  const addSwipe = useCallback((swipe: SwipeAction) => {
    dispatch({ type: 'ADD_SWIPE', payload: swipe });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  // Computed values
  const hasCards = state.cards.length > 0;
  const hasMatches = state.matches.length > 0;
  const isAuthenticated = state.user !== null;

  // Persist state to AsyncStorage (in a real app)
  useEffect(() => {
    // This would typically save to AsyncStorage
    // For demo purposes, we'll skip this implementation
  }, [state.user, state.matches]);

  const contextValue: AppContextType = {
    state,
    dispatch,
    setUser,
    setCards,
    addMatch,
    addSwipe,
    setLoading,
    setError,
    resetState,
    hasCards,
    hasMatches,
    isAuthenticated,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook with error boundary
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

// Specialized hooks for specific parts of state
export function useUser() {
  const { state, setUser, isAuthenticated } = useApp();
  return {
    user: state.user,
    setUser,
    isAuthenticated,
  };
}

export function useCards() {
  const { state, setCards, addSwipe, hasCards } = useApp();
  return {
    cards: state.cards,
    setCards,
    addSwipe,
    hasCards,
  };
}

export function useMatches() {
  const { state, addMatch, hasMatches } = useApp();
  return {
    matches: state.matches,
    addMatch,
    hasMatches,
  };
}

export function useAppState() {
  const { state, setLoading, setError } = useApp();
  return {
    loading: state.loading,
    error: state.error,
    setLoading,
    setError,
  };
}

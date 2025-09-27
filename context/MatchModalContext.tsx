import { User } from '@/types';
import React, { createContext, useCallback, useContext, useState } from 'react';

interface MatchModalContextType {
  isVisible: boolean;
  matchedUser: User | null;
  showMatchModal: (user: User) => void;
  hideMatchModal: () => void;
}

const MatchModalContext = createContext<MatchModalContextType | undefined>(undefined);

export function MatchModalProvider({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);

  const showMatchModal = useCallback((user: User) => {
    setMatchedUser(user);
    setIsVisible(true);
  }, []);

  const hideMatchModal = useCallback(() => {
    setIsVisible(false);
    setMatchedUser(null);
  }, []);

  return (
    <MatchModalContext.Provider
      value={{
        isVisible,
        matchedUser,
        showMatchModal,
        hideMatchModal,
      }}
    >
      {children}
    </MatchModalContext.Provider>
  );
}

export function useMatchModal() {
  const context = useContext(MatchModalContext);
  if (context === undefined) {
    throw new Error('useMatchModal must be used within a MatchModalProvider');
  }
  return context;
}

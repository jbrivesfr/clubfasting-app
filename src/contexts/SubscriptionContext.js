import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { checkSubscriptionStatus } from '../services/subscription';

const SubscriptionContext = createContext({});

export const SubscriptionProvider = ({ children }) => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [expiresAt, setExpiresAt] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubscription();
    } else {
      setIsPremium(false);
      setExpiresAt(null);
      setLoading(false);
    }
  }, [user]);

  const loadSubscription = async () => {
    try {
      const status = await checkSubscriptionStatus(user.id);
      setIsPremium(status.isPremium);
      setExpiresAt(status.expiresAt);
    } catch (error) {
      console.error('Subscription check error:', error);
      setIsPremium(false);
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscription = () => {
    loadSubscription();
  };

  return (
    <SubscriptionContext.Provider value={{
      isPremium,
      expiresAt,
      loading,
      refreshSubscription
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);

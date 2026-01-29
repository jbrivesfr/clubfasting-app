import { Platform } from 'react-native';
import { supabase } from './supabase';

let InAppPurchases = {
  connectAsync: async () => {},
  getProductsAsync: async () => ({ results: [] }),
  purchaseItemAsync: async () => {},
  getPurchaseHistoryAsync: async () => ({ results: [] }),
  finishTransactionAsync: async () => {},
  disconnectAsync: async () => {},
};

if (Platform.OS !== 'web') {
  try {
    InAppPurchases = require('expo-in-app-purchases');
  } catch (e) {
    console.warn("Could not require expo-in-app-purchases", e);
  }
}

// Product IDs (à configurer dans App Store Connect / Play Console)
export const PRODUCTS = {
  MONTHLY: 'clubfasting_premium_monthly',
  YEARLY: 'clubfasting_premium_yearly'
};

/**
 * Initialize IAP connection
 */
export const initializeIAP = async () => {
  try {
    await InAppPurchases.connectAsync();
    console.log('IAP connected');
  } catch (error) {
    console.error('IAP connection error:', error);
    throw error;
  }
};

/**
 * Get available products
 */
export const getProducts = async () => {
  try {
    const { results } = await InAppPurchases.getProductsAsync([
      PRODUCTS.MONTHLY,
      PRODUCTS.YEARLY
    ]);
    return results;
  } catch (error) {
    console.error('Get products error:', error);
    return [];
  }
};

/**
 * Purchase a product
 */
export const purchaseProduct = async (productId) => {
  try {
    await InAppPurchases.purchaseItemAsync(productId);
  } catch (error) {
    console.error('Purchase error:', error);
    throw error;
  }
};

/**
 * Restore purchases
 */
export const restorePurchases = async () => {
  try {
    const { results } = await InAppPurchases.getPurchaseHistoryAsync();
    return results;
  } catch (error) {
    console.error('Restore error:', error);
    throw error;
  }
};

/**
 * Check user subscription status from Supabase
 * @param {string} userId
 * @returns {Promise<object>} { isPremium, expiresAt }
 */
export const checkSubscriptionStatus = async (userId) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    return { isPremium: false, expiresAt: null };
  }

  const now = new Date();
  const expiresAt = new Date(data.expires_at);
  const isPremium = expiresAt > now;

  return { isPremium, expiresAt: data.expires_at };
};

/**
 * Finish transaction (call after receipt verification)
 */
export const finishTransaction = async (purchase) => {
  await InAppPurchases.finishTransactionAsync(purchase, true);
};

/**
 * Disconnect IAP (cleanup)
 */
export const disconnectIAP = async () => {
  await InAppPurchases.disconnectAsync();
};

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Button, Card, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { getProducts, purchaseProduct, restorePurchases, initializeIAP } from '../../services/subscription';
import { theme } from '../../utils/theme';

export default function PaywallScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadProducts();

    return () => {
      // Cleanup handled in service
    };
  }, []);

  const loadProducts = async () => {
    try {
      await initializeIAP();
      const prods = await getProducts();
      setProducts(prods);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger les abonnements');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (productId) => {
    setPurchasing(true);
    try {
      await purchaseProduct(productId);
      Alert.alert('Succès', 'Abonnement activé!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Erreur', 'Achat annulé ou échoué');
      console.error(error);
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    try {
      const purchases = await restorePurchases();
      if (purchases && purchases.length > 0) {
        Alert.alert('Succès', 'Achats restaurés!');
      } else {
        Alert.alert('Info', 'Aucun achat à restaurer');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de restaurer les achats');
      console.error(error);
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🚀 Passez Premium</Text>
      <Text style={styles.subtitle}>
        Débloquez toutes les fonctionnalités pour maximiser vos résultats
      </Text>

      <View style={styles.features}>
        <Text style={styles.featureTitle}>Fonctionnalités Premium:</Text>
        <Text style={styles.feature}>✅ Statistiques avancées</Text>
        <Text style={styles.feature}>✅ Graphiques détaillés</Text>
        <Text style={styles.feature}>✅ Plans de jeûne personnalisés</Text>
        <Text style={styles.feature}>✅ Support prioritaire</Text>
        <Text style={styles.feature}>✅ Pas de publicités</Text>
      </View>

      <View style={styles.plans}>
        {products.map(product => (
          <Card key={product.productId} style={styles.planCard}>
            <Card.Content>
              <Text style={styles.planTitle}>{product.title}</Text>
              <Text style={styles.planPrice}>{product.priceString}</Text>
              <Text style={styles.planDescription}>{product.description}</Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => handlePurchase(product.productId)}
                loading={purchasing}
                disabled={purchasing}
                style={styles.purchaseButton}
              >
                S'abonner
              </Button>
            </Card.Actions>
          </Card>
        ))}
      </View>

      <Button
        mode="text"
        onPress={handleRestore}
        loading={purchasing}
        disabled={purchasing}
        style={styles.restoreButton}
      >
        Restaurer mes achats
      </Button>

      <Text style={styles.disclaimer}>
        L'abonnement sera facturé sur votre compte App Store/Play Store.
        Annulez à tout moment dans les paramètres de votre compte.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: theme.colors.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    marginBottom: 30,
  },
  features: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: theme.colors.text,
  },
  feature: {
    fontSize: 16,
    marginBottom: 10,
    color: theme.colors.text,
  },
  plans: {
    marginBottom: 20,
  },
  planCard: {
    marginBottom: 15,
    elevation: 4,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  planPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 5,
  },
  planDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  purchaseButton: {
    flex: 1,
  },
  restoreButton: {
    marginVertical: 10,
  },
  disclaimer: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 20,
  },
});

export const SUBSCRIPTION_PLANS = {
  MONTHLY: {
    id: 'monthly_premium',
    name: 'Mensuel',
    price: '11,99€',
    priceNum: 11.99,
    duration: 'par mois',
    productId: {
      ios: 'com.clubfasting.monthly',
      android: 'monthly_premium'
    }
  },
  QUARTERLY: {
    id: 'quarterly_premium',
    name: 'Trimestriel',
    price: '29,99€',
    priceNum: 29.99,
    duration: 'tous les 3 mois',
    savings: '17%',
    productId: {
      ios: 'com.clubfasting.quarterly',
      android: 'quarterly_premium'
    }
  },
  ANNUAL: {
    id: 'annual_premium',
    name: 'Annuel',
    price: '99,99€',
    priceNum: 99.99,
    duration: 'par an',
    savings: '30%',
    badge: 'Meilleur rapport',
    productId: {
      ios: 'com.clubfasting.annual',
      android: 'annual_premium'
    }
  }
}

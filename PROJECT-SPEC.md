# CLUBFASTING APP - PROJECT SPECIFICATION

**Repo:** jbrivesfr/clubfasting-app (React Native)
**Backend:** jbrivesfr/superclub (PHP + Supabase)
**Date:** 2026-01-28

---

## 🎯 OBJECTIF

Créer une app mobile React Native (iOS + Android) pour ClubFasting qui utilise le même backend Supabase que le site web actuel.

**Features MVP:**
1. Authentication (login/signup)
2. Feed public (posts + comments)
3. Créer posts + commentaires
4. Profile utilisateur
5. Paywall + In-App Purchase (abonnement)
6. Premium content lock/unlock

---

## 🏗️ ARCHITECTURE

### Stack Technique

```
React Native (Expo)
├─ Supabase JS SDK (auth + database)
├─ React Navigation (navigation)
├─ React Native Paper (UI components)
├─ Expo In-App Purchases (subscriptions)
└─ Expo Image Picker (upload photos)
```

### Backend (Existing)

```
Supabase (PostgreSQL)
├─ Tables: users, comments, clubindex, series, subscriptions
├─ Auth: Supabase Auth (JWT tokens)
├─ Storage: Supabase Storage (images)
└─ API: REST API + Real-time subscriptions
```

---

## 📁 STRUCTURE PROJET

```
clubfasting-app/
├── App.js                      # Entry point
├── app.json                    # Expo config
├── package.json
├── babel.config.js
│
├── src/
│   ├── screens/                # Screens
│   │   ├── Auth/
│   │   │   ├── LoginScreen.js
│   │   │   ├── SignupScreen.js
│   │   │   └── ForgotPasswordScreen.js
│   │   ├── Feed/
│   │   │   ├── FeedScreen.js
│   │   │   ├── PostDetailScreen.js
│   │   │   └── CreatePostScreen.js
│   │   ├── Profile/
│   │   │   ├── ProfileScreen.js
│   │   │   └── EditProfileScreen.js
│   │   └── Premium/
│   │       ├── PaywallScreen.js
│   │       └── SubscriptionScreen.js
│   │
│   ├── components/             # Reusable components
│   │   ├── PostCard.js
│   │   ├── CommentItem.js
│   │   ├── Avatar.js
│   │   ├── PremiumBadge.js
│   │   └── LoadingSpinner.js
│   │
│   ├── navigation/             # Navigation
│   │   ├── AppNavigator.js
│   │   ├── AuthNavigator.js
│   │   └── MainNavigator.js
│   │
│   ├── services/               # Services
│   │   ├── supabase.js         # Supabase client
│   │   ├── auth.js             # Auth functions
│   │   ├── feed.js             # Feed API calls
│   │   ├── subscriptions.js   # Subscription logic
│   │   └── storage.js          # Image upload
│   │
│   ├── hooks/                  # Custom hooks
│   │   ├── useAuth.js
│   │   ├── useFeed.js
│   │   └── useSubscription.js
│   │
│   ├── utils/                  # Utilities
│   │   ├── constants.js
│   │   ├── theme.js
│   │   └── helpers.js
│   │
│   └── contexts/               # Context providers
│       ├── AuthContext.js
│       └── SubscriptionContext.js
│
├── assets/                     # Assets
│   ├── images/
│   ├── fonts/
│   └── icons/
│
└── docs/                       # Documentation
    ├── API.md
    ├── SETUP.md
    └── DEPLOYMENT.md
```

---

## 🔐 AUTHENTICATION

### Flow

```
1. User opens app → Check if logged in (Supabase session)
2. If not → Show Login/Signup screens
3. Login → Supabase Auth with email/password
4. Store session → AsyncStorage
5. Navigate to main app
```

### Implementation

```javascript
// src/services/auth.js
import { supabase } from './supabase'

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signUp = async (email, password, name) => {
  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  })
  
  if (authError) return { error: authError }
  
  // 2. Create profile in users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert([
      { 
        id: authData.user.id,
        email,
        name,
        status: 'FREE'
      }
    ])
  
  return { data: authData, error: userError }
}

export const signOut = async () => {
  return await supabase.auth.signOut()
}

export const getCurrentUser = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user || null
}
```

---

## 📱 FEED SYSTEM

### Data Model

```javascript
// Post structure
{
  id: bigint,
  created_at: timestamp,
  author_name: text,
  author_email: text,
  content: text,
  title: text,
  image_urls: array,
  user_id: uuid,
  is_pinned: boolean,
  likes: integer,
  replies: integer,
  type: 'post' // vs 'comment'
}

// Comment structure (same table, type='comment')
{
  id: bigint,
  parent_id: bigint,  // Post ID
  content: text,
  user_id: uuid,
  author_name: text,
  created_at: timestamp
}
```

### Feed Screen

```javascript
// src/screens/Feed/FeedScreen.js
import { useFeed } from '../../hooks/useFeed'

export default function FeedScreen() {
  const { posts, loading, refresh, loadMore } = useFeed()
  
  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => <PostCard post={item} />}
      onRefresh={refresh}
      refreshing={loading}
      onEndReached={loadMore}
      onEndReachedThreshold={0.5}
    />
  )
}
```

### useFeed Hook

```javascript
// src/hooks/useFeed.js
import { useState, useEffect } from 'react'
import { getFeed } from '../services/feed'

export const useFeed = () => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  
  const loadFeed = async (pageNum = 1) => {
    setLoading(true)
    const { data, error } = await getFeed(pageNum)
    if (data) {
      if (pageNum === 1) {
        setPosts(data)
      } else {
        setPosts([...posts, ...data])
      }
    }
    setLoading(false)
  }
  
  useEffect(() => {
    loadFeed()
  }, [])
  
  const refresh = () => loadFeed(1)
  const loadMore = () => loadFeed(page + 1)
  
  return { posts, loading, refresh, loadMore }
}
```

### Feed Service

```javascript
// src/services/feed.js
import { supabase } from './supabase'

const POSTS_PER_PAGE = 20

export const getFeed = async (page = 1) => {
  const start = (page - 1) * POSTS_PER_PAGE
  const end = start + POSTS_PER_PAGE - 1
  
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      users!inner (
        name,
        avatar_url,
        status
      )
    `)
    .eq('type', 'post')
    .is('parent_id', null)
    .order('created_at', { ascending: false })
    .range(start, end)
  
  return { data, error }
}

export const getPostComments = async (postId) => {
  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      users!inner (name, avatar_url)
    `)
    .eq('parent_id', postId)
    .order('created_at', { ascending: true })
  
  return { data, error }
}

export const createPost = async (title, content, imageUrls = []) => {
  const user = await getCurrentUser()
  
  const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        type: 'post',
        title,
        content,
        image_urls: imageUrls,
        user_id: user.id,
        author_name: user.user_metadata.name,
        author_email: user.email
      }
    ])
    .select()
  
  return { data, error }
}

export const createComment = async (postId, content) => {
  const user = await getCurrentUser()
  
  const { data, error } = await supabase
    .from('comments')
    .insert([
      {
        type: 'comment',
        parent_id: postId,
        content,
        user_id: user.id,
        author_name: user.user_metadata.name
      }
    ])
    .select()
  
  return { data, error }
}

export const likePost = async (postId) => {
  // Increment likes count
  const { data, error } = await supabase
    .rpc('increment_likes', { post_id: postId })
  
  return { data, error }
}
```

---

## 💎 PREMIUM SYSTEM

### Subscription Tiers

```javascript
// src/utils/constants.js

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
```

### Paywall Screen

```javascript
// src/screens/Premium/PaywallScreen.js
import * as InAppPurchases from 'expo-in-app-purchases'
import { SUBSCRIPTION_PLANS } from '../../utils/constants'

export default function PaywallScreen({ navigation }) {
  const [loading, setLoading] = useState(false)
  
  const handleSubscribe = async (plan) => {
    try {
      setLoading(true)
      
      // 1. Get product from store
      const products = await InAppPurchases.getProductsAsync([
        plan.productId.ios,
        plan.productId.android
      ])
      
      if (products.results.length === 0) {
        throw new Error('Product not found')
      }
      
      // 2. Purchase
      const purchase = await InAppPurchases.purchaseItemAsync(
        products.results[0].productId
      )
      
      // 3. Verify with backend
      if (purchase.acknowledged) {
        await verifyPurchase(purchase)
        
        // 4. Update user status
        const user = await getCurrentUser()
        await supabase
          .from('users')
          .update({ status: 'PLUS' })
          .eq('id', user.id)
        
        // 5. Navigate to app
        navigation.replace('Main')
      }
      
    } catch (error) {
      Alert.alert('Erreur', error.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <ScrollView>
      <Text style={styles.title}>Débloquez tout ClubFasting</Text>
      <Text style={styles.subtitle}>
        Plans personnalisés + Support direct + Communauté
      </Text>
      
      {Object.values(SUBSCRIPTION_PLANS).map(plan => (
        <PlanCard
          key={plan.id}
          plan={plan}
          onPress={() => handleSubscribe(plan)}
          loading={loading}
        />
      ))}
      
      <Text style={styles.trial}>
        14 jours gratuits • Annulez quand vous voulez
      </Text>
    </ScrollView>
  )
}
```

### Content Lock Logic

```javascript
// src/components/ContentLock.js

export const ContentLock = ({ children, isPremium }) => {
  const { userStatus } = useAuth()
  const navigation = useNavigation()
  
  const isLocked = isPremium && userStatus !== 'PLUS'
  
  if (isLocked) {
    return (
      <View style={styles.lockOverlay}>
        <Icon name="lock" size={48} />
        <Text style={styles.lockTitle}>Contenu Premium</Text>
        <Text style={styles.lockText}>
          Débloquez ce contenu avec ClubFasting Premium
        </Text>
        <Button 
          title="Voir les offres"
          onPress={() => navigation.navigate('Paywall')}
        />
      </View>
    )
  }
  
  return children
}
```

---

## 🖼️ IMAGE UPLOAD

```javascript
// src/services/storage.js
import * as ImagePicker from 'expo-image-picker'
import { supabase } from './supabase'

export const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  })
  
  if (!result.canceled) {
    return result.assets[0].uri
  }
  return null
}

export const uploadImage = async (uri, folder = 'posts') => {
  try {
    // 1. Convert URI to blob
    const response = await fetch(uri)
    const blob = await response.blob()
    
    // 2. Generate unique filename
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
    const filePath = `${folder}/${filename}`
    
    // 3. Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: false
      })
    
    if (error) throw error
    
    // 4. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)
    
    return { url: publicUrl, error: null }
    
  } catch (error) {
    return { url: null, error }
  }
}
```

---

## 🎨 THEME & STYLING

```javascript
// src/utils/theme.js

export const theme = {
  colors: {
    primary: '#FF6B6B',      // ClubFasting red
    secondary: '#4ECDC4',    // Accent teal
    background: '#F7F7F7',   // Light gray
    surface: '#FFFFFF',      // White
    text: '#2D3748',         // Dark gray
    textSecondary: '#718096', // Medium gray
    border: '#E2E8F0',       // Light border
    success: '#48BB78',      // Green
    error: '#F56565',        // Red
    warning: '#ED8936',      // Orange
    premium: '#FFD700',      // Gold
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  }
}
```

---

## 📦 DEPENDENCIES

```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "react": "18.2.0",
    "react-native": "0.73.0",
    "@supabase/supabase-js": "^2.39.0",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "react-native-paper": "^5.11.3",
    "expo-image-picker": "~14.7.1",
    "expo-in-app-purchases": "~14.5.0",
    "@react-native-async-storage/async-storage": "1.21.0",
    "react-native-safe-area-context": "4.8.2",
    "react-native-screens": "~3.29.0",
    "expo-status-bar": "~1.11.1"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0"
  }
}
```

---

## 🚀 GETTING STARTED

### Setup

```bash
# 1. Clone repo
git clone https://github.com/jbrivesfr/clubfasting-app.git
cd clubfasting-app

# 2. Install dependencies
npm install

# 3. Setup Supabase config
cp .env.example .env
# Edit .env with Supabase credentials

# 4. Start dev server
npx expo start

# 5. Test on device
# Scan QR code with Expo Go app (iOS/Android)
```

### Environment Variables

```bash
# .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

---

## ✅ MVP CHECKLIST

### Phase 1: Setup (Week 1)
```
☐ Initialize Expo project
☐ Setup Supabase client
☐ Configure navigation
☐ Setup theme & constants
☐ Create base components (Button, Input, Card)
```

### Phase 2: Auth (Week 2)
```
☐ Login screen
☐ Signup screen
☐ Forgot password
☐ Auth context + persistence
☐ Protected routes
```

### Phase 3: Feed (Week 3-4)
```
☐ Feed screen (list posts)
☐ Post card component
☐ Post detail screen
☐ Comments list
☐ Pull-to-refresh
☐ Infinite scroll
```

### Phase 4: Create Content (Week 5)
```
☐ Create post screen
☐ Image picker
☐ Upload to Supabase Storage
☐ Create comment
☐ Like functionality
```

### Phase 5: Profile (Week 6)
```
☐ Profile screen
☐ Edit profile
☐ Avatar upload
☐ Settings
```

### Phase 6: Premium (Week 7-8)
```
☐ Paywall screen
☐ Subscription plans UI
☐ In-App Purchase integration
☐ Content lock component
☐ Subscription status check
```

### Phase 7: Polish (Week 9-10)
```
☐ Loading states
☐ Error handling
☐ Empty states
☐ Pull-to-refresh animations
☐ Dark mode support
☐ Accessibility
```

### Phase 8: Testing (Week 11)
```
☐ Test all flows
☐ Fix bugs
☐ Performance optimization
☐ Beta testing (TestFlight/Google Play)
```

### Phase 9: Deployment (Week 12)
```
☐ App Store assets (screenshots, etc.)
☐ Privacy policy update
☐ Submit to App Store
☐ Submit to Google Play
```

---

## 📝 NOTES

- Use Expo managed workflow (easier than bare React Native)
- Supabase handles auth, database, storage (no need custom backend)
- Real-time subscriptions for live feed updates (nice-to-have v1.1)
- Offline mode with AsyncStorage cache (nice-to-have v1.1)
- Push notifications with Expo Notifications (v1.1)

---

*Created: 2026-01-28*
*Ready for Jules to start development*

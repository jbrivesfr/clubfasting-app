# JULES TASK - ClubFasting React Native App

**Repo:** github/jbrivesfr/clubfasting-app
**Type:** React Native (Expo) - iOS + Android
**Backend:** github/jbrivesfr/superclub (existing, Supabase)

---

## 📋 TASK OVERVIEW

Initialize a React Native app using Expo for ClubFasting. The app will connect to the existing Supabase backend from the superclub repo.

**Timeline:** ~2 weeks for MVP setup
**Deliverable:** Working Expo app with auth + feed structure

---

## 📚 STEP 1: READ DOCUMENTATION

Read these files in **this repo** (clubfasting-app):

1. **PROJECT-SPEC.md** (16KB) - Complete technical specification
   - Architecture
   - Data models
   - All screens structure
   - Code examples for each feature
   - Dependencies list
   - MVP checklist

2. **BACKEND-CHANGES.md** (8KB) - Backend changes reference
   - Supabase RLS policies needed
   - Database functions
   - What works already vs what needs changes

3. **.env.example** - Environment variables structure

**Important:** Follow PROJECT-SPEC.md structure EXACTLY. It's very detailed.

---

## 🚀 STEP 2: INITIALIZE EXPO PROJECT

```bash
cd clubfasting-app

# Initialize Expo with blank template
npx create-expo-app . --template blank

# This creates:
# - App.js
# - package.json
# - app.json
# - babel.config.js
```

---

## 📁 STEP 3: CREATE PROJECT STRUCTURE

Create this folder structure (see PROJECT-SPEC.md for details):

```
src/
├── screens/
│   ├── Auth/
│   │   ├── LoginScreen.js
│   │   ├── SignupScreen.js
│   │   └── ForgotPasswordScreen.js
│   ├── Feed/
│   │   ├── FeedScreen.js
│   │   ├── PostDetailScreen.js
│   │   └── CreatePostScreen.js
│   ├── Profile/
│   │   ├── ProfileScreen.js
│   │   └── EditProfileScreen.js
│   └── Premium/
│       ├── PaywallScreen.js
│       └── SubscriptionScreen.js
├── components/
│   ├── PostCard.js
│   ├── CommentItem.js
│   ├── Avatar.js
│   ├── PremiumBadge.js
│   └── LoadingSpinner.js
├── navigation/
│   ├── AppNavigator.js
│   ├── AuthNavigator.js
│   └── MainNavigator.js
├── services/
│   ├── supabase.js
│   ├── auth.js
│   ├── feed.js
│   ├── subscriptions.js
│   └── storage.js
├── hooks/
│   ├── useAuth.js
│   ├── useFeed.js
│   └── useSubscription.js
├── utils/
│   ├── constants.js
│   ├── theme.js
│   └── helpers.js
└── contexts/
    ├── AuthContext.js
    └── SubscriptionContext.js

assets/
├── images/
├── fonts/
└── icons/
```

---

## 📦 STEP 4: INSTALL DEPENDENCIES

```bash
npm install @supabase/supabase-js \
  @react-navigation/native \
  @react-navigation/stack \
  @react-navigation/bottom-tabs \
  react-native-paper \
  expo-image-picker \
  expo-in-app-purchases \
  @react-native-async-storage/async-storage \
  react-native-safe-area-context \
  react-native-screens \
  expo-status-bar
```

**Note:** These are listed in PROJECT-SPEC.md with versions.

---

## 🔧 STEP 5: CREATE CORE FILES

### 5.1 Supabase Client

**File:** `src/services/supabase.js`

```javascript
import { createClient } from '@supabase/supabase-js'
import Constants from 'expo-constants'

const supabaseUrl = Constants.expoConfig.extra.supabaseUrl
const supabaseAnonKey = Constants.expoConfig.extra.supabaseAnonKey

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**Update app.json:**
```json
{
  "expo": {
    "extra": {
      "supabaseUrl": process.env.SUPABASE_URL,
      "supabaseAnonKey": process.env.SUPABASE_ANON_KEY
    }
  }
}
```

### 5.2 Auth Service

**File:** `src/services/auth.js`

Copy implementation from PROJECT-SPEC.md section "AUTHENTICATION".

### 5.3 Theme

**File:** `src/utils/theme.js`

Copy theme object from PROJECT-SPEC.md section "THEME & STYLING".

### 5.4 Auth Context

**File:** `src/contexts/AuthContext.js`

```javascript
import React, { createContext, useState, useEffect, useContext } from 'react'
import { supabase } from '../services/supabase'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  return useContext(AuthContext)
}
```

---

## 🧭 STEP 6: SETUP NAVIGATION

### 6.1 Auth Navigator

**File:** `src/navigation/AuthNavigator.js`

```javascript
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import LoginScreen from '../screens/Auth/LoginScreen'
import SignupScreen from '../screens/Auth/SignupScreen'

const Stack = createStackNavigator()

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  )
}
```

### 6.2 Main Navigator

**File:** `src/navigation/MainNavigator.js`

```javascript
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import FeedScreen from '../screens/Feed/FeedScreen'
import ProfileScreen from '../screens/Profile/ProfileScreen'

const Tab = createBottomTabNavigator()

export default function MainNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}
```

### 6.3 App Navigator

**File:** `src/navigation/AppNavigator.js`

```javascript
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { useAuth } from '../contexts/AuthContext'
import AuthNavigator from './AuthNavigator'
import MainNavigator from './MainNavigator'
import { ActivityIndicator, View } from 'react-native'

export default function AppNavigator() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  )
}
```

---

## 📱 STEP 7: CREATE BASIC SCREENS

### 7.1 Login Screen

**File:** `src/screens/Auth/LoginScreen.js`

```javascript
import React, { useState } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { TextInput, Button } from 'react-native-paper'
import { signIn } from '../../services/auth'

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      alert(error.message)
    }
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ClubFasting</Text>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        label="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button mode="contained" onPress={handleLogin} loading={loading}>
        Connexion
      </Button>
      <Button onPress={() => navigation.navigate('Signup')}>
        Créer un compte
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
})
```

### 7.2 Signup Screen

Similar to LoginScreen but calls `signUp(email, password, name)`.

### 7.3 Feed Screen

**File:** `src/screens/Feed/FeedScreen.js`

```javascript
import React from 'react'
import { View, FlatList, Text } from 'react-native'

export default function FeedScreen() {
  // Placeholder data
  const posts = []

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <View style={{ padding: 20, borderBottomWidth: 1 }}>
            <Text>{item.title}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={{ padding: 20 }}>Aucun post</Text>}
      />
    </View>
  )
}
```

### 7.4 Profile Screen

**File:** `src/screens/Profile/ProfileScreen.js`

```javascript
import React from 'react'
import { View, Text, Button } from 'react-native'
import { useAuth } from '../../contexts/AuthContext'
import { signOut } from '../../services/auth'

export default function ProfileScreen() {
  const { user } = useAuth()

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text>Email: {user?.email}</Text>
      <Button title="Déconnexion" onPress={signOut} />
    </View>
  )
}
```

---

## 🎯 STEP 8: WIRE APP.JS

**File:** `App.js`

```javascript
import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider as PaperProvider } from 'react-native-paper'
import { AuthProvider } from './src/contexts/AuthContext'
import AppNavigator from './src/navigation/AppNavigator'

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  )
}
```

---

## ✅ STEP 9: TEST

```bash
# Start Expo dev server
npx expo start

# Scan QR code with Expo Go app on phone
# Or press 'i' for iOS simulator
# Or press 'a' for Android emulator
```

**Expected result:**
- App opens to Login screen
- Can navigate to Signup screen
- After login, shows Feed + Profile tabs
- Profile shows user email
- Logout works

---

## 📝 COMMIT STRATEGY

Make incremental commits as you build:

```bash
git commit -m "Initialize Expo project with blank template"
git commit -m "Setup project structure (folders)"
git commit -m "Install dependencies"
git commit -m "Configure Supabase client and environment"
git commit -m "Create auth service and context"
git commit -m "Setup navigation structure"
git commit -m "Create auth screens (Login + Signup)"
git commit -m "Create feed and profile screens (basic UI)"
git commit -m "Wire App.js with providers and navigation"
git commit -m "Test and fix - MVP structure ready"
```

---

## 🚨 IMPORTANT NOTES

1. **Use Expo managed workflow** - Don't eject to bare React Native
2. **Follow PROJECT-SPEC.md exactly** - Structure and naming conventions
3. **Don't implement full features yet** - Focus on STRUCTURE first
4. **Comment your code** - Explain what each service/hook does
5. **Test frequently** - Run `expo start` after each major step
6. **Environment variables** - Use .env.example as template

---

## 📚 REFERENCES

All code examples are in **PROJECT-SPEC.md**:
- Authentication flow (complete code)
- Feed system (hooks + services)
- Premium system (IAP integration)
- Image upload (Storage integration)
- Theme (complete styling)

**Don't reinvent** - Copy/adapt from PROJECT-SPEC.md.

---

## 🎯 SUCCESS CRITERIA

After this task, the app should:
- ✅ Run with `npx expo start`
- ✅ Show Login/Signup screens
- ✅ Connect to Supabase (test with real credentials)
- ✅ Navigate between Auth and Main after login
- ✅ Show Feed (empty) and Profile tabs
- ✅ Logout works
- ✅ Structure matches PROJECT-SPEC.md
- ✅ All core services created (auth.js, supabase.js, etc.)

**MVP Phase 1 complete** = Ready for feature implementation (feed, posts, premium, etc.)

---

## ❓ QUESTIONS?

If stuck:
1. Check PROJECT-SPEC.md first
2. Check Expo docs: https://docs.expo.dev
3. Check Supabase JS docs: https://supabase.com/docs/reference/javascript
4. Ask in commit message what's blocking

---

*Created: 2026-01-28*
*Target: 2 weeks for structure + basic features*
*Next phase: Implement feed functionality, then premium*

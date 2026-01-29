import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import FeedScreen from '../screens/Feed/FeedScreen'
import CreatePostScreen from '../screens/Feed/CreatePostScreen'
import PostDetailScreen from '../screens/Feed/PostDetailScreen'
import ProfileScreen from '../screens/Profile/ProfileScreen'
import EditProfileScreen from '../screens/Profile/EditProfileScreen'
import FastingScreen from '../screens/Fasting/FastingScreen'
import FastingHistoryScreen from '../screens/Fasting/FastingHistoryScreen'
import PaywallScreen from '../screens/Subscription/PaywallScreen';
import { theme } from '../utils/theme'
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator()
const FastingStack = createStackNavigator()
const FeedStack = createStackNavigator()
const ProfileStack = createStackNavigator()
const RootStack = createStackNavigator()

function FeedNavigator() {
    return (
        <FeedStack.Navigator>
            <FeedStack.Screen name="FeedMain" component={FeedScreen} options={{ title: 'Accueil' }} />
            <FeedStack.Screen
                name="CreatePost"
                component={CreatePostScreen}
                options={{
                    title: 'Nouveau post',
                    presentation: 'modal',
                }}
            />
            <FeedStack.Screen
                name="PostDetail"
                component={PostDetailScreen}
                options={{ title: 'Post' }}
            />
        </FeedStack.Navigator>
    )
}

function FastingNavigator() {
    return (
        <FastingStack.Navigator>
            <FastingStack.Screen name="FastingMain" component={FastingScreen} options={{ title: 'Jeûne' }} />
            <FastingStack.Screen name="FastingHistory" component={FastingHistoryScreen} options={{ title: 'Historique' }} />
        </FastingStack.Navigator>
    )
}

function ProfileNavigator() {
    return (
        <ProfileStack.Navigator>
            <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Profil' }} />
            <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Modifier le profil' }} />
        </ProfileStack.Navigator>
    )
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Feed') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Fasting') {
            iconName = focused ? 'timer' : 'timer-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Feed" component={FeedNavigator} options={{ title: 'Accueil', headerShown: false }} />
      <Tab.Screen name="Fasting" component={FastingNavigator} options={{ title: 'Jeûne', headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileNavigator} options={{ title: 'Profil', headerShown: false }} />
    </Tab.Navigator>
  )
}

export default function MainNavigator() {
    return (
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
            <RootStack.Screen name="MainTabs" component={MainTabs} />
            <RootStack.Screen
                name="Paywall"
                component={PaywallScreen}
                options={{
                    presentation: 'modal',
                    headerShown: true,
                    title: 'Premium'
                }}
            />
        </RootStack.Navigator>
    )
}

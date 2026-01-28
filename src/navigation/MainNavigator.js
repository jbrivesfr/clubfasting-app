import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import FeedScreen from '../screens/Feed/FeedScreen'
import ProfileScreen from '../screens/Profile/ProfileScreen'
import FastingScreen from '../screens/Fasting/FastingScreen'
import FastingHistoryScreen from '../screens/Fasting/FastingHistoryScreen'
import { theme } from '../utils/theme'
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator()
const FastingStack = createStackNavigator()

function FastingNavigator() {
    return (
        <FastingStack.Navigator>
            <FastingStack.Screen name="FastingMain" component={FastingScreen} options={{ title: 'Jeûne' }} />
            <FastingStack.Screen name="FastingHistory" component={FastingHistoryScreen} options={{ title: 'Historique' }} />
        </FastingStack.Navigator>
    )
}

export default function MainNavigator() {
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
      <Tab.Screen name="Feed" component={FeedScreen} options={{ title: 'Accueil' }} />
      <Tab.Screen name="Fasting" component={FastingNavigator} options={{ title: 'Jeûne', headerShown: false }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  )
}

import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import FeedScreen from '../screens/Feed/FeedScreen'
import ProfileScreen from '../screens/Profile/ProfileScreen'
import EditProfileScreen from '../screens/Profile/EditProfileScreen'

const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()

function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: 'Profil' }} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Modifier le profil' }} />
    </Stack.Navigator>
  )
}

export default function MainNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Feed" component={FeedScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  )
}

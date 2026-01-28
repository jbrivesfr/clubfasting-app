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

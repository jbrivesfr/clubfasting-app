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

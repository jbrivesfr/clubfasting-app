import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider as PaperProvider } from 'react-native-paper'
import { AuthProvider } from './src/contexts/AuthContext'
import { SubscriptionProvider } from './src/contexts/SubscriptionContext'
import AppNavigator from './src/navigation/AppNavigator'

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <AppNavigator />
          </SubscriptionProvider>
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  )
}

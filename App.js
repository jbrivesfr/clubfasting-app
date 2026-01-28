import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { Provider as PaperProvider } from 'react-native-paper'
import { AuthProvider } from './src/contexts/AuthContext'
import AppNavigator from './src/navigation/AppNavigator'
import { theme } from './src/utils/theme'

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </PaperProvider>
    </SafeAreaProvider>
  )
}

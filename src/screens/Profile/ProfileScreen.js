import React from 'react'
import { View, Text, Button } from 'react-native'
import { useAuth } from '../../contexts/AuthContext'
import { signOut } from '../../services/auth'

export default function ProfileScreen() {
  const { user } = useAuth()

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ marginBottom: 20 }}>Email: {user?.email}</Text>
      <Button title="Déconnexion" onPress={signOut} />
    </View>
  )
}

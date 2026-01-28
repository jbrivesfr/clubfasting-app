import React from 'react'
import { View, Text, Button, StyleSheet } from 'react-native'
import { useAuth } from '../../contexts/AuthContext'
import { signOut } from '../../services/auth'

export default function ProfileScreen() {
  const { user } = useAuth()

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Email: {user?.email}</Text>
      <Button title="Déconnexion" onPress={signOut} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    fontSize: 18,
    marginBottom: 20
  }
})

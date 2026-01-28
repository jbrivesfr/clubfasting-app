import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { Button } from 'react-native-paper'
import { useAuth } from '../../contexts/AuthContext'
import { signOut } from '../../services/auth'

export default function ProfileScreen() {
  const { user } = useAuth()

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Profile Screen</Text>
      <Text style={styles.text}>Email: {user?.email}</Text>
      <Button mode="contained" onPress={signOut} style={styles.button}>
        Déconnexion
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
  }
})

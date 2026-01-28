import React, { useState } from 'react'
import { View, StyleSheet } from 'react-native'
import { TextInput, Button, Text } from 'react-native-paper'
import { signUp } from '../../services/auth'

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    setLoading(true)
    const { error } = await signUp(email, password, name)
    if (error) {
      alert(error.message)
    } else {
        alert("Account created! Please check your email.")
    }
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Créer un compte</Text>
      <TextInput
        label="Nom complet"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        label="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <Button mode="contained" onPress={handleSignup} loading={loading} style={styles.button}>
        S'inscrire
      </Button>
      <Button onPress={() => navigation.navigate('Login')}>
        J'ai déjà un compte
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 40,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginBottom: 16,
  }
})

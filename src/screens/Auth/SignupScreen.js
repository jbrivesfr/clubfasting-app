import React, { useState } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { TextInput, Button } from 'react-native-paper'
import { signUp } from '../../services/auth'

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    setLoading(true)
    const { error } = await signUp(email, password, name)
    if (error) {
      alert(error.message)
    } else {
        alert('Compte créé ! Connectez-vous si nécessaire.')
        navigation.navigate('Login')
    }
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>
      <TextInput
        label="Nom"
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
      <Button onPress={() => navigation.navigate('Login')} style={styles.button}>
        Déjà un compte ? Connexion
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
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginTop: 10,
  }
})

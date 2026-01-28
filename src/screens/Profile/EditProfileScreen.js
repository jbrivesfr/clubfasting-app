import React, { useState } from 'react'
import { View, StyleSheet, Alert, ScrollView } from 'react-native'
import { TextInput, Button, Avatar } from 'react-native-paper'
import * as ImagePicker from 'expo-image-picker'
import { updateUserProfile, uploadAvatar } from '../../services/profile'
import { useAuth } from '../../contexts/AuthContext'
import { theme } from '../../utils/theme'

export default function EditProfileScreen({ navigation, route }) {
  const { user } = useAuth()
  const { profile } = route.params || {}

  const [name, setName] = useState(profile?.name || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || null)
  const [loading, setLoading] = useState(false)
  const [imageUri, setImageUri] = useState(null)

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })

    if (!result.canceled) {
      setImageUri(result.assets[0].uri)
      setAvatarUrl(result.assets[0].uri) // Preview
    }
  }

  const handleSave = async () => {
    if (!user) return
    setLoading(true)

    try {
      let finalAvatarUrl = profile?.avatar_url

      if (imageUri) {
        const { url, error } = await uploadAvatar(user.id, imageUri)
        if (error) throw error
        finalAvatarUrl = url
      }

      const { error } = await updateUserProfile(user.id, {
        name,
        bio,
        avatar_url: finalAvatarUrl
      })

      if (error) throw error

      Alert.alert('Succès', 'Profil mis à jour')
      navigation.goBack()
    } catch (error) {
      console.error(error)
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.avatarContainer}>
        {avatarUrl ? (
          <Avatar.Image size={120} source={{ uri: avatarUrl }} />
        ) : (
          <Avatar.Text size={120} label={name?.substring(0, 2).toUpperCase() || 'US'} />
        )}
        <Button onPress={pickImage} style={styles.changePhotoButton}>
          Changer la photo
        </Button>
      </View>

      <TextInput
        label="Nom"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      <TextInput
        label="Bio"
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={3}
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleSave}
        loading={loading}
        style={styles.saveButton}
      >
        Enregistrer
      </Button>

      <Button
        onPress={() => navigation.goBack()}
        style={styles.cancelButton}
      >
        Annuler
      </Button>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: theme.colors.background,
    flexGrow: 1
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  changePhotoButton: {
    marginTop: 10,
  },
  input: {
    marginBottom: 20,
    backgroundColor: theme.colors.surface,
  },
  saveButton: {
    marginBottom: 10,
  },
  cancelButton: {

  }
})

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, TextInput, Avatar, Text, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile, uploadProfilePhoto } from '../../services/profile';
import { theme } from '../../utils/theme';

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();

  // Initial values passed from ProfileScreen to avoid refetching immediately
  const { initialData } = route.params || {};

  const [name, setName] = useState(initialData?.name || user?.user_metadata?.name || '');
  const [bio, setBio] = useState(initialData?.bio || '');
  const [avatar, setAvatar] = useState(initialData?.avatar_url || null);
  const [newImage, setNewImage] = useState(null); // { uri, type, name }

  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Check for changes
  useEffect(() => {
    const nameChanged = name !== (initialData?.name || '');
    const bioChanged = bio !== (initialData?.bio || '');
    const imageChanged = !!newImage;

    setHasChanges(nameChanged || bioChanged || imageChanged);
  }, [name, bio, newImage, initialData]);

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const asset = result.assets[0];

        // Check size (approximate)
        if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
          Alert.alert('Erreur', 'L\'image est trop volumineuse (max 5MB)');
          return;
        }

        setNewImage({
          uri: asset.uri,
          type: asset.mimeType || 'image/jpeg',
          name: asset.fileName || 'avatar.jpg'
        });
        setAvatar(asset.uri); // For preview
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
      console.error(error);
    }
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom ne peut pas être vide');
      return;
    }
    if (name.trim().length < 2) {
      Alert.alert('Erreur', 'Le nom doit faire au moins 2 caractères');
      return;
    }

    setLoading(true);
    try {
      const userId = user.id;

      // Upload image if changed
      if (newImage) {
        await uploadProfilePhoto(userId, newImage);
      }

      // Update details
      if (name !== initialData?.name || bio !== initialData?.bio) {
        await updateUserProfile(userId, {
          name: name.trim(),
          bio: bio.trim()
        });
      }

      Alert.alert('Succès', 'Profil mis à jour', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Save profile error:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={handleImagePick}>
            {avatar ? (
              <Avatar.Image size={120} source={{ uri: avatar }} />
            ) : (
              <Avatar.Text
                size={120}
                label={name ? name.substring(0, 2).toUpperCase() : 'AN'}
                style={{ backgroundColor: theme.colors.primary }}
              />
            )}
            <View style={styles.editIconBadge}>
              <Text style={styles.editIconText}>📷</Text>
            </View>
          </TouchableOpacity>
          <Button mode="text" onPress={handleImagePick} style={styles.changePhotoButton}>
            Changer la photo
          </Button>
        </View>

        <View style={styles.form}>
          <TextInput
            label="Nom"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
            maxLength={50}
            right={<TextInput.Affix text={`${name.length}/50`} />}
          />

          <TextInput
            label="Bio"
            value={bio}
            onChangeText={setBio}
            mode="outlined"
            style={[styles.input, styles.bioInput]}
            multiline
            numberOfLines={4}
            maxLength={200}
            right={<TextInput.Affix text={`${bio.length}/200`} />}
          />
        </View>

        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleSave}
            loading={loading}
            disabled={!hasChanges || loading}
            style={styles.saveButton}
          >
            Enregistrer
          </Button>
        </View>
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  editIconBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  editIconText: {
    fontSize: 16,
  },
  changePhotoButton: {
    marginTop: 10,
  },
  form: {
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
    backgroundColor: theme.colors.surface,
  },
  bioInput: {
    height: 100, // Fixed height for bio
    textAlignVertical: 'top', // For Android
  },
  actions: {
    marginTop: 10,
  },
  saveButton: {
    paddingVertical: 6,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  }
});

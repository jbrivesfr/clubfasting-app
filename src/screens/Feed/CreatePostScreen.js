import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { TextInput, Button, IconButton, Text, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { createPost } from '../../services/feed';
import { theme } from '../../utils/theme';

export default function CreatePostScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: 'Nouveau post',
      headerLeft: () => (
        <Button onPress={() => navigation.goBack()} disabled={loading} textColor={theme.colors.error}>
          Annuler
        </Button>
      ),
      headerRight: () => (
        <Button
          onPress={handlePost}
          disabled={!text.trim() || loading}
          loading={loading}
        >
          Publier
        </Button>
      ),
    });
  }, [navigation, text, image, loading]);

  const pickImage = async () => {
    Alert.alert(
        "Ajouter une photo",
        "Choisissez une source",
        [
            {
                text: "Caméra",
                onPress: async () => {
                    const { status } = await ImagePicker.requestCameraPermissionsAsync();
                    if (status !== 'granted') {
                        Alert.alert('Permission refusée', 'Permission caméra requise.');
                        return;
                    }
                    let result = await ImagePicker.launchCameraAsync({
                        allowsEditing: false,
                        quality: 0.8,
                    });
                    handleImageResult(result);
                }
            },
            {
                text: "Galerie",
                onPress: async () => {
                    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                    if (status !== 'granted') {
                        Alert.alert('Permission refusée', 'Permission galerie requise.');
                        return;
                    }
                    let result = await ImagePicker.launchImageLibraryAsync({
                        mediaTypes: ImagePicker.MediaTypeOptions.Images,
                        allowsEditing: false,
                        quality: 0.8,
                    });
                    handleImageResult(result);
                }
            },
            {
                text: "Annuler",
                style: "cancel"
            }
        ]
    );
  };

  const handleImageResult = (result) => {
    if (!result.canceled) {
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        Alert.alert('Erreur', "L'image est trop volumineuse (max 5MB)");
        return;
      }
      setImage(asset);
    }
  };

  const removeImage = () => {
    setImage(null);
  };

  const handlePost = async () => {
    if (!text.trim()) {
       Alert.alert('Erreur', "Le texte ne peut pas être vide");
       return;
    }

    if (text.length > 2000) {
        Alert.alert('Erreur', "Le texte est trop long (max 2000 caractères)");
        return;
    }

    setLoading(true);
    try {
      await createPost(user.id, text.trim(), image);
      // Navigate back with refresh param
      navigation.navigate('FeedMain', { refresh: Date.now() });
    } catch (error) {
      console.error('Create post error:', error);
      Alert.alert('Erreur', "Erreur lors de l'upload, réessayez");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TextInput
          mode="outlined"
          placeholder="Qu'est-ce que tu veux partager?"
          multiline
          style={styles.input}
          value={text}
          onChangeText={setText}
          disabled={loading}
          autoFocus
        />

        {image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image.uri }} style={styles.previewImage} />
            <IconButton
              icon="close"
              size={20}
              style={styles.removeButton}
              onPress={removeImage}
              disabled={loading}
            />
          </View>
        )}

        <Button
          icon="camera"
          mode="text"
          onPress={pickImage}
          disabled={loading || !!image}
          style={styles.imageButton}
        >
          Ajouter une photo
        </Button>
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
  input: {
    minHeight: 100,
    backgroundColor: theme.colors.surface,
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removeButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  imageButton: {
    alignSelf: 'flex-start',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

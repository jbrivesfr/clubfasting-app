import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Text, Avatar, Button, Divider, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { fetchUserProfile, fetchUserPosts } from '../../services/profile';
import { toggleLike } from '../../services/feed';
import { signOut } from '../../services/auth';
import PostCard from '../../components/PostCard';
import { theme } from '../../utils/theme';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      const [userProfile, userPosts] = await Promise.all([
        fetchUserProfile(user.id),
        fetchUserPosts(user.id, user.id)
      ]);

      setProfile(userProfile);
      setPosts(userPosts);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Erreur', 'Impossible de charger le profil');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleEditProfile = () => {
    navigation.navigate('EditProfile', { initialData: profile });
  };

  const handleToggleLike = async (postId) => {
    try {
      await toggleLike(postId, user.id);
      // Optimistic update is handled in PostCard, but we update state here too to keep consistency
      // or we could just refetch, but that's heavy.
      // PostCard handles its own state, but if we scroll away and back, we want it updated.
      // Ideally we update the posts array.
      setPosts(currentPosts =>
        currentPosts.map(p => {
          if (p.id === postId) {
            const newLiked = !p.is_liked;
            return {
              ...p,
              is_liked: newLiked,
              likes_count: newLiked ? (p.likes_count || 0) + 1 : Math.max(0, (p.likes_count || 0) - 1)
            };
          }
          return p;
        })
      );
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const renderHeader = () => {
    if (!profile) return null;

    return (
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          {profile.avatar_url ? (
            <Avatar.Image size={80} source={{ uri: profile.avatar_url }} />
          ) : (
            <Avatar.Text
              size={80}
              label={profile.name ? profile.name.substring(0, 2).toUpperCase() : 'AN'}
              style={{ backgroundColor: theme.colors.primary }}
            />
          )}

          <Text style={styles.name}>{profile.name || 'Utilisateur'}</Text>
          {profile.bio ? (
            <Text style={styles.bio}>{profile.bio}</Text>
          ) : null}
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>📝</Text>
            <Text style={styles.statValue}>{profile.posts_count || 0} posts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{profile.fasts_count || 0} jeûnes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>⚡</Text>
            <Text style={styles.statValue}>{profile.streak_days || 0} jours</Text>
          </View>
        </View>

        <Button
          mode="outlined"
          onPress={handleEditProfile}
          style={styles.editButton}
        >
          Modifier le profil
        </Button>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mes Posts</Text>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard post={item} onToggleLike={handleToggleLike} />
        )}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={posts.length === 0 ? { flex: 1 } : null}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun post pour le moment</Text>
            </View>
          )
        }
        // Add footer for sign out button if needed, or put it in header or separate settings
        ListFooterComponent={
           <Button mode="text" onPress={signOut} style={styles.signOutButton} textColor={theme.colors.error}>
             Déconnexion
           </Button>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: theme.colors.surface,
    marginBottom: 10,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: 10,
    marginBottom: 5,
  },
  bio: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 15,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.colors.border,
  },
  statEmoji: {
    fontSize: 20,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  editButton: {
    marginBottom: 20,
    borderColor: theme.colors.primary,
  },
  sectionHeader: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 200,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
  },
  signOutButton: {
    marginVertical: 20,
  }
});

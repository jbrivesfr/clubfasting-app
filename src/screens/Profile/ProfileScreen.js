import React, { useState, useEffect, useCallback } from 'react'
import { View, StyleSheet, ScrollView, RefreshControl, Image, FlatList, Alert } from 'react-native'
import { Text, Button, Avatar, ActivityIndicator, Divider } from 'react-native-paper'
import { useAuth } from '../../contexts/AuthContext'
import { signOut } from '../../services/auth'
import { getUserProfile, getUserStats, getUserPosts } from '../../services/profile'
import { theme } from '../../utils/theme'
import { useFocusEffect } from '@react-navigation/native'

export default function ProfileScreen({ navigation }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({ posts: 0, fasts: 0, followers: 0 })
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = async () => {
    if (!user) return

    try {
      const [profileRes, statsRes, postsRes] = await Promise.all([
        getUserProfile(user.id),
        getUserStats(user.id),
        getUserPosts(user.id)
      ])

      if (profileRes.error) throw profileRes.error
      if (postsRes.error) throw postsRes.error

      setProfile(profileRes.data)
      setStats(statsRes)
      setPosts(postsRes.data || [])
    } catch (error) {
      console.error(error)
      // Alert.alert('Erreur', 'Impossible de charger le profil')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      loadData()
    }, [user])
  )

  const onRefresh = () => {
    setRefreshing(true)
    loadData()
  }

  const handleLogout = async () => {
    await signOut()
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.profileInfo}>
        {profile?.avatar_url ? (
            <Avatar.Image size={80} source={{ uri: profile.avatar_url }} />
        ) : (
            <Avatar.Text size={80} label={profile?.name?.substring(0, 2).toUpperCase() || 'US'} />
        )}
        <Text style={styles.name}>{profile?.name || 'Utilisateur'}</Text>
        <Text style={styles.bio}>{profile?.bio || 'Aucune bio'}</Text>

        <View style={styles.actions}>
            <Button
                mode="outlined"
                onPress={() => navigation.navigate('EditProfile', { profile })}
                style={styles.editButton}
            >
                Modifier le profil
            </Button>
            <Button onPress={handleLogout} textColor={theme.colors.error}>
                Déconnexion
            </Button>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.posts}</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.fasts}</Text>
          <Text style={styles.statLabel}>Jeûnes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.followers}</Text>
          <Text style={styles.statLabel}>Abonnés</Text>
        </View>
      </View>
      <Divider style={styles.divider} />
      <Text style={styles.sectionTitle}>Mes Posts</Text>
    </View>
  )

  const renderPost = ({ item }) => (
    <View style={styles.postCard}>
       <Text style={styles.postTitle}>{item.title}</Text>
       <Text numberOfLines={3} style={styles.postContent}>{item.content}</Text>
       {(item.image_urls?.[0] || item.image_url) && (
           <Image source={{ uri: item.image_urls?.[0] || item.image_url }} style={styles.postImage} />
       )}
       <Text style={styles.postDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
       <Divider style={{ marginTop: 10 }}/>
    </View>
  )

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    )
  }

  return (
    <FlatList
      data={posts}
      renderItem={renderPost}
      keyExtractor={(item) => item.id.toString()}
      ListHeaderComponent={renderHeader}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
            <Text>Aucun post publié</Text>
        </View>
      }
    />
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    minHeight: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: theme.colors.surface,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: theme.colors.text,
  },
  bio: {
    textAlign: 'center',
    marginTop: 5,
    color: theme.colors.textSecondary,
    marginBottom: 15,
  },
  actions: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 10
  },
  editButton: {
      marginRight: 10,
      borderColor: theme.colors.border
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  divider: {
      marginVertical: 10
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: theme.colors.text
  },
  postCard: {
      padding: 15,
      backgroundColor: theme.colors.surface,
      marginBottom: 10
  },
  postTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 5
  },
  postContent: {
      color: theme.colors.text,
      marginBottom: 5
  },
  postImage: {
      width: '100%',
      height: 200,
      borderRadius: 8,
      marginTop: 5
  },
  postDate: {
      color: theme.colors.textSecondary,
      fontSize: 12,
      marginTop: 5
  },
  emptyContainer: {
      padding: 20,
      alignItems: 'center'
  }
})

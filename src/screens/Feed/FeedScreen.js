import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { fetchPosts, toggleLike } from '../../services/feed';
import PostCard from '../../components/PostCard';
import { theme } from '../../utils/theme';

export default function FeedScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const loadPosts = async (pageNum = 0, shouldRefresh = false) => {
    try {
      if (pageNum === 0) setError(null);

      const newPosts = await fetchPosts(pageNum, 20, user?.id);

      if (shouldRefresh) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }

      if (newPosts.length < 20) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

    } catch (err) {
      console.error(err);
      setError('Impossible de charger le feed.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadPosts(0, true);
  }, [user]); // Reload if user changes (e.g. login/logout)

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(0);
    setHasMore(true); // Reset hasMore on refresh
    loadPosts(0, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      loadPosts(nextPage);
    }
  };

  const handleToggleLike = async (postId) => {
      try {
          await toggleLike(postId, user?.id);
          // Update local state to persist changes across scroll
          setPosts(currentPosts =>
              currentPosts.map(p => {
                  if (p.id === postId) {
                      const wasLiked = p.is_liked;
                      return {
                          ...p,
                          is_liked: !wasLiked,
                          likes_count: wasLiked ? Math.max(0, p.likes_count - 1) : p.likes_count + 1
                      };
                  }
                  return p;
              })
          );
      } catch (err) {
          console.error("Like error", err);
      }
  };

  const renderItem = useCallback(({ item }) => (
    <PostCard
      post={item}
      onToggleLike={handleToggleLike}
    />
  ), [user]); // Re-create if user changes

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 20 }} />;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    if (error) return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button mode="contained" onPress={handleRefresh} style={styles.button}>
          Réessayer
        </Button>
      </View>
    );
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Aucun post pour le moment.</Text>
      </View>
    );
  };

  if (loading && !refreshing && posts.length === 0) {
      return (
          <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
      )
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
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
    backgroundColor: theme.colors.background,
  },
  listContent: {
    paddingVertical: 10,
    flexGrow: 1,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontSize: 16,
  },
  button: {
    backgroundColor: theme.colors.primary,
  }
});

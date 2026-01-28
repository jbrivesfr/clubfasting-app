import React from 'react'
import { View, FlatList, StyleSheet, ActivityIndicator, Text } from 'react-native'
import { useFeed } from '../../hooks/useFeed'
import PostCard from '../../components/PostCard'
import { theme } from '../../utils/theme'

export default function FeedScreen() {
  const { posts, loading, refresh, loadMore, handleLike } = useFeed()

  const renderFooter = () => {
    if (!loading) return null
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    )
  }

  const renderEmpty = () => {
      if (loading) return null
      return (
          <View style={styles.emptyContainer}>
              <Text style={{ color: theme.colors.textSecondary }}>Aucun post pour le moment.</Text>
          </View>
      )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={({ item }) => <PostCard post={item} onLike={handleLike} />}
        keyExtractor={item => item.id.toString()}
        onRefresh={refresh}
        refreshing={loading && posts.length === 0}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={posts.length === 0 ? styles.listEmpty : null}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loader: {
    padding: 10,
    alignItems: 'center',
  },
  emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20
  },
  listEmpty: {
      flexGrow: 1
  }
})

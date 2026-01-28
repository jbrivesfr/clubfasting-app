import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Card, Text, Avatar, IconButton, Divider, Button } from 'react-native-paper'
import { theme } from '../utils/theme'

const PostCard = ({ post, onLike }) => {
  const { users, content, image_url, likes_count, comments_count, is_liked, created_at, latest_comments } = post

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <Card style={styles.card} mode="elevated">
      <Card.Title
        title={users?.name || 'Utilisateur inconnu'}
        subtitle={formatDate(created_at)}
        left={(props) => (
            users?.avatar_url
            ? <Avatar.Image {...props} source={{ uri: users.avatar_url }} />
            : <Avatar.Text {...props} label={users?.name?.substring(0, 2).toUpperCase() || 'UN'} />
        )}
      />
      <Card.Content>
        <Text variant="bodyMedium" style={styles.content}>{content}</Text>
      </Card.Content>

      {image_url && (
        <Card.Cover source={{ uri: image_url }} style={styles.image} />
      )}

      <Card.Actions style={styles.actions}>
        <View style={styles.actionButton}>
            <IconButton
                icon={is_liked ? "heart" : "heart-outline"}
                iconColor={is_liked ? theme.colors.primary : theme.colors.textSecondary}
                onPress={() => onLike(post.id)}
                size={20}
            />
            <Text style={{color: theme.colors.textSecondary}}>{likes_count}</Text>
        </View>

        <View style={styles.actionButton}>
            <IconButton
                icon="comment-outline"
                iconColor={theme.colors.textSecondary}
                size={20}
            />
            <Text style={{color: theme.colors.textSecondary}}>{comments_count}</Text>
        </View>
      </Card.Actions>

      {latest_comments && latest_comments.length > 0 && (
          <View style={styles.commentsSection}>
              <Divider style={{ marginBottom: 8 }} />
              {latest_comments.map(comment => (
                  <View key={comment.id} style={styles.commentItem}>
                      <Text style={styles.commentAuthor}>{comment.users?.name}: </Text>
                      <Text style={styles.commentContent}>{comment.content}</Text>
                  </View>
              ))}
              {comments_count > latest_comments.length && (
                  <Button mode="text" compact uppercase={false} textColor={theme.colors.textSecondary}>
                      Voir tous les commentaires ({comments_count})
                  </Button>
              )}
          </View>
      )}
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    margin: 10,
    backgroundColor: 'white',
  },
  content: {
    marginBottom: 10,
  },
  image: {
    marginTop: 10,
  },
  actions: {
    justifyContent: 'flex-start',
    paddingHorizontal: 8,
  },
  actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16
  },
  commentsSection: {
      paddingHorizontal: 16,
      paddingBottom: 12
  },
  commentItem: {
      flexDirection: 'row',
      marginTop: 4,
      flexWrap: 'wrap'
  },
  commentAuthor: {
      fontWeight: 'bold',
      fontSize: 13,
      color: theme.colors.text
  },
  commentContent: {
      fontSize: 13,
      flex: 1,
      color: theme.colors.text
  }
})

export default PostCard

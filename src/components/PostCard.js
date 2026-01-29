import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Avatar, IconButton } from 'react-native-paper';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { theme } from '../utils/theme';

const PostCard = ({ post, onToggleLike }) => {
  const {
    text,
    image,
    created_at,
    user_name,
    avatar_url,
    likes_count,
    is_liked
  } = post;

  // Local state for optimistic UI
  const [liked, setLiked] = useState(is_liked);
  const [count, setCount] = useState(likes_count);

  // Sync local state if prop changes (e.g. from refresh)
  useEffect(() => {
    setLiked(is_liked);
    setCount(likes_count);
  }, [is_liked, likes_count]);

  const handleLike = () => {
    const newLiked = !liked;
    const newCount = newLiked ? count + 1 : Math.max(0, count - 1);

    setLiked(newLiked);
    setCount(newCount);

    // Notify parent
    onToggleLike(post.id);
  };

  const timeAgo = created_at
    ? formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: fr })
    : '';

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        {avatar_url ? (
          <Avatar.Image size={40} source={{ uri: avatar_url }} />
        ) : (
          <Avatar.Text
            size={40}
            label={user_name ? user_name.substring(0, 2).toUpperCase() : 'AN'}
            style={{ backgroundColor: theme.colors.primary }}
          />
        )}
        <View style={styles.headerText}>
          <Text style={styles.username}>{user_name || 'Anonyme'}</Text>
          <Text style={styles.time}>{timeAgo}</Text>
        </View>
      </View>

      <Card.Content style={styles.content}>
        {text ? <Text style={styles.text}>{text}</Text> : null}
      </Card.Content>

      {image ? (
        <Card.Cover source={{ uri: image }} style={styles.image} />
      ) : null}

      <Card.Actions style={styles.actions}>
        <View style={styles.likeContainer}>
          <IconButton
            icon={liked ? "heart" : "heart-outline"}
            iconColor={liked ? theme.colors.primary : theme.colors.textSecondary}
            size={24}
            onPress={handleLike}
            animated={true}
          />
          <Text style={styles.likeCount}>{count} J'aime</Text>
        </View>
      </Card.Actions>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 10,
    backgroundColor: theme.colors.surface,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  headerText: {
    marginLeft: 10,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    color: theme.colors.text,
  },
  time: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  content: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  text: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  image: {
    marginHorizontal: 15,
    marginBottom: 15,
    height: 200,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
  },
  actions: {
    paddingHorizontal: 5,
    paddingBottom: 5,
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeCount: {
    color: theme.colors.textSecondary,
    marginLeft: -5,
  }
});

export default PostCard;

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { theme } from '../utils/theme';

const CommentItem = ({ comment }) => {
  const { user_name, avatar_url, text, created_at } = comment;

  const timeAgo = created_at
    ? formatDistanceToNow(new Date(created_at), { addSuffix: true, locale: fr })
    : '';

  return (
    <View style={styles.commentContainer}>
      {avatar_url ? (
        <Avatar.Image size={32} source={{ uri: avatar_url }} />
      ) : (
        <Avatar.Text
          size={32}
          label={user_name ? user_name.substring(0, 2).toUpperCase() : 'AN'}
          style={{ backgroundColor: theme.colors.primary }}
        />
      )}
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.username}>{user_name || 'Utilisateur'}</Text>
          <Text style={styles.time}>{timeAgo}</Text>
        </View>
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
};

const CommentsList = ({ comments }) => {
  if (!comments || comments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Aucun commentaire pour le moment.</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {comments.map(comment => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 10,
  },
  commentContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
  },
  contentContainer: {
    marginLeft: 10,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 14,
    color: theme.colors.text,
  },
  time: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  text: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  }
});

export default CommentsList;

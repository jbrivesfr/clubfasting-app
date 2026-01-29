import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, RefreshControl } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PostCard from '../../components/PostCard';
import CommentsList from '../../components/CommentsList';
import CommentInput from '../../components/CommentInput';
import { fetchPostById, fetchComments, addComment, toggleLike } from '../../services/feed';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../utils/theme';

export default function PostDetailScreen({ route, navigation }) {
  const { postId } = route.params;
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);

  const loadData = async () => {
    try {
      const [fetchedPost, fetchedComments] = await Promise.all([
        fetchPostById(postId, user?.id),
        fetchComments(postId)
      ]);
      setPost(fetchedPost);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error loading post details:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [postId, user]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleSendComment = async (text) => {
    if (!user) return;
    setSending(true);
    try {
      const newComment = await addComment(user.id, postId, text);
      setComments(prev => [...prev, newComment]);

      // Update post comment count locally
      setPost(prev => prev ? { ...prev, comments_count: (prev.comments_count || 0) + 1 } : prev);

      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);

    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Erreur lors de l\'envoi du commentaire.');
    } finally {
      setSending(false);
    }
  };

  const handleToggleLike = async (id) => {
    try {
        await toggleLike(id, user?.id);
        // Update local state
        setPost(prev => {
            if (!prev) return prev;
            const wasLiked = prev.is_liked;
            return {
                ...prev,
                is_liked: !wasLiked,
                likes_count: wasLiked ? Math.max(0, prev.likes_count - 1) : prev.likes_count + 1
            };
        });
    } catch (err) {
        console.error("Like error", err);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text>Post introuvable.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: 'white' }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[styles.content, { paddingBottom: 20 }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <PostCard post={post} onToggleLike={handleToggleLike} />
        <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>Commentaires</Text>
        </View>
        <CommentsList comments={comments} />
      </ScrollView>
      <CommentInput onSend={handleSendComment} loading={sending} autoFocus={true} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexGrow: 1,
  },
  commentsHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  }
});

import { supabase } from './supabase';

/**
 * Fetch posts with pagination
 * @param {number} page - Page number (starts at 0)
 * @param {number} limit - Number of posts per page
 * @param {string} userId - Current user ID to check for likes
 * @returns {Promise<Array>} - Array of formatted posts
 */
export const fetchPosts = async (page = 0, limit = 20, userId = null) => {
  try {
    const from = page * limit;
    const to = from + limit - 1;

    // 1. Fetch posts with author info and total like count
    const { data: posts, error } = await supabase
      .from('comments')
      .select(`
        *,
        users (
          name,
          avatar_url
        ),
        comment_likes (count)
      `)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }

    // 2. Fetch user's likes for these posts if userId is provided
    let likedPostIds = new Set();
    if (userId && posts.length > 0) {
      const postIds = posts.map(p => p.id);
      const { data: likes, error: likesError } = await supabase
        .from('comment_likes')
        .select('comment_id')
        .eq('user_id', userId)
        .in('comment_id', postIds);

      if (!likesError && likes) {
        likes.forEach(l => likedPostIds.add(l.comment_id));
      }
    }

    // 3. Format the data
    return posts.map(post => ({
      ...post,
      // Supabase returns count as an array of objects like [{ count: 5 }]
      likes_count: post.comment_likes ? post.comment_likes[0]?.count : (post.likes || 0),
      is_liked: likedPostIds.has(post.id),
      user_name: post.users?.name || 'Utilisateur',
      avatar_url: post.users?.avatar_url
    }));
  } catch (error) {
    console.error('Feed service error:', error);
    throw error;
  }
};

/**
 * Toggle like on a post
 * @param {string} postId
 * @param {string} userId
 * @returns {Promise<boolean>} - New liked status (true = liked, false = unliked)
 */
export const toggleLike = async (postId, userId) => {
  try {
    // Check if already liked
    const isLiked = await hasUserLiked(postId, userId);

    if (isLiked) {
      // Unlike
      const { error: deleteError } = await supabase
        .from('comment_likes')
        .delete()
        .eq('comment_id', postId)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // Decrement comments.likes
      const { data: post } = await supabase.from('comments').select('likes').eq('id', postId).single();
      if (post) {
        await supabase
          .from('comments')
          .update({ likes: Math.max(0, post.likes - 1) })
          .eq('id', postId);
      }

      return false;
    } else {
      // Like
      const { error: insertError } = await supabase
        .from('comment_likes')
        .insert({ comment_id: postId, user_id: userId });

      if (insertError) throw insertError;

      // Increment comments.likes
      const { data: post } = await supabase.from('comments').select('likes').eq('id', postId).single();
      if (post) {
        await supabase
          .from('comments')
          .update({ likes: (post.likes || 0) + 1 })
          .eq('id', postId);
      }

      return true;
    }
  } catch (error) {
    console.error('Toggle like error:', error);
    throw error;
  }
};

/**
 * Check if user has liked a post
 * @param {string} postId
 * @param {string} userId
 * @returns {Promise<boolean>}
 */
export const hasUserLiked = async (postId, userId) => {
  try {
    const { data, error } = await supabase
      .from('comment_likes')
      .select('id')
      .eq('comment_id', postId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Check like error:', error);
    return false;
  }
};

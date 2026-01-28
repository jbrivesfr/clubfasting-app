import { supabase } from './supabase'

const POSTS_PER_PAGE = 10

export const getFeed = async (page = 1, userId) => {
  const start = (page - 1) * POSTS_PER_PAGE
  const end = start + POSTS_PER_PAGE - 1

  // 1. Fetch Posts
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      users (name, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .range(start, end)

  if (error) {
    console.error('Error fetching posts:', error)
    return { data: null, error }
  }

  if (!posts || posts.length === 0) return { data: [], error: null }

  const postIds = posts.map(p => p.id)

  // 2. Check if user liked these posts
  let myLikedPostIds = new Set()
  if (userId) {
    const { data: myLikes } = await supabase
      .from('post_likes')
      .select('post_id')
      .eq('user_id', userId)
      .in('post_id', postIds)

    if (myLikes) {
      myLikedPostIds = new Set(myLikes.map(l => l.post_id))
    }
  }

  // 3. Fetch counts and comments for each post
  // Note: ideally this should be optimized with database views or functions
  const enhancedPosts = await Promise.all(posts.map(async (post) => {
    // Get like count
    const { count: likesCount } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id)

    // Get comment count
    const { count: commentsCount } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', post.id)

    // Get latest comments (3)
    const { data: comments } = await supabase
      .from('comments')
      .select('*, users(name, avatar_url)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: false })
      .limit(3)

    return {
      ...post,
      likes_count: likesCount || 0,
      comments_count: commentsCount || 0,
      is_liked: myLikedPostIds.has(post.id),
      latest_comments: comments ? comments.reverse() : [] // Show oldest first (top to bottom) among the latest? Or newest first? Usually comments are time ascending. But "latest" implies we fetch the newest. Let's show newest at bottom if we display them.
    }
  }))

  return { data: enhancedPosts, error: null }
}

export const toggleLike = async (postId, userId, isLiked) => {
  if (isLiked) {
    return await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId)
  } else {
    return await supabase
      .from('post_likes')
      .insert([{ post_id: postId, user_id: userId }])
  }
}

export const getPostLikes = async (postId) => {
    const { count } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
    return count
}

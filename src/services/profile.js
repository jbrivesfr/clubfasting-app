import { supabase } from './supabase'

/**
 * Fetch user profile
 * @param {string} userId
 * @returns {Promise<object>} - User profile with stats
 */
export const fetchUserProfile = async (userId) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) throw error

  // Get stats
  const { count: postsCount } = await supabase
    .from('comments')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .is('parent_id', null) // Only posts, not comments

  const { count: fastsCount } = await supabase
    .from('fasts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('status', 'completed')

  return {
    ...user,
    posts_count: postsCount || 0,
    fasts_count: fastsCount || 0,
    streak_days: 0 // Placeholder as requested
  }
}

/**
 * Update user profile
 * @param {string} userId
 * @param {object} updates - { name, bio }
 * @returns {Promise<object>}
 */
export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Upload profile photo
 * @param {string} userId
 * @param {object} imageFile - { uri, type, name }
 * @returns {Promise<string>} - Public URL
 */
export const uploadProfilePhoto = async (userId, imageFile) => {
  const ext = imageFile.name ? imageFile.name.split('.').pop() : 'jpg'
  const fileName = `${userId}/avatar.${ext}`

  // Use fetch to get blob
  const response = await fetch(imageFile.uri)
  const blob = await response.blob()

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, blob, {
      contentType: imageFile.type || 'image/jpeg',
      upsert: true // Overwrite if exists
    })

  if (error) throw error

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName)

  // Update user record
  await updateUserProfile(userId, { avatar_url: publicUrl })

  return publicUrl
}

/**
 * Fetch user's posts
 * @param {string} userId - Author ID
 * @param {string} viewerId - Viewer ID (to check is_liked)
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export const fetchUserPosts = async (userId, viewerId = null, limit = 20) => {
  const { data: posts, error } = await supabase
    .from('comments')
    .select(`
      *,
      users (name, avatar_url),
      comment_likes (count),
      comments (count)
    `)
    .eq('user_id', userId)
    .is('parent_id', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  // Check for likes
  let likedPostIds = new Set();
  if (viewerId && posts.length > 0) {
    const postIds = posts.map(p => p.id);
    const { data: likes } = await supabase
      .from('comment_likes')
      .select('comment_id')
      .eq('user_id', viewerId)
      .in('comment_id', postIds);

    if (likes) {
      likes.forEach(l => likedPostIds.add(l.comment_id));
    }
  }

  return posts.map(post => ({
    ...post,
    likes_count: post.comment_likes?.[0]?.count || 0,
    comments_count: post.comments?.[0]?.count || 0,
    user_name: post.users?.name || 'Utilisateur',
    avatar_url: post.users?.avatar_url,
    is_liked: likedPostIds.has(post.id)
  }))
}

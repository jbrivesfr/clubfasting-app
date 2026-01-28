import { supabase } from './supabase'

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  return { data, error }
}

export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  return { data, error }
}

export const uploadAvatar = async (userId, imageUri) => {
  try {
    const response = await fetch(imageUri)
    const blob = await response.blob()
    const fileName = `${userId}/avatar.jpg`
    const filePath = fileName

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, blob, {
        contentType: 'image/jpeg',
        upsert: true
      })

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)

    return { url: data.publicUrl, error: null }
  } catch (error) {
    return { url: null, error }
  }
}

export const getUserStats = async (userId) => {
  // Posts count
  const { count: postsCount } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Fasts count
  const { count: fastsCount } = await supabase
    .from('fasts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  // Followers - Placeholder
  const followersCount = 0

  return {
    posts: postsCount || 0,
    fasts: fastsCount || 0,
    followers: followersCount
  }
}

export const getUserPosts = async (userId) => {
    const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data, error }
}

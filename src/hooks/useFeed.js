import { useState, useEffect, useCallback } from 'react'
import { getFeed, toggleLike } from '../services/feed'
import { useAuth } from '../contexts/AuthContext'

export const useFeed = () => {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const loadPosts = async (pageNum = 1, shouldRefresh = false) => {
    if (loading && !shouldRefresh) return
    setLoading(true)

    const { data, error } = await getFeed(pageNum, user?.id)

    if (data) {
      if (shouldRefresh) {
        setPosts(data)
        setHasMore(data.length === 10) // Assuming limit is 10
      } else {
        setPosts(prev => [...prev, ...data])
        if (data.length < 10) setHasMore(false)
      }
    } else {
        if (!shouldRefresh && pageNum > 1) setHasMore(false)
    }

    setLoading(false)
  }

  // Initial load
  useEffect(() => {
    if (user) {
        loadPosts(1, true)
    }
  }, [user])

  const refresh = useCallback(() => {
    setPage(1)
    loadPosts(1, true)
  }, [user])

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1
      setPage(nextPage)
      loadPosts(nextPage, false)
    }
  }, [loading, hasMore, page, user])

  const handleLike = async (postId) => {
    const postIndex = posts.findIndex(p => p.id === postId)
    if (postIndex === -1) return

    const post = posts[postIndex]
    const newIsLiked = !post.is_liked
    const newLikesCount = post.likes_count + (newIsLiked ? 1 : -1)

    // Optimistic update
    const updatedPosts = [...posts]
    updatedPosts[postIndex] = {
      ...post,
      is_liked: newIsLiked,
      likes_count: newLikesCount
    }
    setPosts(updatedPosts)

    // API call
    const { error } = await toggleLike(postId, user.id, post.is_liked)
    if (error) {
      // Revert if error
      setPosts(posts)
      console.error(error)
    }
  }

  return { posts, loading, refresh, loadMore, hasMore, handleLike }
}

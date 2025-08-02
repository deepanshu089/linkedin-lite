import { createContext, useContext, useState } from 'react'
import api from '../services/api'

const PostContext = createContext()

export const usePosts = () => {
  const context = useContext(PostContext)
  if (!context) {
    throw new Error('usePosts must be used within a PostProvider')
  }
  return context
}

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPosts = async (page = 1, limit = 10) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get(`/posts?page=${page}&limit=${limit}`)
      if (page === 1) {
        setPosts(response.data.posts)
      } else {
        setPosts(prev => [...prev, ...response.data.posts])
      }
      return response.data
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch posts')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const createPost = async (contentOrFormData) => {
    setLoading(true)
    setError(null)
    
    try {
      let response
      if (contentOrFormData instanceof FormData) {
        // Handle FormData (with media files)
        response = await api.post('/posts', contentOrFormData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      } else {
        // Handle plain text content
        response = await api.post('/posts', { content: contentOrFormData })
      }
      
      // Get the current user data to ensure we have the latest avatar
      const currentUserResponse = await api.get('/auth/me')
      const currentUser = currentUserResponse.data.user
      
      // Update the post with current user data
      const updatedPost = {
        ...response.data.post,
        author: currentUser
      }
      
      setPosts(prev => [updatedPost, ...prev])
      return { success: true, post: updatedPost }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create post')
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to create post' 
      }
    } finally {
      setLoading(false)
    }
  }

  const likePost = async (postId) => {
    try {
      const response = await api.post(`/posts/${postId}/like`)
      setPosts(prev => 
        prev.map(post => 
          post._id === postId 
            ? { ...post, likes: response.data.post.likes }
            : post
        )
      )
      return { success: true }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to like post')
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to like post' 
      }
    }
  }

  const addComment = async (postId, content) => {
    try {
      const response = await api.post(`/posts/${postId}/comment`, { content })
      setPosts(prev => 
        prev.map(post => 
          post._id === postId 
            ? { ...post, comments: response.data.post.comments }
            : post
        )
      )
      return { success: true, comment: response.data.post.comments[response.data.post.comments.length - 1] }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to add comment')
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to add comment' 
      }
    }
  }

  const clearError = () => {
    setError(null)
  }

  const refreshPosts = async () => {
    await fetchPosts(1, 10)
  }

  const value = {
    posts,
    setPosts,
    loading,
    error,
    fetchPosts,
    createPost,
    likePost,
    addComment,
    clearError,
    refreshPosts
  }

  return (
    <PostContext.Provider value={value}>
      {children}
    </PostContext.Provider>
  )
} 
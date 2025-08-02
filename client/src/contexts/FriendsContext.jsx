import { createContext, useContext, useState, useCallback } from 'react'
import api from '../services/api'
import { useToast } from './ToastContext'

const FriendsContext = createContext()

export const useFriends = () => {
  const context = useContext(FriendsContext)
  if (!context) {
    throw new Error('useFriends must be used within a FriendsProvider')
  }
  return context
}

export const FriendsProvider = ({ children }) => {
  const [friends, setFriends] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [discoverUsers, setDiscoverUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { showSuccess, showError } = useToast()

  const fetchFriends = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get('/friends')
      setFriends(response.data.friends)
      setPendingRequests(response.data.pendingRequests)
      return response.data
    } catch (error) {
      console.error('Error fetching friends:', error)
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      })
      const errorMessage = error.response?.data?.message || 'Failed to fetch friends'
      setError(errorMessage)
      showError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }, [showError])

  const fetchDiscoverUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.get('/friends/discover')
      setDiscoverUsers(response.data.users)
      return response.data
    } catch (error) {
      console.error('Error fetching discover users:', error)
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      })
      const errorMessage = error.response?.data?.message || 'Failed to fetch discover users'
      setError(errorMessage)
      showError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }, [showError])

  const sendFriendRequest = useCallback(async (userId) => {
    try {
      const response = await api.post(`/friends/request/${userId}`)
      
      // Show success toast
      showSuccess('Friend request sent successfully!')
      
      // Immediately refresh discover users to remove the user from the list
      await fetchDiscoverUsers()
      
      return { success: true }
    } catch (error) {
      console.error('Error sending friend request:', error)
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to send friend request'
      setError(errorMessage)
      showError(errorMessage)
      return { 
        success: false, 
        message: errorMessage
      }
    }
  }, [fetchDiscoverUsers, showSuccess, showError])

  const acceptFriendRequest = useCallback(async (userId) => {
    try {
      console.log('Accepting friend request for user:', userId)
      await api.post(`/friends/accept/${userId}`)
      // Show success toast
      showSuccess('Friend request accepted!')
      // Refresh friends and pending requests
      await fetchFriends()
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to accept friend request'
      setError(errorMessage)
      showError(errorMessage)
      return { 
        success: false, 
        message: errorMessage
      }
    }
  }, [fetchFriends, showSuccess, showError])

  const rejectFriendRequest = useCallback(async (userId) => {
    try {
      await api.post(`/friends/reject/${userId}`)
      // Show success toast
      showSuccess('Friend request rejected')
      // Refresh pending requests and discover users
      await fetchFriends()
      await fetchDiscoverUsers()
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reject friend request'
      setError(errorMessage)
      showError(errorMessage)
      return { 
        success: false, 
        message: errorMessage
      }
    }
  }, [fetchFriends, fetchDiscoverUsers, showSuccess, showError])

  const removeFriend = useCallback(async (userId) => {
    try {
      console.log('Removing friend with ID:', userId)
      const response = await api.delete(`/friends/remove/${userId}`)
      console.log('Remove friend response:', response.data)
      
      // Show success toast
      showSuccess('Friend removed successfully')
      // Refresh friends list and discover users
      await fetchFriends()
      await fetchDiscoverUsers()
      return { success: true }
    } catch (error) {
      console.error('Error removing friend:', error)
      console.error('Error response:', error.response)
      const errorMessage = error.response?.data?.message || 'Failed to remove friend'
      setError(errorMessage)
      showError(errorMessage)
      return { 
        success: false, 
        message: errorMessage
      }
    }
  }, [fetchFriends, fetchDiscoverUsers, showSuccess, showError])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value = {
    friends,
    pendingRequests,
    discoverUsers,
    loading,
    error,
    fetchFriends,
    fetchDiscoverUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    clearError
  }

  return (
    <FriendsContext.Provider value={value}>
      {children}
    </FriendsContext.Provider>
  )
} 
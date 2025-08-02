import { createContext, useContext, useState, useCallback } from 'react'
import api from '../services/api'
import { useToast } from './ToastContext'
import { useFriends } from './FriendsContext'

const MessagesContext = createContext()

export const useMessages = () => {
  const context = useContext(MessagesContext)
  if (!context) {
    throw new Error('useMessages must be used within a MessagesProvider')
  }
  return context
}

export const MessagesProvider = ({ children }) => {
  const [conversations, setConversations] = useState([])
  const [currentConversation, setCurrentConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const { showSuccess, showError } = useToast()
  const { friends, fetchFriends } = useFriends()

  const fetchConversations = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true)
    }
    setError(null)
    
    try {
      if (!silent) {
        console.log('Fetching conversations...')
      }
      // Fetch both conversations and friends
      const [conversationsResponse] = await Promise.all([
        api.get('/messages/conversations'),
        fetchFriends() // This will update the friends state
      ])
      if (!silent) {
        console.log('Conversations response:', conversationsResponse.data)
      }
      setConversations(conversationsResponse.data.conversations)
      return conversationsResponse.data
    } catch (error) {
      console.error('Error fetching conversations:', error)
      if (!silent) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch conversations'
        setError(errorMessage)
        showError(errorMessage)
      }
      throw error
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [showError, fetchFriends])

  const fetchMessages = useCallback(async (userId, silent = false) => {
    if (!silent) {
      setLoading(true)
    }
    setError(null)
    
    try {
      if (!silent) {
        console.log('Fetching messages for user:', userId)
      }
      const response = await api.get(`/messages/${userId}`)
      if (!silent) {
        console.log('Messages response:', response.data)
      }
      setMessages(response.data.messages)
      return response.data
    } catch (error) {
      console.error('Error fetching messages:', error)
      if (!silent) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch messages'
        setError(errorMessage)
        showError(errorMessage)
      }
      throw error
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [showError])

  const sendMessage = useCallback(async (userId, contentOrFormData) => {
    try {
      console.log('Sending message to:', userId, 'content:', contentOrFormData)
      
      let response
      if (contentOrFormData instanceof FormData) {
        // Handle FormData (with media files)
        response = await api.post(`/messages/${userId}`, contentOrFormData, {
          headers: {
            // Don't set Content-Type for FormData - let browser set it with boundary
          },
        })
      } else {
        // Handle plain text content
        response = await api.post(`/messages/${userId}`, { content: contentOrFormData })
      }
      
      console.log('Send message response:', response.data)
      console.log('Message media:', response.data.message.media)
      
      // Add the new message to the current messages
      setMessages(prev => [...prev, response.data.message])
      
      // Update the conversation's last message
      setConversations(prev => prev.map(conv => {
        if (conv.user._id === userId) {
          return {
            ...conv,
            lastMessage: response.data.message
          }
        }
        return conv
      }))
      
      showSuccess('Message sent!')
      return { success: true }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = error.response?.data?.message || 'Failed to send message'
      setError(errorMessage)
      showError(errorMessage)
      return { 
        success: false, 
        message: errorMessage
      }
    }
  }, [showSuccess, showError])

  const markMessageAsRead = useCallback(async (messageId) => {
    try {
      await api.put(`/messages/${messageId}/read`)
      // Update the message in the messages array
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, read: true } : msg
      ))
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }, [])

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get('/messages/unread/count')
      setUnreadCount(response.data.unreadCount)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }, [])

  const selectConversation = useCallback((conversation) => {
    setCurrentConversation(conversation)
    if (conversation && conversation.user && conversation.user._id) {
      fetchMessages(conversation.user._id)
    } else if (conversation && conversation._id) {
      // Handle case where conversation is actually a friend object
      fetchMessages(conversation._id)
    } else {
      setMessages([])
    }
  }, [fetchMessages])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value = {
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    unreadCount,
    friends,
    fetchConversations,
    fetchMessages,
    sendMessage,
    markMessageAsRead,
    fetchUnreadCount,
    selectConversation,
    clearError
  }

  return (
    <MessagesContext.Provider value={value}>
      {children}
    </MessagesContext.Provider>
  )
} 
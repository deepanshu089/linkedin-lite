import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMessages } from '../contexts/MessagesContext'
import { useAuth } from '../contexts/AuthContext'
import { MessageCircle, Send, User, Image, Video, X, ArrowLeft, Search, Sparkles, MoreVertical, Phone, Camera } from 'lucide-react'

const Messages = () => {
  const navigate = useNavigate()
  const { 
    conversations, 
    currentConversation, 
    messages, 
    loading, 
    error,
    friends,
    fetchConversations,
    fetchMessages,
    selectConversation 
  } = useMessages()
  const { user } = useAuth()
  const [messageInput, setMessageInput] = useState('')
  const [sending, setSending] = useState(false)
  const [newMessageCount, setNewMessageCount] = useState(0)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showMobileSidebar, setShowMobileSidebar] = useState(true)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const fileInputRef = useRef(null)
  const { sendMessage } = useMessages()

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  // Auto-refresh conversations and messages every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.hidden) return
      fetchConversations(true)
      if (currentConversation) {
        fetchMessages(currentConversation.user._id, true)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [fetchConversations, fetchMessages, currentConversation])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages])

  // Track new messages
  useEffect(() => {
    const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)
    const previousCount = newMessageCount
    setNewMessageCount(totalUnread)
    
    if (totalUnread > previousCount && previousCount > 0) {
      console.log(`New messages received! Total unread: ${totalUnread}`)
    }
  }, [conversations, newMessageCount])

  // Create a combined list of friends and conversations
  const getSidebarItems = () => {
    const conversationMap = new Map()
    conversations.forEach(conv => {
      conversationMap.set(conv.user._id, conv)
    })

    return friends.map(friend => {
      const conversation = conversationMap.get(friend._id)
      return {
        user: friend,
        lastMessage: conversation?.lastMessage || null,
        unreadCount: conversation?.unreadCount || 0,
        hasConversation: !!conversation
      }
    })
  }

  // Handle scroll events to show/hide scroll button
  useEffect(() => {
    const messagesContainer = messagesContainerRef.current
    if (!messagesContainer) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer
      const isNearBottom = scrollHeight - scrollTop <= clientHeight + 100
      setShowScrollButton(!isNearBottom)
    }

    messagesContainer.addEventListener('scroll', handleScroll)
    return () => messagesContainer.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
      return isValidType && isValidSize
    })

    if (validFiles.length + selectedFiles.length > 5) {
      alert('Maximum 5 files allowed')
      return
    }

    setSelectedFiles(prev => {
      const newFiles = [...prev, ...validFiles]
      return newFiles
    })
    
    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrls(prev => {
          const newUrls = [...prev, { url: e.target.result, file }]
          return newUrls
        })
      }
      reader.readAsDataURL(file)
    })
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if ((!messageInput.trim() && selectedFiles.length === 0) || sending || !currentConversation) {
      return
    }

    setSending(true)
    try {
      let result
      if (selectedFiles.length > 0) {
        // Handle file upload
        const formData = new FormData()
        // Only append content if there's actual text
        if (messageInput.trim()) {
          formData.append('content', messageInput.trim())
        }
        
        selectedFiles.forEach((file, index) => {
          formData.append('media', file)
        })
        
        result = await sendMessage(currentConversation.user._id, formData)
      } else {
        // Handle text-only message
        result = await sendMessage(currentConversation.user._id, messageInput.trim())
      }

      if (result.success) {
        setMessageInput('')
        setSelectedFiles([])
        setPreviewUrls([])
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const formatLastMessage = (message) => {
    if (!message) return 'No messages yet'
    const content = message.content || (message.media && message.media.length > 0 ? 'Sent a file' : '')
    return content.length > 30 ? content.substring(0, 30) + '...' : content
  }

  const handleSelectFriend = (friend) => {
    // Create a conversation-like object from the friend
    const conversationObj = {
      user: friend,
      lastMessage: null,
      unreadCount: 0,
      hasConversation: false
    }
    selectConversation(conversationObj)
    setShowMobileSidebar(false) // Close sidebar on mobile when selecting conversation
  }

  const filteredItems = getSidebarItems().filter(item => 
    item.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading conversations...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen pt-16 bg-blue-100 px-0 lg:px-4">
      <div className="w-full lg:max-w-7xl lg:mx-auto h-[calc(100vh-80px)] flex bg-white rounded-3xl shadow-xl p-0 lg:p-6">

                 {/* Sidebar - Desktop: Always visible, Mobile: Conditional */}
         <div className={`
           ${showMobileSidebar ? 'block' : 'hidden'} 
           lg:block 
           w-full lg:w-80 
           bg-white 
           border-r border-gray-200 
           flex flex-col
           lg:relative
           fixed lg:static
           top-0 left-0 z-50
           h-full
           lg:z-auto
           lg:rounded-l-2xl
         `}>
                     {/* Sidebar Header */}
           <div className="p-4 sm:p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">Messages</h2>
                  <p className="text-sm text-gray-600">{friends.length} connections</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/feed')}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

                     {/* Conversations List */}
           <div className="flex-1 overflow-y-auto px-2 sm:px-0">
            {filteredItems.length === 0 ? (
              <div className="p-6 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">
                  {searchTerm ? 'No conversations found' : 'No conversations yet'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredItems.map((item) => (
                                     <div
                     key={item.user._id}
                     onClick={() => handleSelectFriend(item.user)}
                     className={`p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                       currentConversation?.user._id === item.user._id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                     }`}
                   >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={item.user.avatar || `https://ui-avatars.com/api/?name=${item.user.name}&background=random`}
                          alt={item.user.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        {item.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {item.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {item.user.name}
                          </h3>
                          {item.lastMessage && (
                            <span className="text-xs text-gray-500">
                              {formatTime(item.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {formatLastMessage(item.lastMessage)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

                 {/* Main Chat Area */}
         <div className={`flex-1 flex flex-col bg-white lg:rounded-r-2xl ${!currentConversation ? 'hidden lg:flex' : ''}`}>
          {currentConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 sm:p-6 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowMobileSidebar(true)}
                      className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <img
                      src={currentConversation.user.avatar || `https://ui-avatars.com/api/?name=${currentConversation.user.name}&background=random`}
                      alt={currentConversation.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{currentConversation.user.name}</h3>
                      <p className="text-sm text-gray-600">Active now</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                      <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                      <Camera className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

                             {/* Messages */}
                             <div 
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 bg-gray-50"
              >
                {messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h3>
                    <p className="text-gray-600">Send a message to begin chatting with {currentConversation.user.name}</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${message.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
                    >
                                             <div className={`max-w-[calc(0.7*theme(maxWidth.xs))] lg:max-w-[calc(0.7*theme(maxWidth.md))] ${
                         message.sender._id === user._id 
                           ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl rounded-br-md shadow-lg' 
                           : 'bg-white text-gray-900 rounded-2xl rounded-bl-md shadow-md border border-gray-100'
                       } px-2 py-1.5`}>
                                                 {message.content && (
                           <p className="text-xs leading-tight">{message.content}</p>
                         )}
                        {message.media && message.media.length > 0 && (
                          <div className="mt-2">
                            <div className="grid grid-cols-1 gap-2">
                              {message.media.map((media, index) => {
                                const mediaUrl = `http://localhost:5000${media.url}`
                                console.log('Rendering media:', { media, mediaUrl })
                                return (
                                  <div key={index}>
                                    {media.type === 'image' ? (
                                      <img
                                        src={mediaUrl}
                                        alt="Media"
                                        className="rounded-lg max-w-full"
                                        onError={(e) => console.error('Image failed to load:', mediaUrl)}
                                        onLoad={() => console.log('Image loaded successfully:', mediaUrl)}
                                      />
                                    ) : (
                                      <video
                                        src={mediaUrl}
                                        controls
                                        className="rounded-lg max-w-full"
                                        onError={(e) => console.error('Video failed to load:', mediaUrl)}
                                        onLoad={() => console.log('Video loaded successfully:', mediaUrl)}
                                      />
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                        <p className={`text-xs mt-1 ${
                          message.sender._id === user._id ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 sm:p-6 border-t border-gray-200 bg-white">
                <form onSubmit={handleSendMessage} className="space-y-3">
                  {previewUrls.length > 0 && (
                    <div className="mb-3">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <p className="text-blue-800 text-sm font-medium">Selected Files ({previewUrls.length})</p>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {previewUrls.map((preview, index) => (
                          <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200">
                            {preview.file.type.startsWith('image/') ? (
                              <img
                                src={preview.url}
                                alt="Preview"
                                className="w-full h-32 object-cover rounded-lg"
                              />
                            ) : (
                              <video
                                src={preview.url}
                                className="w-full h-32 object-cover rounded-lg"
                                controls
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-all duration-200 shadow-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <textarea
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        placeholder="Type your message..."
                        className="w-full resize-none border border-gray-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="1"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage(e)
                          }
                        }}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          console.log('File button clicked')
                          console.log('File input ref:', fileInputRef.current)
                          fileInputRef.current?.click()
                        }}
                        className={`p-3 rounded-full transition-colors ${
                          selectedFiles.length > 0 
                            ? 'text-blue-600 bg-blue-50' 
                            : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
                        }`}
                      >
                        <Image className="w-5 h-5" />
                        {selectedFiles.length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {selectedFiles.length}
                          </span>
                        )}
                      </button>
                      <button
                        type="submit"
                        disabled={(!messageInput.trim() && selectedFiles.length === 0) || sending}
                        onClick={() => {
                          console.log('Send button clicked')
                          console.log('Button disabled:', (!messageInput.trim() && selectedFiles.length === 0) || sending)
                        }}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-full hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        {sending ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </form>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </>
                                ) : (
             /* No Conversation Selected - Show conversation list on mobile */
             <div className="flex flex-1 flex-col bg-white lg:hidden">
               {/* Mobile Header */}
               <div className="p-4 sm:p-6 border-b border-gray-200 bg-white">
                 <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center space-x-3">
                     <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                       <MessageCircle className="w-5 h-5 text-white" />
                     </div>
                     <div>
                       <h2 className="font-semibold text-gray-900">Messages</h2>
                       <p className="text-sm text-gray-600">{friends.length} connections</p>
                     </div>
                   </div>
                 </div>
                 
                 {/* Search */}
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                   <input
                     type="text"
                     placeholder="Search conversations..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                   />
                 </div>
               </div>

               {/* Conversations List */}
               <div className="flex-1 overflow-y-auto px-2 sm:px-0">
                 {filteredItems.length === 0 ? (
                   <div className="p-6 text-center">
                     <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                     <p className="text-gray-600 text-sm">
                       {searchTerm ? 'No conversations found' : 'No conversations yet'}
                     </p>
                   </div>
                 ) : (
                   <div className="divide-y divide-gray-100">
                     {filteredItems.map((item) => (
                       <div
                         key={item.user._id}
                         onClick={() => handleSelectFriend(item.user)}
                         className={`p-3 sm:p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                           currentConversation?.user._id === item.user._id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                         }`}
                       >
                         <div className="flex items-center space-x-3">
                           <div className="relative">
                             <img
                               src={item.user.avatar || `https://ui-avatars.com/api/?name=${item.user.name}&background=random`}
                               alt={item.user.name}
                               className="w-12 h-12 rounded-full object-cover"
                             />
                             {item.unreadCount > 0 && (
                               <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                 {item.unreadCount}
                               </span>
                             )}
                           </div>
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between">
                               <h3 className="text-sm font-medium text-gray-900 truncate">
                                 {item.user.name}
                               </h3>
                               {item.lastMessage && (
                                 <span className="text-xs text-gray-500">
                                   {formatTime(item.lastMessage.createdAt)}
                                 </span>
                               )}
                             </div>
                             <p className="text-sm text-gray-600 truncate">
                               {formatLastMessage(item.lastMessage)}
                             </p>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
             </div>
          )}
        </div>

        {/* Scroll to Bottom Button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="fixed bottom-20 right-4 bg-white border border-gray-200 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 z-10"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export default Messages 
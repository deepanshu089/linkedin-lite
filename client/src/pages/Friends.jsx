import { useState, useEffect } from 'react'
import { useFriends } from '../contexts/FriendsContext'
import UserCard from '../components/UserCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { Users, UserPlus, UserCheck, Clock, Search, Sparkles, Network } from 'lucide-react'

const Friends = () => {
  console.log('Friends page rendering')
  const { 
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
    removeFriend
  } = useFriends()

  const [activeTab, setActiveTab] = useState('discover')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    console.log('Friends page useEffect triggered')
    fetchFriends()
    fetchDiscoverUsers()
  }, [])

  // Debug logging for pending requests
  useEffect(() => {
    console.log('Pending requests data:', pendingRequests)
    if (pendingRequests.length > 0) {
      console.log('First pending request structure:', pendingRequests[0])
    }
  }, [pendingRequests])

  const handleAction = async (action, userId) => {
    switch (action) {
      case 'sendRequest':
        await sendFriendRequest(userId)
        break
      case 'accept':
        await acceptFriendRequest(userId)
        break
      case 'reject':
        await rejectFriendRequest(userId)
        break
      case 'remove':
        await removeFriend(userId)
        break
      default:
        break
    }
  }

  const tabs = [
    { id: 'discover', label: 'Discover People', icon: Users, count: discoverUsers.length, color: 'blue' },
    { id: 'pending', label: 'Friend Requests', icon: Clock, count: pendingRequests.length, color: 'orange' },
    { id: 'friends', label: 'My Network', icon: UserCheck, count: friends.length, color: 'green' }
  ]

  const filteredUsers = (users) => {
    if (!searchTerm) return users
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <LoadingSpinner size="large" />
              <p className="mt-4 text-gray-600 text-lg">Building your network...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-red-800">Error loading network</h3>
                  <p className="mt-2 text-red-700">{error}</p>
                  {error.includes('Server is not running') && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">How to fix this:</h4>
                      <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                        <li>Open a terminal/command prompt</li>
                        <li>Navigate to the server folder: <code className="bg-blue-100 px-1 rounded">cd server</code></li>
                        <li>Start the server: <code className="bg-blue-100 px-1 rounded">npm run dev</code></li>
                        <li>Wait for the server to start (you should see "Server running on port 5000")</li>
                        <li>Refresh this page</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
            <Network className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Your Network
          </h1>
          <p className="text-gray-600 text-lg">
            Connect with amazing people and grow your professional network
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search people by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="grid grid-cols-3 w-full border-b border-gray-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center space-x-1 px-1 sm:px-3 py-2 text-xs font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? (tab.color === 'blue' 
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                        : tab.color === 'orange' 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                        : 'bg-gradient-to-r from-green-500 to-green-600 text-white')
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4 hidden sm:block" />
                <span>{tab.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id 
                    ? 'bg-white/20 text-white' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'discover' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Discover Amazing People</h2>
                  <Sparkles className="w-5 h-5 text-purple-500 hidden sm:block" />
                </div>
                {filteredUsers(discoverUsers).length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4 hidden sm:block" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {searchTerm ? 'No users found' : 'No users to discover'}
                    </h3>
                    <p className="text-gray-600">
                      {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new connections'}
                    </p>
                  </div>
                                 ) : (
                                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                      {filteredUsers(discoverUsers).map((user) => (
                        <div key={user._id} className="w-full bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition-all duration-300">
                          <UserCard user={user} onAction={handleAction} type="discover" />
                        </div>
                      ))}
                    </div>
                )}
              </div>
            )}

            {activeTab === 'pending' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Friend Requests</h2>
                  <Clock className="w-5 h-5 text-orange-500 hidden sm:block" />
                </div>
                {filteredUsers(pendingRequests).length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4 hidden sm:block" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                    <p className="text-gray-600">When people send you friend requests, they'll appear here</p>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800">
                        You have <strong>{filteredUsers(pendingRequests).length}</strong> pending friend request{filteredUsers(pendingRequests).length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                      {filteredUsers(pendingRequests).map((user) => (
                        <div key={user._id} className="w-full bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition-all duration-300">
                          <UserCard user={user} onAction={handleAction} type="pending" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'friends' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Your Network</h2>
                  <UserCheck className="w-5 h-5 text-green-500 hidden sm:block" />
                </div>
                {filteredUsers(friends).length === 0 ? (
                  <div className="text-center py-12">
                    <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-4 hidden sm:block" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No connections yet</h3>
                    <p className="text-gray-600 mb-6">Start building your network by discovering and connecting with people</p>
                    <button
                      onClick={() => setActiveTab('discover')}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                    >
                      Discover People
                    </button>
                  </div>
                                 ) : (
                                       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                      {filteredUsers(friends).map((user) => (
                        <div key={user._id} className="w-full bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-gray-100 hover:shadow-md transition-all duration-300">
                          <UserCard user={user} onAction={handleAction} type="friend" />
                        </div>
                      ))}
                    </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Friends 
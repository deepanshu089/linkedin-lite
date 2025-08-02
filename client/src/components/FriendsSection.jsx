import { useState, useEffect } from 'react'
import { useFriends } from '../contexts/FriendsContext'
import UserCard from './UserCard'
import LoadingSpinner from './LoadingSpinner'
import { Users, UserPlus, UserCheck, Clock } from 'lucide-react'

const FriendsSection = () => {
  console.log('FriendsSection rendering')
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

  useEffect(() => {
    console.log('FriendsSection useEffect triggered')
    fetchFriends()
    fetchDiscoverUsers()
  }, [])

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
    { id: 'discover', label: 'Discover People', icon: Users, count: discoverUsers.length },
    { id: 'pending', label: 'Friend Requests', icon: Clock, count: pendingRequests.length },
    { id: 'friends', label: 'My Friends', icon: UserCheck, count: friends.length }
  ]

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Loading friends...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading friends</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative">
          <h2 className="text-xl font-bold text-white">Friends & Connections</h2>
          <p className="text-primary-100 text-sm mt-1">Connect with people and build your network</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <nav className="flex space-x-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-4 px-6 font-medium text-sm transition-all duration-200 relative ${
                activeTab === tab.id
                  ? 'text-primary-600 bg-primary-50 border-b-2 border-primary-500 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  activeTab === tab.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6 bg-gray-50 min-h-[400px]">
        {activeTab === 'discover' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Discover People
              </h3>
              <span className="text-sm text-gray-500">
                {discoverUsers.length} people available
              </span>
            </div>
            {discoverUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No more people to discover
                </h4>
                <p className="text-gray-600 max-w-sm mx-auto">
                  Check back later for new users to connect with!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {discoverUsers.map((user) => (
                  <UserCard
                    key={user._id}
                    user={user}
                    type="discover"
                    onAction={handleAction}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Friend Requests
              </h3>
              {pendingRequests.length > 0 && (
                <span className="text-sm text-orange-600 font-medium animate-pulse">
                  {pendingRequests.length} pending
                </span>
              )}
            </div>
            {pendingRequests.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No pending requests
                </h4>
                <p className="text-gray-600 max-w-sm mx-auto">
                  You don't have any friend requests at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <UserCard
                    key={request.from._id}
                    user={request.from}
                    type="pending"
                    onAction={handleAction}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                My Friends
              </h3>
              <span className="text-sm text-gray-500">
                {friends.length} friends
              </span>
            </div>
            {friends.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">
                  No friends yet
                </h4>
                <p className="text-gray-600 max-w-sm mx-auto">
                  Start connecting with people to build your network!
                </p>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="mt-4 btn-primary text-sm"
                >
                  Discover People
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {friends.map((friend) => (
                  <UserCard
                    key={friend._id}
                    user={friend}
                    type="friend"
                    onAction={handleAction}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default FriendsSection 
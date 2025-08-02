import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, UserPlus, UserCheck, UserX, Check, X } from 'lucide-react'

const UserCard = ({ user, type = 'discover', onAction }) => {
  const [loadingActions, setLoadingActions] = useState({})

  const handleAction = async (action) => {
    setLoadingActions(prev => ({ ...prev, [action]: true }))
    try {
      const result = await onAction(action, user._id)
      if (result && result.success) {
        // Action was successful
        console.log(`${action} successful for user ${user._id}`)
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error)
    } finally {
      setLoadingActions(prev => ({ ...prev, [action]: false }))
    }
  }

    return (
    <div className="w-full h-full flex flex-col">
      {/* Top Section - User Info */}
      <div className="flex items-start space-x-3 mb-4">
        {/* Avatar */}
        <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-white shadow-sm">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-primary-600 font-semibold text-lg">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/profile/${user._id}`}
            className="block hover:text-primary-600 transition-colors group"
          >
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 break-words">
              {user.name || 'Unknown User'}
            </h3>
          </Link>
          <p className="text-sm text-gray-500 break-words">{user.email || 'No email'}</p>
          {user.bio && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2 break-words">{user.bio}</p>
          )}
          {type === 'pending' && (
            <div className="mt-2">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                <UserPlus className="w-3 h-3 mr-1" />
                Wants to connect
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section - Action Buttons */}
      <div className="mt-auto">
        {type === 'discover' && (
          <button
            onClick={() => handleAction('sendRequest')}
            disabled={loadingActions['sendRequest']}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white text-sm px-3 py-2 rounded-lg flex items-center justify-center space-x-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {loadingActions['sendRequest'] ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>{loadingActions['sendRequest'] ? 'Sending...' : 'Add Friend'}</span>
          </button>
        )}

        {type === 'pending' && (
          <div className="flex space-x-2">
            <button
              onClick={() => handleAction('accept')}
              disabled={loadingActions['accept'] || loadingActions['reject']}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-2 rounded-lg flex items-center justify-center space-x-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {loadingActions['accept'] ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>{loadingActions['accept'] ? 'Accepting...' : 'Accept'}</span>
            </button>
            <button
              onClick={() => handleAction('reject')}
              disabled={loadingActions['reject'] || loadingActions['accept']}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-2 rounded-lg flex items-center justify-center space-x-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
            >
              {loadingActions['reject'] ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <X className="w-4 h-4" />
              )}
              <span>{loadingActions['reject'] ? 'Rejecting...' : 'Reject'}</span>
            </button>
          </div>
        )}

        {type === 'friend' && (
          <button
            onClick={() => handleAction('remove')}
            disabled={loadingActions['remove']}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white text-sm px-3 py-2 rounded-lg flex items-center justify-center space-x-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {loadingActions['remove'] ? (
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              <UserX className="w-4 h-4" />
            )}
            <span>{loadingActions['remove'] ? 'Removing...' : 'Remove'}</span>
          </button>
        )}

        {type === 'pending-sent' && (
          <span className="w-full text-sm text-gray-500 flex items-center justify-center space-x-1 bg-gray-100 px-3 py-2 rounded-lg">
            <UserCheck className="w-4 h-4" />
            <span>Request Sent</span>
          </span>
        )}
      </div>
    </div>
  )
}

export default UserCard 
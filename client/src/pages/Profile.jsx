import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import PostCard from '../components/PostCard'
import LoadingSpinner from '../components/LoadingSpinner'
import EditProfile from '../components/EditProfile'
import api from '../services/api'
import { User, Mail, Calendar, FileText, Edit, Share2 } from 'lucide-react'
import ShareButton from '../components/ShareButton'

const Profile = () => {
  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showEditProfile, setShowEditProfile] = useState(false)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await api.get(`/users/${id}`)
        setUser(response.data.user)
        setPosts(response.data.posts)
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchUserProfile()
    }
  }, [id])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-red-900 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">User not found</h3>
          <p className="text-gray-600">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?._id === user._id



  const handleProfileUpdate = async (updatedUser) => {
    setUser(updatedUser)
    // Refresh the user's posts to show updated avatar
    if (currentUser?._id === user?._id) {
      try {
        const response = await api.get(`/users/${user._id}`)
        // Update posts with the new user data
        const updatedPosts = response.data.posts.map(post => ({
          ...post,
          author: updatedUser,
          comments: post.comments?.map(comment => 
            comment.user._id === updatedUser._id 
              ? { ...comment, user: updatedUser }
              : comment
          ) || []
        }))
        setPosts(updatedPosts)
      } catch (error) {
        console.error('Failed to refresh posts:', error)
      }
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 lg:px-0 pt-8">
      {/* Profile Header */}
      <div className="card mb-6">
        <div className="flex items-start space-x-4">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-primary-600 font-bold text-2xl">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              {isOwnProfile && (
                <>
                  <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2 py-1 rounded-full">
                    You
                  </span>
                  <button
                    onClick={() => setShowEditProfile(true)}
                    className="ml-auto btn-primary text-sm px-3 py-1 flex items-center space-x-1"
                  >
                    <Edit className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit Profile</span>
                  </button>
                </>
              )}
              <ShareButton
                url={`${window.location.origin}/shared/profile/${user._id}`}
                title={`${user.name}'s Profile`}
                text={`Check out ${user.name}'s profile on our platform`}
                className="ml-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm px-3 py-1 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-1 font-medium"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Share Profile</span>
              </ShareButton>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>
              
              {user.bio && (
                <div className="flex items-start space-x-2 pt-2">
                  <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {isOwnProfile ? 'Your Posts' : `${user.name}'s Posts`}
        </h2>
        
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isOwnProfile ? 'No posts yet' : 'No posts yet'}
            </h3>
            <p className="text-gray-600">
              {isOwnProfile 
                ? 'Start sharing your thoughts with the community!' 
                : `${user.name} hasn't shared any posts yet.`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfile
          onClose={() => setShowEditProfile(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  )
}

export default Profile 
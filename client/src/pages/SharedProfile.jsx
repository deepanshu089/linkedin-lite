import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Share2, Copy, ExternalLink, User, Mail, MapPin, Calendar, Users, MessageCircle } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import PostCard from '../components/PostCard'
import api from '../services/api'

const SharedProfile = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [userId])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const [userResponse, postsResponse] = await Promise.all([
        api.get(`/users/${userId}`),
        api.get(`/posts/user/${userId}`)
      ])
      setUser(userResponse.data.user)
      setPosts(postsResponse.data.posts)
    } catch (error) {
      console.error('Error fetching profile:', error)
      setError('Profile not found or no longer available')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/shared/profile/${userId}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user?.name}'s Profile`,
          text: `Check out ${user?.name}'s profile on our platform`,
          url: shareUrl
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback to copy to clipboard
      handleCopyLink()
    }
  }

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/shared/profile/${userId}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            to="/"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleShare}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
              
              <button
                onClick={handleCopyLink}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${
                  copied 
                    ? 'bg-green-500 text-white' 
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shared Profile</h1>
            <p className="text-gray-600">Viewing a profile shared with you</p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-3xl">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-2">{user?.name}</h2>
                <p className="text-blue-100 text-lg">{user?.email}</p>
                {user?.bio && (
                  <p className="text-blue-100 mt-2">{user.bio}</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{user?.friends?.length || 0}</p>
                <p className="text-gray-600">Friends</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-6 h-6 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
                <p className="text-gray-600">Posts</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {user?.createdAt ? formatDate(user.createdAt).split(' ')[2] : 'N/A'}
                </p>
                <p className="text-gray-600">Member Since</p>
              </div>
            </div>

            {user?.location && (
              <div className="flex items-center space-x-2 text-gray-600 mb-4">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Posts Section */}
        {posts.length > 0 ? (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Recent Posts</h3>
            <div className="space-y-6">
              {posts.slice(0, 3).map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
            {posts.length > 3 && (
              <div className="text-center mt-6">
                <p className="text-gray-600">And {posts.length - 3} more posts...</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center mb-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Posts Yet</h3>
            <p className="text-gray-600">This user hasn't shared any posts yet.</p>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExternalLink className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Join the Community</h3>
            <p className="text-gray-600 mb-6">
              Create an account to connect with {user?.name} and share your own stories with the community.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Link 
                to="/register"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Sign Up
              </Link>
              <Link 
                to="/login"
                className="bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SharedProfile 
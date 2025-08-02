import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Share2, Copy, ExternalLink, Heart, MessageCircle, User, Clock } from 'lucide-react'
import PostCard from '../components/PostCard'
import LoadingSpinner from '../components/LoadingSpinner'
import api from '../services/api'

const SharedPost = () => {
  const { postId } = useParams()
  const navigate = useNavigate()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchPost()
  }, [postId])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/posts/${postId}`)
      setPost(response.data.post)
    } catch (error) {
      console.error('Error fetching post:', error)
      setError('Post not found or no longer available')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/shared/post/${postId}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post?.author?.name}`,
          text: post?.content?.substring(0, 100) + '...',
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
    const shareUrl = `${window.location.origin}/shared/post/${postId}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Post Not Found</h2>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Shared Post</h1>
            <p className="text-gray-600">Viewing a post shared with you</p>
          </div>
        </div>

        {/* Post */}
        <div className="mb-8">
          <PostCard post={post} />
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExternalLink className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Join the Conversation</h3>
            <p className="text-gray-600 mb-6">
              Create an account to like, comment, and share your own posts with the community.
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

export default SharedPost 
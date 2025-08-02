import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, MessageCircle, User, Clock, Share2, Bookmark } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { usePosts } from '../contexts/PostContext'
import ShareButton from './ShareButton'

const PostCard = ({ post }) => {
  const { user } = useAuth()
  const { likePost, addComment } = usePosts()
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isLiking, setIsLiking] = useState(false)
  const [isCommenting, setIsCommenting] = useState(false)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)
    
    if (diffInMinutes < 1) {
      return 'Just now'
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`
    } else {
      return `${diffInDays}d ago`
    }
  }

  const handleLike = async () => {
    if (!user) return
    
    setIsLiking(true)
    try {
      const result = await likePost(post._id)
      if (!result.success) {
        console.error('Failed to like post:', result.message)
      }
    } catch (error) {
      console.error('Failed to like post:', error)
    } finally {
      setIsLiking(false)
    }
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || !user) return
    
    setIsCommenting(true)
    try {
      const result = await addComment(post._id, commentText)
      if (result.success) {
        setCommentText('')
      } else {
        console.error('Failed to add comment:', result.message)
      }
    } catch (error) {
      console.error('Failed to add comment:', error)
    } finally {
      setIsCommenting(false)
    }
  }

  const isLiked = post.likes?.some(like => 
    typeof like === 'string' ? like === user?._id : like._id === user?._id
  )



  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
      {/* Post Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
            {post.author?.avatar ? (
              <img 
                src={post.author.avatar} 
                alt={post.author.name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-lg">
                {post.author?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div className="flex-1">
            <Link 
              to={`/profile/${post.author?._id}`}
              className="font-semibold text-gray-900 hover:text-blue-600 transition-colors text-lg"
            >
              {post.author?.name || 'Unknown User'}
            </Link>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-6 pb-4">
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">
          {post.content}
        </p>
        
        {/* Media Display */}
        {post.media && post.media.length > 0 && (
          <div className="mt-6">
            {post.media.length === 1 ? (
              // Single media item
              <div className="rounded-xl overflow-hidden">
                {post.media[0].type === 'image' ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${post.media[0].url}`}
                    alt="Post media"
                    className="w-full max-h-96 object-cover"
                  />
                ) : (
                  <video
                    src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${post.media[0].url}`}
                    controls
                    className="w-full max-h-96 object-cover"
                  />
                )}
              </div>
            ) : (
              // Multiple media items
              <div className="grid grid-cols-2 gap-3">
                {post.media.map((item, index) => (
                  <div key={index} className="rounded-xl overflow-hidden">
                    {item.type === 'image' ? (
                      <img
                        src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${item.url}`}
                        alt="Post media"
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <video
                        src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${item.url}`}
                        controls
                        className="w-full h-40 object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="px-6 py-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-2 transition-all duration-200 rounded-lg px-3 py-2 ${
                isLiked 
                  ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                  : 'text-gray-500 hover:text-red-500 hover:bg-gray-50'
              } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="font-medium">{post.likes?.length || 0}</span>
              {isLiking && <span className="text-xs text-gray-400">...</span>}
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-lg px-3 py-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span className="font-medium">{post.comments?.length || 0}</span>
            </button>

            <ShareButton
              url={`${window.location.origin}/shared/post/${post._id}`}
              title={`Post by ${post.author?.name}`}
              text={post.content?.substring(0, 100) + '...'}
              className="flex items-center space-x-2 text-gray-500 hover:text-green-600 hover:bg-green-50 transition-all duration-200 rounded-lg px-3 py-2"
            >
              <Share2 className="w-5 h-5" />
              <span className="font-medium">Share</span>
            </ShareButton>
          </div>

          <button className="flex items-center space-x-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200 rounded-lg px-3 py-2">
            <Bookmark className="w-5 h-5" />
            <span className="font-medium">Save</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          {/* Add Comment */}
          {user && (
            <form onSubmit={handleComment} className="mb-6">
              <div className="flex space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">
                    {user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isCommenting}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!commentText.trim() || isCommenting}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCommenting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            {post.comments?.map((comment, index) => (
              <div key={index} className="flex space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">
                    {comment.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">
                        {comment.user?.name || 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PostCard 
import { useEffect, useState } from 'react'
import { usePosts } from '../contexts/PostContext'
import CreatePost from '../components/CreatePost'
import PostCard from '../components/PostCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { RefreshCw, TrendingUp, Users, Sparkles, Share2 } from 'lucide-react'
import ShareButton from '../components/ShareButton'
import api from '../services/api'

const Feed = () => {
  const { posts, loading, error, fetchPosts } = usePosts()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [feedStats, setFeedStats] = useState({
    totalUsers: 0,
    totalMessages: 0,
    totalPosts: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
    fetchFeedStats()
  }, [])

  const fetchFeedStats = async () => {
    try {
      setStatsLoading(true)
      const [userStatsRes, messageStatsRes, postStatsRes] = await Promise.all([
        api.get('/users/feed-stats'),
        api.get('/messages/feed-stats'),
        api.get('/posts/feed-stats')
      ])
      
      setFeedStats({
        totalUsers: userStatsRes.data.totalUsers || 0,
        totalMessages: messageStatsRes.data.totalMessages || 0,
        totalPosts: postStatsRes.data.totalPosts || 0
      })
    } catch (error) {
      console.error('Error fetching feed stats:', error)
      // Keep default values if API fails
    } finally {
      setStatsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await Promise.all([fetchPosts(), fetchFeedStats()])
    } finally {
      setIsRefreshing(false)
    }
  }

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex items-center justify-center min-h-96">
          <LoadingSpinner size="large" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Welcome to Your Feed
            </h1>
            <p className="text-gray-600 text-lg">
              Discover stories, share moments, and connect with your community
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-medium text-gray-600">Total Posts</p>
                   <div className="text-2xl font-bold text-gray-900">
                     {statsLoading ? (
                       <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                     ) : (
                       feedStats.totalPosts
                     )}
                   </div>
                 </div>
                 <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                   <TrendingUp className="w-6 h-6 text-blue-600" />
                 </div>
               </div>
             </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <div className="text-2xl font-bold text-gray-900">
                    {statsLoading ? (
                      <div className="w-8 h-8 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
                    ) : (
                      feedStats.totalUsers
                    )}
                  </div>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Messages</p>
                  <div className="text-2xl font-bold text-gray-900">
                    {statsLoading ? (
                      <div className="w-8 h-8 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
                    ) : (
                      feedStats.totalMessages
                    )}
                  </div>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Header with Refresh */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Latest Updates</h2>
            <p className="text-gray-600">Stay connected with your network</p>
          </div>
          <div className="flex items-center space-x-3">
            <ShareButton
              url={window.location.href}
              title="Check out this amazing feed!"
              text="Discover stories, share moments, and connect with the community."
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:block font-medium">Share Feed</span>
            </ShareButton>
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:block font-medium">Refresh</span>
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              </div>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

                 {/* Create Post Section */}
         <div className="mb-8" data-create-post>
           <CreatePost />
         </div>

        {/* Posts Section */}
        {posts.length === 0 && !loading ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
                         <h3 className="text-xl font-semibold text-gray-900 mb-3">No posts yet</h3>
             <p className="text-gray-600 mb-8 max-w-md mx-auto">
               Be the first to share something amazing with your community! Your story could inspire others.
             </p>
             <button 
               onClick={() => {
                 // Scroll to the CreatePost component
                 const createPostSection = document.querySelector('[data-create-post]');
                 if (createPostSection) {
                   createPostSection.scrollIntoView({ behavior: 'smooth' });
                   // Focus on the textarea after scrolling
                   setTimeout(() => {
                     const textarea = createPostSection.querySelector('textarea');
                     if (textarea) textarea.focus();
                   }, 500);
                 }
               }}
               className="group relative inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 overflow-hidden"
             >
               <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
               <span className="relative flex items-center space-x-2">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                 </svg>
                 <span>Start Sharing</span>
               </span>
             </button>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Share your thoughts
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Upload media
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                Connect with friends
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <div
                key={post._id}
                className="transform transition-all duration-300 hover:scale-[1.02]"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <PostCard post={post} />
              </div>
            ))}
            
            {loading && posts.length > 0 && (
              <div className="flex justify-center py-8">
                <div className="flex items-center space-x-3">
                  <LoadingSpinner />
                  <span className="text-gray-600 font-medium">Loading more posts...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom CTA */}
        {posts.length > 0 && (
          <div className="mt-12 text-center">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <Sparkles className="w-8 h-8 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Keep the conversation going!</h3>
              <p className="text-gray-600 mb-4">
                Share your thoughts, experiences, and connect with your community.
              </p>
                             <button 
                 onClick={() => {
                   // Scroll to the CreatePost component
                   const createPostSection = document.querySelector('[data-create-post]');
                   if (createPostSection) {
                     createPostSection.scrollIntoView({ behavior: 'smooth' });
                     // Focus on the textarea after scrolling
                     setTimeout(() => {
                       const textarea = createPostSection.querySelector('textarea');
                       if (textarea) textarea.focus();
                     }, 500);
                   }
                 }}
                 className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 overflow-hidden"
               >
                 <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                 <span className="relative flex items-center space-x-2">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                   </svg>
                   <span>Share Your Story</span>
                 </span>
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Feed 
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { User, Play, ArrowRight, Users, MessageCircle, Heart } from 'lucide-react'
import { useState } from 'react'

const Homepage = () => {
  const { demoLogin, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleDemoLogin = async () => {
    setIsLoading(true)
    try {
      const result = await demoLogin()
      if (result.success) {
        navigate('/feed')
      }
    } catch (error) {
      console.error('Demo login failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // If user is already authenticated, redirect to feed
  if (isAuthenticated) {
    navigate('/feed')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <User className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                LinkedIn Lite
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with friends, share your moments, and discover amazing content in our vibrant social community.
            </p>

            {/* Demo Login Button */}
            <div className="mb-12">
              <button
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg"
              >
                {isLoading ? (
                  <div className="loading-spinner mr-3"></div>
                ) : (
                  <Play className="w-6 h-6 mr-3" />
                )}
                Try Demo Account
                <ArrowRight className="w-5 h-5 ml-3" />
              </button>
            </div>

            {/* Alternative Login Options */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/login"
                className="px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-200"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-all duration-200"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Everything you need to stay connected
            </h2>
            <p className="text-lg text-gray-600">
              Explore all the features that make LinkedIn Lite the perfect social platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Connect with Friends</h3>
              <p className="text-gray-600">Build your network and stay connected with people who matter to you.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-time Messaging</h3>
              <p className="text-gray-600">Chat with friends instantly with our real-time messaging system.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Share Your Moments</h3>
              <p className="text-gray-600">Post updates, photos, and share your life with your community.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of users who are already connecting on LinkedIn Lite
          </p>
          <button
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 text-lg"
          >
            {isLoading ? (
              <div className="loading-spinner mr-3"></div>
            ) : (
              <Play className="w-6 h-6 mr-3" />
            )}
            Start Exploring Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default Homepage 
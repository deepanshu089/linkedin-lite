import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useMessages } from '../contexts/MessagesContext'
import { User, LogOut, Home, User as UserIcon, Users, MessageCircle, Menu, X, Settings, Play } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'

const Navbar = () => {
  const { user, isAuthenticated, logout, demoLogin } = useAuth()
  const { unreadCount, fetchUnreadCount } = useMessages()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const settingsRef = useRef(null)

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount()
    }
  }, [isAuthenticated, fetchUnreadCount])

  // Close settings dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setIsSettingsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    logout()
    setIsSettingsOpen(false)
    setIsMobileMenuOpen(false)
  }

  const handleDemoLogin = async () => {
    try {
      const result = await demoLogin()
      if (result.success) {
        navigate('/feed')
      }
    } catch (error) {
      console.error('Demo login failed:', error)
    }
    setIsSettingsOpen(false)
    setIsMobileMenuOpen(false)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen)
  }

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
              <User className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              LinkedIn Lite
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link
              to="/feed"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-blue-50 group"
            >
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <span>Feed</span>
            </Link>
            <Link
              to="/friends"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-blue-50 group"
            >
              <Users className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <span>Network</span>
            </Link>
            <Link
              to="/messages"
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-blue-50 group relative"
            >
              <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
              <span>Messages</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold min-w-[20px] flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </Link>
            {user?._id ? (
              <Link
                to={`/profile/${user._id}`}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-blue-50 group"
              >
                <UserIcon className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                <span>Profile</span>
              </Link>
            ) : (
              <span className="flex items-center space-x-2 text-gray-400 px-4 py-2 rounded-lg font-medium">
                <UserIcon className="w-5 h-5" />
                <span>Profile</span>
              </span>
            )}
          </div>

          {/* Desktop User Section */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Settings Dropdown */}
            <div className="relative" ref={settingsRef}>
              <button
                onClick={toggleSettings}
                className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                <Settings className="w-5 h-5" />
              </button>
              {isSettingsOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-200">
                  <button
                    onClick={handleDemoLogin}
                    className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 rounded-lg"
                  >
                    <Play className="w-5 h-5 mr-3" />
                    Switch to Demo
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 rounded-lg"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                  </button>
                </div>
              )}
            </div>
            
            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-200 shadow-md ring-2 ring-blue-100 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>


    </nav>
    
    {/* Mobile Sidebar Overlay */}
    {isMobileMenuOpen && (
      <div 
        className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={closeMobileMenu}
      />
    )}
    
    {/* Mobile Sidebar */}
    <div 
      className={`lg:hidden fixed top-0 right-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`} 
      style={{ 
        backgroundColor: '#ffffff',
        boxShadow: '-4px 0 15px rgba(0, 0, 0, 0.1)',
        borderLeft: '1px solid #e5e7eb'
      }}
    >
      <div className="flex flex-col h-full" style={{ backgroundColor: '#ffffff' }}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              LinkedIn Lite
            </span>
          </div>
          <button
            onClick={closeMobileMenu}
            className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 px-6 py-6 space-y-2">
          <Link
            to="/feed"
            onClick={closeMobileMenu}
            className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 py-4 px-4 rounded-xl font-medium hover:bg-blue-50 transition-all duration-200"
          >
            <Home className="w-6 h-6" />
            <span className="text-lg">Feed</span>
          </Link>
          <Link
            to="/friends"
            onClick={closeMobileMenu}
            className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 py-4 px-4 rounded-xl font-medium hover:bg-blue-50 transition-all duration-200"
          >
            <Users className="w-6 h-6" />
            <span className="text-lg">Network</span>
          </Link>
          <Link
            to="/messages"
            onClick={closeMobileMenu}
            className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 py-4 px-4 rounded-xl font-medium hover:bg-blue-50 transition-all duration-200 relative"
          >
            <MessageCircle className="w-6 h-6" />
            <span className="text-lg">Messages</span>
            {unreadCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold min-w-[20px] flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </Link>
          {user?._id ? (
            <Link
              to={`/profile/${user._id}`}
              onClick={closeMobileMenu}
              className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 py-4 px-4 rounded-xl font-medium hover:bg-blue-50 transition-all duration-200"
            >
              <UserIcon className="w-6 h-6" />
              <span className="text-lg">Profile</span>
            </Link>
          ) : (
            <span className="flex items-center space-x-3 text-gray-400 py-4 px-4 rounded-xl font-medium">
              <UserIcon className="w-6 h-6" />
              <span className="text-lg">Profile</span>
            </span>
          )}
        </div>

        {/* Sidebar Footer - User Info */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-200 shadow-md ring-2 ring-blue-100 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-xl">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-lg">{user?.name || "User"}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleDemoLogin}
            className="flex items-center justify-center space-x-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-4 px-4 rounded-xl font-medium transition-all duration-200 w-full mb-2"
          >
            <Play className="w-6 h-6" />
            <span className="text-lg">Switch to Demo</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center space-x-3 text-red-600 hover:text-red-700 hover:bg-red-50 py-4 px-4 rounded-xl font-medium transition-all duration-200 w-full"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-lg">Logout</span>
          </button>
        </div>
      </div>
    </div>
  </>
  )
}

export default Navbar
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { usePosts } from '../contexts/PostContext'
import { User, Camera, X, Check } from 'lucide-react'
import api from '../services/api'

const EditProfile = ({ onClose, onUpdate }) => {
  const { user, setUser } = useAuth()
  const { refreshPosts, posts, setPosts } = usePosts()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    avatar: user?.avatar || ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // For now, we'll use a placeholder URL
      // In a real app, you'd upload to a service like Cloudinary
      const reader = new FileReader()
      reader.onload = (e) => {
        const previewUrl = e.target.result
        setAvatarPreview(previewUrl)
        setFormData(prev => ({
          ...prev,
          avatar: previewUrl
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      console.log('Submitting form data:', formData)
      const response = await api.put('/users/profile', formData)
      
      // Update the user context
      setUser(response.data.user)
      
      // Call the onUpdate callback
      if (onUpdate) {
        onUpdate(response.data.user)
      }
      
      // Update all posts in the feed to show the new avatar
      const updatedUser = response.data.user
      
      // Update posts where the current user is the author or has commented
      setPosts(prevPosts => 
        prevPosts.map(post => {
          let updatedPost = post
          
          // Update author if it's the current user
          if (post.author._id === updatedUser._id) {
            updatedPost = { ...updatedPost, author: updatedUser }
          }
          
          // Update comments where the current user is the commenter
          if (post.comments && post.comments.length > 0) {
            updatedPost = {
              ...updatedPost,
              comments: post.comments.map(comment => 
                comment.user._id === updatedUser._id 
                  ? { ...comment, user: updatedUser }
                  : comment
              )
            }
          }
          
          return updatedPost
        })
      )
      
      // Refresh posts to update avatars in the feed
      await refreshPosts()
      
      // Close the modal
      onClose()
    } catch (error) {
      console.error('Update profile error:', error.response?.data)
      if (error.response?.data?.errors) {
        // Handle validation errors
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ')
        setError(errorMessages)
      } else {
        setError(error.response?.data?.message || 'Failed to update profile')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Avatar Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photo
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-primary-600" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-1 cursor-pointer hover:bg-primary-700 transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">
                  Click the camera icon to upload a new photo
                </p>
              </div>
            </div>
          </div>

          {/* Name Field */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field w-full"
              placeholder="Enter your name"
              required
            />
          </div>

          {/* Bio Field */}
          <div className="mb-6">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              className="input-field w-full resize-none"
              placeholder="Tell us about yourself..."
              maxLength="500"
            />
            <div className="text-xs text-gray-500 mt-1 text-right">
              {formData.bio.length}/500
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.name.trim()}
              className="flex-1 btn-primary flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditProfile 
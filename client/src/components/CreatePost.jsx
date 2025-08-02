import { useState, useRef } from 'react'
import { Send, Image, Video, X, Sparkles } from 'lucide-react'
import { usePosts } from '../contexts/PostContext'

const CreatePost = () => {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const fileInputRef = useRef(null)
  const { createPost } = usePosts()

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/') || file.type.startsWith('video/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB limit
      return isValidType && isValidSize
    })

    if (validFiles.length + selectedFiles.length > 5) {
      alert('Maximum 5 files allowed')
      return
    }

    setSelectedFiles(prev => [...prev, ...validFiles])
    
    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewUrls(prev => [...prev, { url: e.target.result, file }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() && selectedFiles.length === 0) return
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('content', content.trim())
      
      selectedFiles.forEach(file => {
        formData.append('media', file)
      })

      const result = await createPost(formData)
      if (result.success) {
        setContent('')
        setSelectedFiles([])
        setPreviewUrls([])
      }
    } catch (error) {
      console.error('Failed to create post:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const remainingChars = 1000 - content.length
  const isOverLimit = remainingChars < 0

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4 border-b border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Share Your Story</h3>
            <p className="text-sm text-gray-600">What's happening in your world?</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6">
        <div className="mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts, experiences, or moments that matter to you..."
            className={`w-full resize-none border-0 focus:ring-0 focus:outline-none text-gray-900 placeholder-gray-500 text-lg leading-relaxed ${
              isOverLimit ? 'text-red-500' : ''
            }`}
            style={{ minHeight: '120px' }}
            maxLength={1000}
            disabled={isSubmitting}
          />
        </div>

        {/* File Preview */}
        {previewUrls.length > 0 && (
          <div className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {previewUrls.map((preview, index) => (
                <div key={index} className="relative group rounded-lg overflow-hidden">
                  {preview.file.type.startsWith('image/') ? (
                    <img
                      src={preview.url}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ) : (
                    <video
                      src={preview.url}
                      className="w-full h-32 object-cover rounded-lg"
                      controls
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-all duration-200 shadow-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            {/* Character Counter */}
            <div className="text-sm">
              {remainingChars >= 0 ? (
                <span className="text-gray-500">
                  {remainingChars} characters left
                </span>
              ) : (
                <span className="text-red-500 font-medium">
                  {Math.abs(remainingChars)} characters over limit
                </span>
              )}
            </div>
            
            {/* Media Buttons */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={selectedFiles.length >= 5}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Image className="w-4 h-4" />
                <span className="text-sm font-medium">Image</span>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={selectedFiles.length >= 5}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Video className="w-4 h-4" />
                <span className="text-sm font-medium">Video</span>
              </button>

            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={(!content.trim() && selectedFiles.length === 0) || isSubmitting || isOverLimit}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Posting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Share Post</span>
              </>
            )}
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </form>
    </div>
  )
}

export default CreatePost 
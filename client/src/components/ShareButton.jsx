import { useState } from 'react'
import { Share2, Copy, Check } from 'lucide-react'

const ShareButton = ({ 
  url, 
  title, 
  text, 
  className = "flex items-center space-x-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 rounded-lg px-3 py-2",
  children = (
    <>
      <Share2 className="w-4 h-4" />
      <span className="font-medium">Share</span>
    </>
  )
}) => {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url
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
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  return (
    <button
      onClick={handleShare}
      className={className}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-600" />
          <span className="font-medium text-green-600">Copied!</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}

export default ShareButton 
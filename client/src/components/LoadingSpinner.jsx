const LoadingSpinner = ({ size = 'default' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    default: 'h-6 w-6',
    large: 'h-8 w-8'
  }

  return (
    <div className={`${sizeClasses[size] || sizeClasses.default} animate-spin rounded-full border-2 border-gray-300 border-t-primary-500`}></div>
  )
}

export default LoadingSpinner 
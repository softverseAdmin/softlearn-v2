export interface LoadingSkeletonProps {
  width?: string | number
  height?: string | number
  className?: string
  count?: number
  circle?: boolean
  borderRadius?: string | number
  animate?: boolean
}

/**
 * LoadingSkeleton component for showing loading state
 * Improves perceived performance with skeleton screens
 */
export function LoadingSkeleton({
  width = '100%',
  height = '20px',
  className = '',
  count = 1,
  circle = false,
  borderRadius = '8px',
  animate = true,
}: LoadingSkeletonProps) {
  const items = Array.from({ length: count }).map((_, i) => (
    <div
      key={i}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: circle ? '50%' : typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
      }}
      className={`
        bg-gray-200
        ${animate ? 'animate-pulse' : ''}
        ${circle ? 'rounded-full' : ''}
        ${className}
      `}
      role="status"
      aria-label="Loading content"
    />
  ))

  return <>{items}</>
}

/**
 * Card skeleton for table/list items
 */
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg p-4 border border-gray-200">
          <LoadingSkeleton height="24px" className="mb-3 w-3/4" />
          <LoadingSkeleton height="16px" className="mb-2 w-full" />
          <LoadingSkeleton height="16px" className="mb-2 w-5/6" />
          <LoadingSkeleton height="16px" className="w-4/6" />
        </div>
      ))}
    </div>
  )
}

/**
 * Table row skeleton
 */
export function TableRowSkeleton({ columns = 4, count = 5 }: { columns?: number; count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <LoadingSkeleton key={colIndex} height="20px" className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

/**
 * Avatar skeleton
 */
export function AvatarSkeleton({ size = 48 }: { size?: number }) {
  return (
    <LoadingSkeleton
      width={size}
      height={size}
      circle
      className="bg-gray-300"
    />
  )
}

export default LoadingSkeleton

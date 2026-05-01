import { useEffect, useRef, useState } from 'react'
import { observeElement } from '../lib/performance'

export interface LazyImageProps {
  src: string
  alt: string
  srcSet?: string
  sizes?: string
  width?: number
  height?: number
  className?: string
  placeholder?: string
}

/**
 * LazyImage component for performance optimization
 * Uses Intersection Observer API to lazily load images
 */
export function LazyImage({
  src,
  alt,
  srcSet,
  sizes,
  width,
  height,
  className = '',
  placeholder = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"%3E%3Crect fill="%23f0f0f0" width="400" height="300"/%3E%3C/svg%3E',
}: LazyImageProps) {
  const [imageSrc, setImageSrc] = useState(placeholder)
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!imgRef.current) return

    // If image is already in viewport, load immediately
    if ('loading' in imgRef.current) {
      imgRef.current.loading = 'lazy'
      setImageSrc(src)
      return
    }

    // Fall back to Intersection Observer for older browsers
    const unobserve = observeElement(
      imgRef.current,
      isVisible => {
        if (isVisible) {
          setImageSrc(src)
          unobserve()
        }
      },
      { rootMargin: '50px' }
    )

    return unobserve
  }, [src])

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-75'} transition-opacity duration-300`}
      onLoad={() => setIsLoaded(true)}
    />
  )
}

export default LazyImage

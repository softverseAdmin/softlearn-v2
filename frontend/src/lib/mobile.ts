/**
 * Mobile responsiveness and touch optimization utilities
 */

export interface TouchGestureHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onDoubleTap?: () => void
  onLongPress?: () => void
  threshold?: number
}

/**
 * Detect touch swipe gestures
 */
export function setupTouchGestures(
  element: HTMLElement,
  handlers: TouchGestureHandlers
): () => void {
  const { threshold = 50, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onDoubleTap, onLongPress } = handlers
  
  let startX = 0
  let startY = 0
  let startTime = 0
  let lastTapTime = 0
  let longPressTimer: ReturnType<typeof setTimeout> | null = null

  const handleTouchStart = (e: TouchEvent) => {
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
    startTime = Date.now()
    lastTapTime = startTime

    if (onLongPress) {
      longPressTimer = setTimeout(() => {
        onLongPress()
      }, 500)
    }
  }

  const handleTouchEnd = (e: TouchEvent) => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
    }

    const endX = e.changedTouches[0].clientX
    const endY = e.changedTouches[0].clientY
    const duration = Date.now() - startTime

    const deltaX = endX - startX
    const deltaY = endY - startY
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)

    // Check for double tap
    if (duration < 300 && Date.now() - lastTapTime < 300) {
      onDoubleTap?.()
      return
    }

    // Check for swipe
    if (duration < 500 && absDeltaX > threshold && absDeltaX > absDeltaY) {
      if (deltaX < 0) {
        onSwipeLeft?.()
      } else {
        onSwipeRight?.()
      }
    } else if (duration < 500 && absDeltaY > threshold && absDeltaY > absDeltaX) {
      if (deltaY < 0) {
        onSwipeUp?.()
      } else {
        onSwipeDown?.()
      }
    }
  }

  element.addEventListener('touchstart', handleTouchStart)
  element.addEventListener('touchend', handleTouchEnd)

  return () => {
    element.removeEventListener('touchstart', handleTouchStart)
    element.removeEventListener('touchend', handleTouchEnd)
  }
}

/**
 * Check if device is touch-capable
 */
export function isTouchDevice(): boolean {
  return (
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.maxTouchPoints > 0)
  )
}

/**
 * Get viewport dimensions
 */
export function getViewportSize(): { width: number; height: number } {
  return {
    width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
    height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
  }
}

/**
 * Check media query
 */
export function matchesMediaQuery(query: string): boolean {
  return window.matchMedia(query).matches
}

/**
 * Media query breakpoints
 */
export const breakpoints = {
  xs: '(max-width: 320px)',
  sm: '(max-width: 640px)',
  md: '(max-width: 768px)',
  lg: '(max-width: 1024px)',
  xl: '(max-width: 1280px)',
  '2xl': '(max-width: 1536px)',
}

/**
 * Check if device is in portrait orientation
 */
export function isPortraitOrientation(): boolean {
  return window.innerHeight > window.innerWidth
}

/**
 * Check if device is in landscape orientation
 */
export function isLandscapeOrientation(): boolean {
  return window.innerWidth > window.innerHeight
}

/**
 * Check device type
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  const width = getViewportSize().width
  
  if (width < 768) {
    return 'mobile'
  } else if (width < 1024) {
    return 'tablet'
  } else {
    return 'desktop'
  }
}

/**
 * Optimize button size for touch
 */
export const touchButtonSize = {
  sm: '40px', // Minimum 44px, but 40px with padding
  md: '48px',
  lg: '56px',
}

/**
 * Set viewport meta tag for mobile optimization
 */
export function setViewportMeta(): void {
  const meta = document.querySelector('meta[name="viewport"]')
  if (meta) {
    meta.setAttribute(
      'content',
      'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
    )
  } else {
    const newMeta = document.createElement('meta')
    newMeta.name = 'viewport'
    newMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes'
    document.head.appendChild(newMeta)
  }
}

/**
 * Disable zoom on double tap (for PWA-like experience)
 */
export function disableDoubleTapZoom(): void {
  document.addEventListener('touchstart', (e: TouchEvent) => {
    if (e.touches.length > 1) {
      e.preventDefault()
    }
  }, { passive: false })
}

/**
 * Handle safe area insets for notched devices
 */
export function applySafeAreaInsets(): void {
  const style = document.documentElement.style
  const topInset = 'max(0px, env(safe-area-inset-top))'
  const rightInset = 'max(0px, env(safe-area-inset-right))'
  const bottomInset = 'max(0px, env(safe-area-inset-bottom))'
  const leftInset = 'max(0px, env(safe-area-inset-left))'

  style.setProperty('--safe-area-top', topInset)
  style.setProperty('--safe-area-right', rightInset)
  style.setProperty('--safe-area-bottom', bottomInset)
  style.setProperty('--safe-area-left', leftInset)
}

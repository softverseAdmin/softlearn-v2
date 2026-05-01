import { useEffect, useState } from 'react'
import { getViewportSize, getDeviceType, isPortraitOrientation, type getDeviceType as getDeviceTypeType } from '../lib/mobile'

/**
 * Hook for responsive design
 */
export function useResponsive() {
  const [dimensions, setDimensions] = useState(getViewportSize())
  const [deviceType, setDeviceType] = useState<ReturnType<typeof getDeviceType>>(getDeviceType())
  const [isPortrait, setIsPortrait] = useState(isPortraitOrientation())

  useEffect(() => {
    const handleResize = () => {
      setDimensions(getViewportSize())
      setDeviceType(getDeviceType())
      setIsPortrait(isPortraitOrientation())
    }

    const handleOrientationChange = () => {
      setTimeout(handleResize, 100)
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return {
    width: dimensions.width,
    height: dimensions.height,
    deviceType,
    isPortrait,
    isMobile: deviceType === 'mobile',
    isTablet: deviceType === 'tablet',
    isDesktop: deviceType === 'desktop',
  }
}

/**
 * Hook for touch event detection
 */
export function useTouch() {
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    const hasTouchSupport = () => {
      return (
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        (navigator.msMaxTouchPoints > 0)
      )
    }

    setIsTouchDevice(hasTouchSupport())
  }, [])

  return { isTouchDevice }
}

/**
 * Hook for handling safe area insets (notched devices)
 */
export function useSafeArea() {
  const [safeArea, setSafeArea] = useState({
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
  })

  useEffect(() => {
    const updateSafeArea = () => {
      const root = document.documentElement
      setSafeArea({
        top: getComputedStyle(root).getPropertyValue('--safe-area-top') || '0px',
        right: getComputedStyle(root).getPropertyValue('--safe-area-right') || '0px',
        bottom: getComputedStyle(root).getPropertyValue('--safe-area-bottom') || '0px',
        left: getComputedStyle(root).getPropertyValue('--safe-area-left') || '0px',
      })
    }

    updateSafeArea()

    window.addEventListener('resize', updateSafeArea)
    return () => window.removeEventListener('resize', updateSafeArea)
  }, [])

  return safeArea
}

/**
 * Hook for touch gesture handling
 */
export function useTouchGestures(callbacks: {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onDoubleTap?: () => void
  onLongPress?: () => void
}) {
  useEffect(() => {
    const { setupTouchGestures } = require('../lib/mobile')
    
    const cleanup = setupTouchGestures(document.body, {
      threshold: 50,
      ...callbacks,
    })

    return cleanup
  }, [callbacks])
}

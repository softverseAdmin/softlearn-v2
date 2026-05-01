/**
 * Performance optimization utilities
 */

/**
 * Measure performance metrics
 */
export function measurePerformance(label: string): () => number {
  const startTime = performance.now()
  return () => {
    const endTime = performance.now()
    const duration = endTime - startTime
    console.log(`${label}: ${duration.toFixed(2)}ms`)
    return duration
  }
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  return function debounced(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  return function throttled(...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

/**
 * Intersection Observer for lazy loading
 */
export function observeElement(
  element: Element,
  callback: (isVisible: boolean) => void,
  options?: IntersectionObserverInit
): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        callback(entry.isIntersecting)
      })
    },
    { threshold: 0.1, ...options }
  )

  observer.observe(element)

  return () => observer.disconnect()
}

/**
 * Request idle callback polyfill
 */
export function scheduleIdleTask(callback: () => void): number {
  if ('requestIdleCallback' in window) {
    return requestIdleCallback(callback)
  }
  return setTimeout(callback, 1)
}

/**
 * Cancel idle callback
 */
export function cancelIdleTask(id: number): void {
  if ('cancelIdleCallback' in window) {
    cancelIdleCallback(id)
  } else {
    clearTimeout(id)
  }
}

/**
 * Preload resources
 */
export function preloadResource(url: string, type: 'image' | 'script' | 'style' | 'font'): void {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = url

  switch (type) {
    case 'image':
      link.as = 'image'
      break
    case 'script':
      link.as = 'script'
      break
    case 'style':
      link.as = 'style'
      break
    case 'font':
      link.as = 'font'
      link.crossOrigin = 'anonymous'
      break
  }

  document.head.appendChild(link)
}

/**
 * DNS prefetch for external domains
 */
export function dnsPrefetch(domain: string): void {
  const link = document.createElement('link')
  link.rel = 'dns-prefetch'
  link.href = `//${domain}`
  document.head.appendChild(link)
}

/**
 * HTTP/2 Server push optimization
 */
export function preconnect(domain: string): void {
  const link = document.createElement('link')
  link.rel = 'preconnect'
  link.href = `//${domain}`
  document.head.appendChild(link)
}

/**
 * Optimize CLS (Cumulative Layout Shift) by reserving space
 */
export function reserveSpace(width: number, height: number): React.CSSProperties {
  return {
    aspectRatio: `${width} / ${height}`,
  }
}

/**
 * Lazy load images with srcset
 */
export interface ResponsiveImageProps {
  src: string
  alt: string
  srcSet?: string
  sizes?: string
  loading?: 'lazy' | 'eager'
  width?: number
  height?: number
}

export function createResponsiveImage(props: ResponsiveImageProps): ResponsiveImageProps {
  return {
    loading: 'lazy',
    ...props,
  }
}

/**
 * Web font loading optimization
 */
export function optimizeWebFont(
  familyName: string,
  url: string,
  options?: { display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional' }
): void {
  const style = document.createElement('style')
  style.textContent = `
    @font-face {
      font-family: '${familyName}';
      src: url('${url}');
      font-display: ${options?.display || 'swap'};
    }
  `
  document.head.appendChild(style)
}

/**
 * Bundle size analysis helper
 */
export function logBundleSize(): void {
  if (import.meta.env.DEV) {
    const perfEntries = performance.getEntriesByType('navigation')
    if (perfEntries.length > 0) {
      const navTiming = perfEntries[0] as PerformanceNavigationTiming
      console.log(`
        Performance Metrics:
        - Time to First Byte: ${navTiming.responseStart}ms
        - Page Load Time: ${navTiming.loadEventEnd}ms
        - DOM Interactive: ${navTiming.domInteractive}ms
        - DOM Content Loaded: ${navTiming.domContentLoadedEventEnd}ms
      `)
    }
  }
}

/**
 * Cache API for offline support
 */
export async function cacheAssets(cacheName: string, assets: string[]): Promise<void> {
  const cache = await caches.open(cacheName)
  await cache.addAll(assets)
}

/**
 * Get cached asset
 */
export async function getCachedAsset(cacheName: string, url: string): Promise<Response | undefined> {
  const cache = await caches.open(cacheName)
  return cache.match(url)
}

/**
 * Monitor Web Vitals
 */
export interface WebVitals {
  fcp?: number
  lcp?: number
  fid?: number
  cls?: number
  ttfb?: number
}

export function observeWebVitals(callback: (vitals: WebVitals) => void): void {
  const vitals: WebVitals = {}

  // First Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      const fcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint')
        if (fcpEntry) {
          vitals.fcp = fcpEntry.startTime
          callback(vitals)
        }
      })
      fcpObserver.observe({ type: 'paint', buffered: true })

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver(list => {
        const entries = list.getEntries()
        vitals.lcp = entries[entries.length - 1].startTime
        callback(vitals)
      })
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

      // Cumulative Layout Shift
      let clsValue = 0
      const clsObserver = new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          if ((entry as any).hadRecentInput) continue
          clsValue += (entry as any).value
          vitals.cls = clsValue
          callback(vitals)
        }
      })
      clsObserver.observe({ type: 'layout-shift', buffered: true })
    } catch (e) {
      console.error('Error observing Web Vitals:', e)
    }
  }
}

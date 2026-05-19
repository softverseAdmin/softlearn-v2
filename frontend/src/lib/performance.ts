export interface WebVitals {
  fcp?: number
  lcp?: number
  cls?: number
}

type LayoutShiftPerformanceEntry = PerformanceEntry & {
  hadRecentInput?: boolean
  value?: number
}

export function observeWebVitals(callback: (vitals: WebVitals) => void): () => void {
  const vitals: WebVitals = {}
  const disconnectors: Array<() => void> = []

  if (!('PerformanceObserver' in window)) {
    return () => {}
  }

  try {
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint')
      if (fcpEntry) {
        vitals.fcp = fcpEntry.startTime
        callback(vitals)
      }
    })
    fcpObserver.observe({ type: 'paint', buffered: true })
    disconnectors.push(() => fcpObserver.disconnect())

    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const latestEntry = entries[entries.length - 1]
      if (latestEntry) {
        vitals.lcp = latestEntry.startTime
        callback(vitals)
      }
    })
    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
    disconnectors.push(() => lcpObserver.disconnect())

    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as LayoutShiftPerformanceEntry[]) {
        if (entry.hadRecentInput) {
          continue
        }

        clsValue += entry.value ?? 0
        vitals.cls = clsValue
        callback(vitals)
      }
    })
    clsObserver.observe({ type: 'layout-shift', buffered: true })
    disconnectors.push(() => clsObserver.disconnect())
  } catch {
    return () => {}
  }

  return () => {
    disconnectors.forEach((disconnect) => disconnect())
  }
}

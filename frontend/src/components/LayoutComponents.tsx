import { type ReactNode } from 'react'

/**
 * ResponsiveGrid component for responsive grid layouts
 */
export function ResponsiveGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4,
}: {
  children: ReactNode
  columns?: {
    mobile?: number
    tablet?: number
    desktop?: number
  }
  gap?: number
}) {
  const gapClass = `gap-${gap}`
  const mobileClass = `grid-cols-${columns.mobile || 1}`
  const tabletClass = columns.tablet ? `md:grid-cols-${columns.tablet}` : ''
  const desktopClass = columns.desktop ? `lg:grid-cols-${columns.desktop}` : ''

  return (
    <div className={`grid ${mobileClass} ${tabletClass} ${desktopClass} ${gapClass}`}>
      {children}
    </div>
  )
}

/**
 * Container component for consistent max-width and padding
 */
export function Container({
  children,
  size = 'lg',
}: {
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}) {
  const maxWidthClass = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
  }

  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxWidthClass[size]}`}>
      {children}
    </div>
  )
}

/**
 * Flex component for flexbox layouts
 */
export function Flex({
  children,
  direction = 'row',
  justify = 'start',
  align = 'start',
  gap = 4,
  wrap = false,
}: {
  children: ReactNode
  direction?: 'row' | 'col'
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  align?: 'start' | 'center' | 'end' | 'stretch'
  gap?: number
  wrap?: boolean
}) {
  const directionClass = direction === 'col' ? 'flex-col' : ''
  const justifyClass = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  }[justify]
  const alignClass = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }[align]
  const gapClass = `gap-${gap}`
  const wrapClass = wrap ? 'flex-wrap' : ''

  return (
    <div className={`flex ${directionClass} ${justifyClass} ${alignClass} ${gapClass} ${wrapClass}`}>
      {children}
    </div>
  )
}

/**
 * Stack component for vertical spacing
 */
export function Stack({
  children,
  spacing = 4,
}: {
  children: ReactNode
  spacing?: number
}) {
  return (
    <div className={`space-y-${spacing}`}>
      {children}
    </div>
  )
}

export default ResponsiveGrid

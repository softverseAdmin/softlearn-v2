import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Badge Component
const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border border-primary/20 bg-primary/10 text-primary hover:bg-primary/20',
        secondary: 'border border-secondary/20 bg-secondary/10 text-secondary hover:bg-secondary/20',
        destructive: 'border border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/20',
        outline: 'border border-border bg-transparent text-foreground hover:bg-muted',
        success: 'border border-success/20 bg-success/10 text-success hover:bg-success/20',
        warning: 'border border-warning/20 bg-warning/10 text-warning hover:bg-warning/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />
  )
)
Badge.displayName = 'Badge'

// Progress Bar Component
interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  animated?: boolean
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, animated = true, ...props }, ref) => {
    const percentage = Math.round((value / max) * 100)

    return (
      <div
        ref={ref}
        className={cn(
          'relative h-2 w-full overflow-hidden rounded-full bg-secondary/20 backdrop-blur-sm',
          className
        )}
        {...props}
      >
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500',
            animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  }
)
Progress.displayName = 'Progress'

// Avatar Component
const avatarVariants = cva(
  'relative inline-flex items-center justify-center rounded-full font-semibold text-sm overflow-hidden flex-shrink-0',
  {
    variants: {
      size: {
        xs: 'h-6 w-6',
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
      },
      variant: {
        default: 'bg-primary/20 text-primary border border-primary/30',
        secondary: 'bg-secondary/20 text-secondary border border-secondary/30',
        success: 'bg-success/20 text-success border border-success/30',
        warning: 'bg-warning/20 text-warning border border-warning/30',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
)

interface AvatarProps
  extends React.ImgHTMLAttributes<HTMLImageElement>,
    VariantProps<typeof avatarVariants> {
  fallback?: string
  alt?: string
}

export const Avatar = React.forwardRef<HTMLImageElement, AvatarProps>(
  ({ className, size, variant, src, fallback, alt = 'Avatar', ...props }, ref) => {
    const [imageError, setImageError] = React.useState(!src)

    if (imageError || !src) {
      const initials = fallback || alt.charAt(0).toUpperCase()
      return (
        <div className={cn(avatarVariants({ size, variant }), className)}>
          {initials}
        </div>
      )
    }

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={cn(avatarVariants({ size, variant }), 'object-cover', className)}
        onError={() => setImageError(true)}
        {...props}
      />
    )
  }
)
Avatar.displayName = 'Avatar'

// Stat Card Component
interface StatCardProps {
  label: string
  value: string | number
  change?: {
    percentage: number
    isPositive: boolean
  }
  icon?: React.ReactNode
  onClick?: () => void
}

export function StatCard({ label, value, change, icon, onClick }: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-md hover:bg-card'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
          {change && (
            <p
              className={cn(
                'mt-2 text-xs font-medium',
                change.isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              {change.isPositive ? '↑' : '↓'} {Math.abs(change.percentage)}% from last month
            </p>
          )}
        </div>
        {icon && <div className="text-primary/20 text-3xl">{icon}</div>}
      </div>
    </div>
  )
}

import { Badge } from '@/components/ui/badge'
import { formatLabel, getStatusBadgeClassName } from '@/features/teacher/shared'

export function TeacherStatCard({
  label,
  value,
  description,
}: {
  label: string
  value: number
  description: string
}) {
  return (
    <div className="rounded-[26px] border border-border bg-background px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

export function TeacherStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant="outline" className={getStatusBadgeClassName(status)}>
      {formatLabel(status)}
    </Badge>
  )
}

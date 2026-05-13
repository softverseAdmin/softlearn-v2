import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'

type StudentInboxPlaceholderPageProps = {
  eyebrow: string
  title: string
}

export function StudentInboxPlaceholderPage({
  eyebrow,
  title,
}: StudentInboxPlaceholderPageProps) {
  return (
    <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/student" className="transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">{title}</span>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
      </div>
    </div>
  )
}

import { BriefcaseBusiness, CheckCircle2, GitBranch, Globe, Link2 } from 'lucide-react'

import type { WorkHistoryLinks } from './types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type ProfileLinksCardProps = {
  links: WorkHistoryLinks
  validation: Record<keyof WorkHistoryLinks, boolean>
  onChange: (field: keyof WorkHistoryLinks, value: string) => void
  title?: string
  description?: string
}

const fieldConfig: Array<{
  key: keyof WorkHistoryLinks
  label: string
  icon: typeof BriefcaseBusiness
  placeholder: string
}> = [
  {
    key: 'linkedin',
    label: 'LinkedIn URL',
    icon: BriefcaseBusiness,
    placeholder: 'https://www.linkedin.com/in/your-name',
  },
  {
    key: 'github',
    label: 'GitHub URL',
    icon: GitBranch,
    placeholder: 'https://github.com/your-name',
  },
  {
    key: 'portfolio',
    label: 'Portfolio website URL',
    icon: Globe,
    placeholder: 'https://yourportfolio.com',
  },
]

export function ProfileLinksCard({
  links,
  validation,
  onChange,
  title = 'Add Links Optional',
  description = 'Add public profile links that support your uploaded work history document.',
}: ProfileLinksCardProps) {
  return (
    <Card className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <CardHeader className="px-6 pt-6">
        <CardTitle className="text-xl font-semibold text-slate-900">{title}</CardTitle>
        <p className="text-sm text-slate-500">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        {fieldConfig.map((field) => {
          const Icon = field.icon

          return (
            <label key={field.key} className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">{field.label}</span>
              <div className="relative">
                <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={links[field.key]}
                  onChange={(event) => onChange(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  className="h-11 rounded-xl border-slate-200 bg-white pl-10 pr-11 text-slate-900 placeholder:text-slate-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {validation[field.key] ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Link2 className="h-4 w-4 text-slate-300" />
                  )}
                </span>
              </div>
            </label>
          )
        })}
      </CardContent>
    </Card>
  )
}

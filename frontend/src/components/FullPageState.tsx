import type { ReactNode } from 'react'

import { LoadingState } from '@/components/LoadingIndicator'

type FullPageStateProps = {
  title: string
  description: string
  action?: ReactNode
}

export function FullPageState({ title, description, action }: FullPageStateProps) {
  return (
    <div className="state-screen">
      <div className="state-card">
        <LoadingState title={title} description={description} className="gap-4" />
        {action ? <div className="state-actions">{action}</div> : null}
      </div>
    </div>
  )
}

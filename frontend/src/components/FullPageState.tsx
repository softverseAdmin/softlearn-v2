import type { ReactNode } from 'react'

type FullPageStateProps = {
  title: string
  description: string
  action?: ReactNode
}

export function FullPageState({ title, description, action }: FullPageStateProps) {
  return (
    <div className="state-screen">
      <div className="state-card">
        <h1>{title}</h1>
        <p>{description}</p>
        {action ? <div className="state-actions">{action}</div> : null}
      </div>
    </div>
  )
}

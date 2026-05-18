import { createContext, useContext, type Dispatch, type SetStateAction } from 'react'

export type WorkspaceStateValue = {
  unreadNotificationCount: number
  unreadMessageCount: number
  profileAvatar: string | undefined
  setUnreadNotificationCount: Dispatch<SetStateAction<number>>
  setUnreadMessageCount: Dispatch<SetStateAction<number>>
  refreshUnreadNotificationCount: () => Promise<void>
  refreshUnreadMessageCount: () => Promise<void>
}

export const WorkspaceStateContext = createContext<WorkspaceStateValue | undefined>(undefined)

export function useWorkspaceState() {
  const context = useContext(WorkspaceStateContext)

  if (!context) {
    throw new Error('useWorkspaceState must be used within WorkspaceStateProvider')
  }

  return context
}

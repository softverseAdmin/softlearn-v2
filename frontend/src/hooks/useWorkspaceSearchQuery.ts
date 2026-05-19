import { useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'

import { getWorkspaceSearchQuery, withWorkspaceSearchQuery } from '@/router/workspaceSearch'

export function useWorkspaceSearchQuery() {
  const [searchParams, setSearchParams] = useSearchParams()

  const searchQuery = getWorkspaceSearchQuery(searchParams)
  const setSearchQuery = useCallback(
    (nextQuery: string) => {
      setSearchParams((current) => withWorkspaceSearchQuery(current, nextQuery), { replace: true })
    },
    [setSearchParams],
  )

  return [searchQuery, setSearchQuery] as const
}

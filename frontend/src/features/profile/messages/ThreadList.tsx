import { LoaderCircle, MessageSquareMore, Pin, Star } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import type { ConversationThread } from './types'
import { formatRelativeTime, getInitials } from './utils'

type ThreadListProps = {
  loading: boolean
  threads: ConversationThread[]
  activeThreadId: number | null
  onSelectThread: (threadId: number) => void
}

export function ThreadList({ loading, threads, activeThreadId, onSelectThread }: ThreadListProps) {
  if (loading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/70 px-6 text-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading conversations...</p>
      </div>
    )
  }

  if (threads.length === 0) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-dashed border-border/70 px-6 text-center">
        <MessageSquareMore className="h-10 w-10 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">No conversations found</h3>
        <p className="mt-2 text-sm text-muted-foreground">Try a different search term or start a new thread from Compose.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {threads.map((thread) => {
        const isActive = thread.id === activeThreadId

        return (
          <button
            key={thread.id}
            type="button"
            onClick={() => onSelectThread(thread.id)}
            className={cn(
              'w-full rounded-xl border px-4 py-3 text-left transition-colors',
              isActive ? 'border-border bg-muted/60' : 'border-transparent hover:border-border/70 hover:bg-muted/40',
            )}
          >
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarImage src={thread.participantImage ?? undefined} alt={thread.participantName} />
                <AvatarFallback>{getInitials(thread.participantName)}</AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className={cn('truncate text-sm', thread.isUnread ? 'font-semibold' : 'font-medium')}>
                        {thread.participantName}
                      </p>
                      {thread.isPinned ? <Pin className="h-3.5 w-3.5 text-muted-foreground" /> : null}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{formatRelativeTime(thread.lastActivity)}</span>
                </div>

                <div className="mt-1 flex items-start justify-between gap-2">
                  <p className="line-clamp-2 text-sm text-muted-foreground">{thread.preview}</p>
                  {thread.isStarred ? <Star className="mt-0.5 h-3.5 w-3.5 fill-current text-amber-500" /> : null}
                </div>

                <div className="mt-2 flex items-center gap-2">
                  {thread.isUnread ? <Badge className="rounded-full px-2 py-0.5 text-[11px]">Unread</Badge> : null}
                  <span className="text-xs text-muted-foreground">
                    {thread.companyName} · {thread.roleLabel}
                  </span>
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

import { LoaderCircle, Paperclip, SendHorizontal, Star, Trash2 } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import type { ConversationThread } from './types'
import { formatMessageTime, formatRelativeTime, getInitials } from './utils'

type ThreadPanelProps = {
  thread: ConversationThread
  draftMessage: string
  loadingActiveThreadId: number | null
  deletingThreadId: number | null
  updatingThreadId: number | null
  sendingThreadId: number | null
  onDraftChange: (value: string) => void
  onDelete: (thread: ConversationThread) => void
  onToggleStar: (threadId: number) => void
  onSend: () => void
}

export function ThreadPanel({
  thread,
  draftMessage,
  loadingActiveThreadId,
  deletingThreadId,
  updatingThreadId,
  sendingThreadId,
  onDraftChange,
  onDelete,
  onToggleStar,
  onSend,
}: ThreadPanelProps) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar>
            <AvatarImage src={thread.participantImage ?? undefined} alt={thread.participantName} />
            <AvatarFallback>{getInitials(thread.participantName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold">{thread.participantName}</h2>
            <p className="truncate text-sm text-muted-foreground">
              {thread.roleLabel} · {formatRelativeTime(thread.lastActivity)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Delete conversation" onClick={() => onDelete(thread)} disabled={deletingThreadId === thread.id}>
            <Trash2 />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Star conversation"
            onClick={() => onToggleStar(thread.id)}
            disabled={updatingThreadId === thread.id}
          >
            <Star className={cn(thread.isStarred ? 'fill-current text-amber-500' : '')} />
          </Button>
        </div>
      </div>

      <div className="border-b border-border/60 px-5 py-2 text-xs text-muted-foreground">Conversation details</div>

      <div className="space-y-4 px-5 py-5">
        <div className="flex items-center justify-center">
          <Badge variant="outline" className="rounded-full px-3 py-1">
            Last activity {formatRelativeTime(thread.lastActivity)}
          </Badge>
        </div>

        {loadingActiveThreadId === thread.id && thread.messages.length === 0 ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Loading conversation...
          </div>
        ) : null}

        {thread.messages.map((message) => (
          <div key={message.id} className="flex items-start gap-3">
            <Avatar size="sm" className="mt-1">
              <AvatarImage src={message.senderImage ?? undefined} alt={message.sender} />
              <AvatarFallback>{getInitials(message.sender)}</AvatarFallback>
            </Avatar>
            <div className="max-w-[min(100%,42rem)]">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{message.sender}</span>
                <span>{formatMessageTime(message.sentAt)}</span>
                {message.status ? <span>{message.status}</span> : null}
              </div>
              <div className={cn('mt-2 rounded-2xl border px-4 py-3 text-sm leading-6', message.author === 'self' ? 'bg-muted' : 'bg-background')}>
                <p className="whitespace-pre-wrap">{message.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border/60 px-5 py-4">
        <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/30 p-4">
          <Textarea
            value={draftMessage}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder={`Write a message to ${thread.participantName}`}
            className="min-h-24 resize-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button type="button" variant="ghost" size="sm" className="text-muted-foreground">
              <Paperclip />
              Add attachment
            </Button>
            <Button type="button" onClick={onSend} disabled={!draftMessage.trim() || sendingThreadId === thread.id}>
              <SendHorizontal />
              {sendingThreadId === thread.id ? 'Sending...' : 'Send'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

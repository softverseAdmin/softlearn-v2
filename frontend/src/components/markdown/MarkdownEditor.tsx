import { useState } from 'react'

import { MarkdownContent } from './MarkdownContent'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type MarkdownEditorProps = {
  value: string
  onChange: (value: string) => void
  rows?: number
  placeholder?: string
  className?: string
  previewClassName?: string
  helperText?: string
}

export function MarkdownEditor({
  value,
  onChange,
  rows = 8,
  placeholder,
  className,
  previewClassName,
  helperText = 'Supports Markdown: headings, lists, links, tables, and code blocks.',
}: MarkdownEditorProps) {
  const [mode, setMode] = useState<'write' | 'preview'>('write')

  return (
    <div className={cn('space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl border border-slate-200 p-1 dark:border-slate-800">
          <Button type="button" variant={mode === 'write' ? 'default' : 'ghost'} size="sm" onClick={() => setMode('write')}>
            Write
          </Button>
          <Button type="button" variant={mode === 'preview' ? 'default' : 'ghost'} size="sm" onClick={() => setMode('preview')}>
            Preview
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{helperText}</p>
      </div>

      {mode === 'write' ? (
        <Textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
      ) : (
        <div className={cn('min-h-[220px] rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50', previewClassName)}>
          <MarkdownContent content={value} emptyMessage="Nothing to preview yet." />
        </div>
      )}
    </div>
  )
}

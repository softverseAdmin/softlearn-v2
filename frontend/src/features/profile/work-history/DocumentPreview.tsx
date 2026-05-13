import { Download, Expand, FileText, Minus, Plus } from 'lucide-react'

import type { WorkHistoryFile, WorkHistoryPreviewData } from './types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type DocumentPreviewProps = {
  file: WorkHistoryFile | null
  preview: WorkHistoryPreviewData
  zoomPercent: number
  onZoomIn: () => void
  onZoomOut: () => void
  onDownload: () => void
  title?: string
  description?: string
}

export function DocumentPreview({
  file,
  preview,
  zoomPercent,
  onZoomIn,
  onZoomOut,
  onDownload,
  title = 'Work History Preview',
  description = 'Review the selected file preview before sharing it with future matching workflows.',
}: DocumentPreviewProps) {
  return (
    <Card className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <CardHeader className="px-6 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-xl font-semibold text-slate-900">{title}</CardTitle>
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          </div>
          {file ? (
            <Badge variant="outline" className="rounded-full border-slate-200 bg-slate-50 px-3 py-1 text-slate-600">
              {file.fileName}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <div className="flex items-center justify-between rounded-[20px] bg-slate-900 px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/10 p-2">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">{file?.fileName ?? preview.title}</p>
              <p className="text-xs text-slate-300">Page 1 of 1</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={onZoomOut}
              variant="inverse"
              size="icon-lg"
              className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10"
              aria-label="Zoom out"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">{zoomPercent}%</div>
            <Button
              type="button"
              onClick={onZoomIn}
              variant="inverse"
              size="icon-lg"
              className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10"
              aria-label="Zoom in"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              onClick={onDownload}
              variant="inverse"
              size="icon-lg"
              className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10"
              aria-label="Download document"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="inverse"
              size="icon-lg"
              className="rounded-xl border border-white/10 bg-white/5 hover:bg-white/10"
              aria-label="Fullscreen preview"
            >
              <Expand className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="rounded-[24px] bg-slate-100 p-4">
          <div className="mx-auto h-[720px] max-w-[720px] overflow-auto rounded-[20px] bg-white p-10 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <div
              className="origin-top-left space-y-8"
              style={{ transform: `scale(${zoomPercent / 100})`, transformOrigin: 'top left' }}
            >
              <header className="space-y-3 border-b border-slate-200 pb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{preview.title}</p>
                <h2 className="text-3xl font-bold text-slate-900">{preview.name}</h2>
                <p className="text-sm text-slate-500">{preview.contactLine}</p>
                <p className="text-sm leading-7 text-slate-600">{preview.summary}</p>
              </header>

              <section className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Professional Experience</h3>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Employment
                  </span>
                </div>
                {preview.experience.map((item) => (
                  <article key={`${item.company}-${item.role}`} className="space-y-2 border-b border-slate-100 pb-5 last:border-b-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-base font-semibold text-slate-900">{item.role}</p>
                        <p className="text-sm font-medium text-slate-600">{item.company}</p>
                      </div>
                      <span className="text-sm text-slate-500">{item.dateRange}</span>
                    </div>
                    <ul className="space-y-2 pl-5 text-sm leading-7 text-slate-600">
                      {item.bullets.map((bullet) => (
                        <li key={bullet} className="list-disc">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </section>

              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Education</h3>
                {preview.education.map((item) => (
                  <article key={item.institution} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">{item.institution}</p>
                      <p className="text-sm text-slate-600">{item.detail}</p>
                    </div>
                    <span className="text-sm text-slate-500">{item.dateRange}</span>
                  </article>
                ))}
              </section>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

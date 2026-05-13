import { useRef, useState } from 'react'
import { FileText, MoreHorizontal, UploadCloud } from 'lucide-react'

import type { WorkHistoryFile } from './types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type UploadCardProps = {
  activeFile: WorkHistoryFile | null
  error: string | null
  onFilesSelected: (files: FileList) => void
  title?: string
  description?: string
  dropzoneLabel?: string
}

export function UploadCard({
  activeFile,
  error,
  onFilesSelected,
  title = 'Upload Work History',
  description = 'Upload your latest employment history file so softLearn can better understand your background.',
  dropzoneLabel = 'Drag & drop your work history here',
}: UploadCardProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)

    if (event.dataTransfer.files.length > 0) {
      onFilesSelected(event.dataTransfer.files)
    }
  }

  return (
    <Card className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <CardHeader className="px-6 pt-6">
        <CardTitle className="text-xl font-semibold text-slate-900">{title}</CardTitle>
        <p className="text-sm text-slate-500">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4 px-6 pb-6">
        <div
          onDragOver={(event) => {
            event.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`rounded-[24px] border border-dashed p-8 text-center transition ${
            isDragging ? 'border-primary bg-blue-50' : 'border-slate-200 bg-slate-50'
          }`}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-primary">
            <UploadCloud className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">{dropzoneLabel}</h3>
          <p className="mt-2 text-sm text-slate-500">Supported formats: PDF, DOCX, XLSX · Max file size: 10MB</p>
          <Button
            type="button"
            className="mt-5 rounded-xl px-5"
            onClick={() => inputRef.current?.click()}
          >
            Browse Files
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.xlsx"
            className="hidden"
            onChange={(event) => {
              if (event.target.files?.length) {
                onFilesSelected(event.target.files)
                event.target.value = ''
              }
            }}
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700">
            {error}
          </div>
        ) : null}

        {activeFile ? (
          <div className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-blue-100 p-3 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{activeFile.fileName}</p>
                    <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 hover:bg-emerald-100">
                      Active
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    Uploaded {new Date(activeFile.uploadedAt).toLocaleString()} · {activeFile.sizeLabel}
                  </p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-lg"
                    className="rounded-xl border-slate-200 text-slate-500 hover:text-slate-900"
                    aria-label="File options"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Set as active</DropdownMenuItem>
                  <DropdownMenuItem>Rename</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Remove</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

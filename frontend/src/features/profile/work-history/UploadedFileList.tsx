import { Download, FileSpreadsheet, FileText, MoreHorizontal } from 'lucide-react'

import type { WorkHistoryFile } from './types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type UploadedFileListProps = {
  files: WorkHistoryFile[]
  selectedFileId: string | null
  onSelect: (fileId: string) => void
  onDownload: (file: WorkHistoryFile) => void
  title?: string
  description?: string
}

function fileIcon(type: WorkHistoryFile['fileType']) {
  if (type === 'xlsx') {
    return <FileSpreadsheet className="h-5 w-5" />
  }

  return <FileText className="h-5 w-5" />
}

function statusBadge(status: WorkHistoryFile['status']) {
  if (status === 'active') {
    return <Badge className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700 hover:bg-emerald-100">Active</Badge>
  }

  if (status === 'processed') {
    return <Badge className="rounded-full bg-blue-100 px-3 py-1 text-blue-700 hover:bg-blue-100">Processed</Badge>
  }

  return <Badge className="rounded-full bg-orange-100 px-3 py-1 text-orange-700 hover:bg-orange-100">Needs Review</Badge>
}

export function UploadedFileList({
  files,
  selectedFileId,
  onSelect,
  onDownload,
  title = 'Your Work History Files',
  description = 'Manage uploaded files, download copies, and switch preview focus.',
}: UploadedFileListProps) {
  return (
    <Card className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <CardHeader className="px-6 pt-6">
        <CardTitle className="text-xl font-semibold text-slate-900">{title}</CardTitle>
        <p className="text-sm text-slate-500">{description}</p>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="overflow-x-auto rounded-[20px] border border-slate-200">
          <div className="grid grid-cols-[minmax(0,2fr)_120px_140px_90px_80px_56px] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>File</span>
            <span>Status</span>
            <span>Upload Date</span>
            <span>Size</span>
            <span>Download</span>
            <span />
          </div>
          <div className="divide-y divide-slate-200">
            {files.map((file) => (
              <div
                key={file.id}
                className={`grid cursor-pointer grid-cols-[minmax(0,2fr)_120px_140px_90px_80px_56px] gap-3 px-4 py-4 transition ${
                  selectedFileId === file.id ? 'bg-blue-50' : 'bg-white hover:bg-slate-50'
                }`}
                onClick={() => onSelect(file.id)}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="rounded-2xl bg-slate-100 p-2 text-slate-600">{fileIcon(file.fileType)}</div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{file.fileName}</p>
                    <p className="text-xs text-slate-500">{file.fileType.toUpperCase()} document</p>
                  </div>
                </div>
                <div className="flex items-center">{statusBadge(file.status)}</div>
                <div className="flex items-center text-sm text-slate-600">
                  {new Date(file.uploadedAt).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-slate-600">{file.sizeLabel}</div>
                <div className="flex items-center">
                  <Button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      onDownload(file)
                    }}
                    variant="outline"
                    size="icon-lg"
                    className="rounded-xl border-slate-200 text-slate-500 hover:text-slate-900"
                    aria-label={`Download ${file.fileName}`}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        onClick={(event) => event.stopPropagation()}
                        variant="outline"
                        size="icon-lg"
                        className="rounded-xl border-slate-200 text-slate-500 hover:text-slate-900"
                        aria-label="More file actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onSelect(file.id)}>Preview</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDownload(file)}>Download</DropdownMenuItem>
                      <DropdownMenuItem>Set Active</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

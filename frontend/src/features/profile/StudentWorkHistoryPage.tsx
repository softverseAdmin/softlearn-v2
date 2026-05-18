import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, HelpCircle, LoaderCircle } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { AIExtractedInsights } from './work-history/AIExtractedInsights'
import { DocumentPreview } from './work-history/DocumentPreview'
import { PageTabs } from './work-history/PageTabs'
import { ProfileLinksCard } from './work-history/ProfileLinksCard'
import { UploadCard } from './work-history/UploadCard'
import { UploadedFileList } from './work-history/UploadedFileList'
import { WorkHistorySidebar } from './work-history/WorkHistorySidebar'
import { getWorkHistoryPageData } from './work-history/workHistoryService'
import type { WorkHistoryFile, WorkHistoryLinks, WorkHistoryPageData, WorkHistoryTab } from './work-history/types'
import {
  allowedExtensions,
  appendUploadedFile,
  createPreviewText,
  getLinkValidation,
  getWorkHistoryWorkspaceConfig,
  maxFileSizeBytes,
  updateLinksData,
  workHistorySectionIds,
} from './work-history/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function StudentWorkHistoryPage() {
  const location = useLocation()
  const [data, setData] = useState<WorkHistoryPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [zoomPercent, setZoomPercent] = useState(100)
  const [activeTab, setActiveTab] = useState<WorkHistoryTab>('upload-manage')

  const workspaceConfig = useMemo(() => {
    return getWorkHistoryWorkspaceConfig(location.pathname)
  }, [location.pathname])

  useEffect(() => {
    let active = true

    async function loadPage() {
      try {
        const response = await getWorkHistoryPageData()

        if (!active) {
          return
        }

        setData(response)
        setSelectedFileId(response.files.find((file) => file.isActive)?.id ?? response.files[0]?.id ?? null)
      } catch {
        if (active) {
          setError('Unable to load the work history management page.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadPage()

    return () => {
      active = false
    }
  }, [])

  const selectedFile = useMemo(() => {
    if (!data) {
      return null
    }

    return data.files.find((file) => file.id === selectedFileId) ?? data.files.find((file) => file.isActive) ?? null
  }, [data, selectedFileId])

  const linkValidation = useMemo(
    () => (data ? getLinkValidation(data.links) : { linkedin: false, github: false, portfolio: false }),
    [data],
  )

  function scrollForTab(tab: WorkHistoryTab) {
    const element = document.getElementById(workHistorySectionIds[tab])
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  function handleTabChange(tab: WorkHistoryTab) {
    setActiveTab(tab)
    scrollForTab(tab)
  }

  function updateLinks(field: keyof WorkHistoryLinks, value: string) {
    setData((current) => {
      if (!current) {
        return current
      }

      return updateLinksData(current, field, value)
    })
  }

  function handleFilesSelected(files: FileList) {
    const file = files[0]

    if (!file) {
      return
    }

    const extension = file.name.split('.').pop()?.toLowerCase() ?? ''

    if (!allowedExtensions.includes(extension)) {
      setUploadError('Only PDF, DOCX, and XLSX files are supported.')
      return
    }

    if (file.size > maxFileSizeBytes) {
      setUploadError('The selected file is larger than the 10MB upload limit.')
      return
    }

    setUploadError(null)
    setZoomPercent(100)
    const nextFileId = `file-${Date.now()}`
    setData((current) => {
      if (!current) {
        return current
      }

      return appendUploadedFile(current, file, nextFileId)
    })
    setSelectedFileId(nextFileId)
  }

  function handleDownloadFile(file: WorkHistoryFile) {
    if (!data) {
      return
    }

    const blob = new Blob([createPreviewText(data)], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = file.fileName
    anchor.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#f5f7fb] px-6 py-10">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
          <LoaderCircle className="h-5 w-5 animate-spin text-primary" />
          Loading work history workspace...
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-[#f5f7fb] px-6 py-10">
        <Card className="rounded-[24px] border border-red-200 bg-red-50 shadow-sm">
          <CardContent className="flex items-start gap-3 px-6 py-6">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <div>
              <h2 className="font-semibold text-red-900">Unable to load work history page</h2>
              <p className="mt-1 text-sm text-red-700">{error ?? 'No data available.'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-full bg-[#f5f7fb] px-4 py-6 md:px-6 lg:px-8">
      <div className="space-y-6">
        <header className="rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-sm">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Link to="/student/profile" className="hover:text-primary">
                  My Profile
                </Link>
                <span>&gt;</span>
                <span className="font-medium text-slate-700">{workspaceConfig.breadcrumb}</span>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">{workspaceConfig.title}</h1>
                <p className="max-w-3xl text-base text-slate-500">{workspaceConfig.description}</p>
              </div>
              <PageTabs
                value={activeTab}
                onChange={handleTabChange}
                labels={workspaceConfig.tabs}
                sectionIds={workHistorySectionIds}
              />
            </div>
            <Button type="button" variant="outline" className="h-11 rounded-xl border-slate-200 bg-white px-5 text-slate-700">
              <HelpCircle className="mr-2 h-4 w-4" />
              How it works?
            </Button>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,1.05fr)_360px]">
          <div id="upload-manage-section" className="space-y-6">
            <UploadCard
              activeFile={selectedFile}
              error={uploadError}
              onFilesSelected={handleFilesSelected}
              title={workspaceConfig.uploadTitle}
              description={workspaceConfig.uploadDescription}
              dropzoneLabel={workspaceConfig.dropzoneLabel}
            />
            <UploadedFileList
              files={data.files}
              selectedFileId={selectedFileId}
              onSelect={setSelectedFileId}
              onDownload={handleDownloadFile}
              title={workspaceConfig.filesTitle}
              description={workspaceConfig.filesDescription}
            />
            <ProfileLinksCard
              links={data.links}
              validation={linkValidation}
              onChange={updateLinks}
              title={workspaceConfig.linksTitle}
              description={workspaceConfig.linksDescription}
            />
          </div>

          <div className="space-y-6">
            <DocumentPreview
              file={selectedFile}
              preview={data.preview}
              zoomPercent={zoomPercent}
              onZoomOut={() => setZoomPercent((current) => Math.max(80, current - 10))}
              onZoomIn={() => setZoomPercent((current) => Math.min(130, current + 10))}
              onDownload={() => selectedFile && handleDownloadFile(selectedFile)}
              title={workspaceConfig.previewTitle}
              description={workspaceConfig.previewDescription}
            />
            <AIExtractedInsights
              metrics={data.insightMetrics}
              title={workspaceConfig.insightsTitle}
              description={workspaceConfig.insightsDescription}
              actionLabel={workspaceConfig.insightsActionLabel}
            />
          </div>

          <div className="space-y-6">
             <WorkHistorySidebar data={data} config={workspaceConfig} />
           </div>
         </div>
       </div>
    </div>
  )
}

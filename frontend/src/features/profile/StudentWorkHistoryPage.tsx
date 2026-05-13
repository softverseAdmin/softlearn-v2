import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, HelpCircle, Home, LoaderCircle, Sparkles } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { AIExtractedInsights } from './work-history/AIExtractedInsights'
import { DocumentPreview } from './work-history/DocumentPreview'
import { ExperienceSummaryCard } from './work-history/ExperienceSummaryCard'
import { ExperienceTimeline } from './work-history/ExperienceTimeline'
import { PageTabs } from './work-history/PageTabs'
import { ProfileLinksCard } from './work-history/ProfileLinksCard'
import { UploadCard } from './work-history/UploadCard'
import { UploadedFileList } from './work-history/UploadedFileList'
import { getWorkHistoryPageData } from './work-history/workHistoryService'
import type { WorkHistoryFile, WorkHistoryLinks, WorkHistoryPageData, WorkHistoryTab } from './work-history/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

const allowedExtensions = ['pdf', 'docx', 'xlsx']
const maxFileSizeBytes = 10 * 1024 * 1024

function isValidLink(value: string) {
  if (!value.trim()) {
    return false
  }

  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

function formatBytes(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  return `${Math.round(size / 1024)} KB`
}

function createPreviewText(data: WorkHistoryPageData) {
  const experienceLines = data.preview.experience.flatMap((entry) => [
    `${entry.role} - ${entry.company}`,
    entry.dateRange,
    ...entry.bullets.map((bullet) => `- ${bullet}`),
    '',
  ])

  const educationLines = data.preview.education.flatMap((entry) => [
    `${entry.institution} - ${entry.detail}`,
    entry.dateRange,
  ])

  return [
    data.preview.title,
    data.preview.name,
    data.preview.contactLine,
    '',
    data.preview.summary,
    '',
    'Professional Experience',
    ...experienceLines,
    'Education',
    ...educationLines,
  ].join('\n')
}

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
    if (location.pathname === '/student/resume') {
      return {
        breadcrumb: 'Resume',
        title: 'Resume workspace',
        description:
          'Upload your resume, preview the latest file, replace or download it, and review extracted AI signals plus a resume score.',
        tabs: {
          'upload-manage': 'Resume Upload',
          'experience-timeline': 'Career Timeline',
          'experience-summary': 'Resume Summary',
        } satisfies Partial<Record<WorkHistoryTab, string>>,
        uploadTitle: 'Upload Resume',
        uploadDescription: 'Keep one clean, recruiter-ready resume active for applications and scoring.',
        dropzoneLabel: 'Drag & drop your resume here',
        filesTitle: 'Resume Files',
        filesDescription: 'Preview the active resume, keep prior versions, and download the file you want to share.',
        previewTitle: 'Resume Preview',
        previewDescription: 'Review layout and extracted content before you use this resume in jobs or applications.',
        insightsTitle: 'AI Resume Insights',
        insightsDescription: 'Snapshot metrics for resume quality, extracted skills, and readiness cues based on the uploaded file.',
        insightsActionLabel: 'Open Resume Insights',
        linksTitle: 'Portfolio & profile links',
        linksDescription: 'Add public links that strengthen your resume context for recruiters and matching.',
        summaryTitle: 'Resume Score Summary',
        summaryDescription: 'A compact summary of what the active resume communicates today.',
        timelineTitle: 'Experience Timeline',
        timelineDescription: 'The experience sequence extracted from the current resume.',
        nextTitle: "What's next for your resume?",
        nextDescription: 'Recommended follow-up actions after updating your primary resume file.',
      }
    }

    if (location.pathname === '/student/documents') {
      return {
        breadcrumb: 'Documents',
        title: 'Document workspace',
        description:
          'Manage supporting career documents in one place with uploads, preview, extracted insights, and links to your public profiles.',
        tabs: {
          'upload-manage': 'Documents',
          'experience-timeline': 'Timeline',
          'experience-summary': 'Summary',
        } satisfies Partial<Record<WorkHistoryTab, string>>,
        uploadTitle: 'Upload Career Document',
        uploadDescription: 'Use this shared workspace for resume and work history document management without changing your protected routes.',
        dropzoneLabel: 'Drag & drop a document here',
        filesTitle: 'Uploaded Documents',
        filesDescription: 'Switch the active preview, review versions, and download the current file.',
        previewTitle: 'Document Preview',
        previewDescription: 'Review the selected career document before sharing it with future workflows.',
        insightsTitle: 'Document Insights',
        insightsDescription: 'Structured signals extracted from the active document for future matching and review features.',
        insightsActionLabel: 'View Document Insights',
        linksTitle: 'Professional links',
        linksDescription: 'Keep your LinkedIn, GitHub, and portfolio links aligned with the selected document.',
        summaryTitle: 'Document Summary',
        summaryDescription: 'A quick summary of the experience currently represented across your uploaded documents.',
        timelineTitle: 'Experience Timeline',
        timelineDescription: 'The extracted career sequence from the active document preview.',
        nextTitle: "What's next with your documents?",
        nextDescription: 'Recommended follow-up actions after updating your active file.',
      }
    }

    return {
      breadcrumb: 'Work History',
      title: 'Work history workspace',
      description:
        'Upload your work history, preview the document, review an extracted experience timeline, and keep your LinkedIn, GitHub, and portfolio links current.',
      tabs: {
        'upload-manage': 'Upload & Manage',
        'experience-timeline': 'Experience Timeline',
        'experience-summary': 'Experience Summary',
      } satisfies Partial<Record<WorkHistoryTab, string>>,
      uploadTitle: 'Upload Work History',
      uploadDescription: 'Upload your latest employment history file so softLearn can better understand your background.',
      dropzoneLabel: 'Drag & drop your work history here',
      filesTitle: 'Your Work History Files',
      filesDescription: 'Manage uploaded files, download copies, and switch preview focus.',
      previewTitle: 'Work History Preview',
      previewDescription: 'Review the selected file preview before sharing it with future matching workflows.',
      insightsTitle: 'AI Extracted Insights',
      insightsDescription: 'Mock extracted signals from your uploaded document, ready for later backend integration.',
      insightsActionLabel: 'View Insights',
      linksTitle: 'Add Links Optional',
      linksDescription: 'Add public profile links that support your uploaded work history document.',
      summaryTitle: 'Experience Summary',
      summaryDescription: 'A quick view of the experience extracted from your current documents.',
      timelineTitle: 'Experience Timeline',
      timelineDescription: 'A structured timeline built from your active work history document.',
      nextTitle: "What's Next?",
      nextDescription: 'Recommended follow-up actions after updating your document.',
    }
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
    () => ({
      linkedin: data ? isValidLink(data.links.linkedin) : false,
      github: data ? isValidLink(data.links.github) : false,
      portfolio: data ? isValidLink(data.links.portfolio) : false,
    }),
    [data],
  )

  function scrollForTab(tab: WorkHistoryTab) {
    const idByTab: Record<WorkHistoryTab, string> = {
      'upload-manage': 'upload-manage-section',
      'experience-timeline': 'experience-timeline-section',
      'experience-summary': 'experience-summary-section',
    }

    const element = document.getElementById(idByTab[tab])
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

      return {
        ...current,
        links: {
          ...current.links,
          [field]: value,
        },
        summary: {
          ...current.summary,
          lastUpdated: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        },
      }
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

      const nextFile: WorkHistoryFile = {
        id: nextFileId,
        fileName: file.name,
        fileType: extension as WorkHistoryFile['fileType'],
        status: 'active',
        uploadedAt: new Date().toISOString(),
        sizeLabel: formatBytes(file.size),
        sizeBytes: file.size,
        isActive: true,
      }

      return {
        ...current,
        files: [nextFile, ...current.files.map((existing) => ({ ...existing, isActive: false, status: existing.status === 'active' ? 'processed' : existing.status }))],
        summary: {
          ...current.summary,
          lastUpdated: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
        },
      }
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
              <PageTabs value={activeTab} onChange={handleTabChange} labels={workspaceConfig.tabs} />
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
            <div id="experience-summary-section">
              <ExperienceSummaryCard
                summary={data.summary}
                title={workspaceConfig.summaryTitle}
                description={workspaceConfig.summaryDescription}
              />
            </div>
            <div id="experience-timeline-section">
              <ExperienceTimeline
                items={data.timeline}
                title={workspaceConfig.timelineTitle}
                description={workspaceConfig.timelineDescription}
              />
            </div>

            <Card className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
              <div className="px-6 pt-6">
                <h2 className="text-xl font-semibold text-slate-900">{workspaceConfig.nextTitle}</h2>
                <p className="mt-1 text-sm text-slate-500">{workspaceConfig.nextDescription}</p>
              </div>
              <CardContent className="space-y-3 px-6 pb-6 pt-4">
                {data.nextSteps.map((step, index) => (
                  <Link
                    key={step.id}
                    to={step.href}
                    className="block rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 transition hover:border-primary/20 hover:bg-blue-50"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{step.title}</p>
                        <p className="mt-1 text-sm leading-6 text-slate-500">{step.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
                <Button asChild variant="outline" className="mt-2 h-11 w-full rounded-xl border-slate-200 bg-white text-slate-700">
                  <Link to="/student">
                    <Home className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border border-violet-100 bg-gradient-to-br from-violet-50 to-blue-50 shadow-sm">
              <CardContent className="px-6 py-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-white p-3 text-violet-600 shadow-sm">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">AI-ready document workspace</p>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      This page uses clean frontend service boundaries so AWS-compatible AI extraction can be connected later.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

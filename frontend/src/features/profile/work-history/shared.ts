import type { WorkHistoryFile, WorkHistoryLinks, WorkHistoryPageData, WorkHistoryTab } from './types'

export const allowedExtensions = ['pdf', 'docx', 'xlsx']
export const maxFileSizeBytes = 10 * 1024 * 1024

export const workHistorySectionIds: Record<WorkHistoryTab, string> = {
  'upload-manage': 'upload-manage-section',
  'experience-timeline': 'experience-timeline-section',
  'experience-summary': 'experience-summary-section',
}

export type WorkHistoryWorkspaceConfig = {
  breadcrumb: string
  title: string
  description: string
  tabs: Partial<Record<WorkHistoryTab, string>>
  uploadTitle: string
  uploadDescription: string
  dropzoneLabel: string
  filesTitle: string
  filesDescription: string
  previewTitle: string
  previewDescription: string
  insightsTitle: string
  insightsDescription: string
  insightsActionLabel: string
  linksTitle: string
  linksDescription: string
  summaryTitle: string
  summaryDescription: string
  timelineTitle: string
  timelineDescription: string
  nextTitle: string
  nextDescription: string
}

const updatedDateFormat: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}

function getUpdatedDateLabel() {
  return new Date().toLocaleDateString(undefined, updatedDateFormat)
}

export function getWorkHistoryWorkspaceConfig(pathname: string): WorkHistoryWorkspaceConfig {
  if (pathname === '/student/resume') {
    return {
      breadcrumb: 'Resume',
      title: 'Resume workspace',
      description:
        'Upload your resume, preview the latest file, replace or download it, and review extracted AI signals plus a resume score.',
      tabs: {
        'upload-manage': 'Resume Upload',
        'experience-timeline': 'Career Timeline',
        'experience-summary': 'Resume Summary',
      },
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

  if (pathname === '/student/documents') {
    return {
      breadcrumb: 'Documents',
      title: 'Document workspace',
      description:
        'Manage supporting career documents in one place with uploads, preview, extracted insights, and links to your public profiles.',
      tabs: {
        'upload-manage': 'Documents',
        'experience-timeline': 'Timeline',
        'experience-summary': 'Summary',
      },
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
    },
    uploadTitle: 'Upload Work History',
    uploadDescription: 'Upload your latest employment history file so softLearn can better understand your background.',
    dropzoneLabel: 'Drag & drop your work history here',
    filesTitle: 'Your Work History Files',
    filesDescription: 'Manage uploaded files, download copies, and switch preview focus.',
      previewTitle: 'Work History Preview',
      previewDescription: 'Review the selected file preview before sharing it with future matching workflows.',
      insightsTitle: 'AI Extracted Insights',
      insightsDescription: 'A compact summary pulled from your current profile, resume records, and timeline data.',
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
}

export function isValidLink(value: string) {
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

export function getLinkValidation(links: WorkHistoryLinks) {
  return {
    linkedin: isValidLink(links.linkedin),
    github: isValidLink(links.github),
    portfolio: isValidLink(links.portfolio),
  }
}

export function formatBytes(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`
  }

  return `${Math.round(size / 1024)} KB`
}

export function createPreviewText(data: WorkHistoryPageData) {
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

export function updateLinksData(data: WorkHistoryPageData, field: keyof WorkHistoryLinks, value: string): WorkHistoryPageData {
  return {
    ...data,
    links: {
      ...data.links,
      [field]: value,
    },
    summary: {
      ...data.summary,
      lastUpdated: getUpdatedDateLabel(),
    },
  }
}

export function appendUploadedFile(data: WorkHistoryPageData, file: File, nextFileId: string): WorkHistoryPageData {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
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
    ...data,
    files: [
      nextFile,
      ...data.files.map((existing) => ({
        ...existing,
        isActive: false,
        status: existing.status === 'active' ? 'processed' : existing.status,
      })),
    ],
    summary: {
      ...data.summary,
      lastUpdated: getUpdatedDateLabel(),
    },
  }
}

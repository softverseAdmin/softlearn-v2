import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Award, BriefcaseBusiness, ChevronRight, Globe, GraduationCap, Mail, MapPin, ShieldCheck, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { CompanyApplicationRecord, CompanyApplicationsResponse, CompanyCandidatePreviewResponse } from './types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

const emptyPreview: CompanyCandidatePreviewResponse = {
  candidate_access_id: 0,
  source: '',
  visibility: 'hidden',
  shortlist: null,
  notes: [],
  student: null,
  restrictions: [],
}

function formatLabel(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  if (parts.length === 0) {
    return 'CA'
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join('')
}

function formatDateLabel(value: string | null) {
  if (!value) {
    return 'Present'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function toInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function CompanyCandidateDetailPage() {
  const { csrfToken } = useAuth()
  const params = useParams<{ candidateAccessId: string }>()
  const [preview, setPreview] = useState<CompanyCandidatePreviewResponse>(emptyPreview)
  const [relatedApplication, setRelatedApplication] = useState<CompanyApplicationRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<'shortlist' | 'reject' | null>(null)
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [contactMode, setContactMode] = useState<'question' | 'interview'>('question')
  const [contactSubmitting, setContactSubmitting] = useState(false)
  const [questionMessage, setQuestionMessage] = useState('')
  const [interviewPurpose, setInterviewPurpose] = useState('')
  const [interviewRoleContext, setInterviewRoleContext] = useState('')
  const [interviewStartAt, setInterviewStartAt] = useState(toInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000)))
  const [interviewEndAt, setInterviewEndAt] = useState(toInputValue(new Date(Date.now() + 25 * 60 * 60 * 1000)))
  const [error, setError] = useState<string | null>(null)

  async function fetchCandidateContext(candidateAccessId: string) {
    const [previewResponse, applicationsResponse] = await Promise.all([
      apiRequest<CompanyCandidatePreviewResponse>(`/company/candidates/${candidateAccessId}/preview`),
      apiRequest<CompanyApplicationsResponse>('/company/applications'),
    ])

    return {
      previewResponse,
      relatedApplication:
        applicationsResponse.applications.find((application) => application.candidate_access_id === previewResponse.candidate_access_id) ?? null,
    }
  }

  useEffect(() => {
    let active = true

    async function loadCandidatePreview() {
      if (!params.candidateAccessId) {
        setError('Candidate context is missing.')
        setLoading(false)
        return
      }

      try {
        const { previewResponse, relatedApplication } = await fetchCandidateContext(params.candidateAccessId)
        if (active) {
          setPreview(previewResponse)
          setRelatedApplication(relatedApplication)
          setError(null)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load candidate details.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadCandidatePreview()

    return () => {
      active = false
    }
  }, [params.candidateAccessId])

  function resetContactDialog() {
    setContactMode('question')
    setContactSubmitting(false)
    setQuestionMessage('')
    setInterviewPurpose('')
    setInterviewRoleContext(relatedApplication?.vacancy_title || preview.student?.desired_job_type || '')
    setInterviewStartAt(toInputValue(new Date(Date.now() + 24 * 60 * 60 * 1000)))
    setInterviewEndAt(toInputValue(new Date(Date.now() + 25 * 60 * 60 * 1000)))
  }

  function openContactDialog() {
    resetContactDialog()
    setIsContactDialogOpen(true)
  }

  async function runCandidateAction(action: 'shortlist' | 'reject') {
    if (!params.candidateAccessId) {
      toast.error('Candidate context is missing.')
      return
    }

    if (action === 'reject' && !relatedApplication) {
      toast.error('Reject is available only for application-based candidate reviews.')
      return
    }

    setActionLoading(action)

    try {
      if (action === 'shortlist') {
        await apiRequest(`/company/candidates/${params.candidateAccessId}/shortlist`, {
          method: 'POST',
          body: {},
          csrfToken,
        })
      } else if (relatedApplication) {
        await apiRequest(`/company/applications/${relatedApplication.application_id}/reject`, {
          method: 'POST',
          body: {},
          csrfToken,
        })
      }

      const { previewResponse, relatedApplication: nextRelatedApplication } = await fetchCandidateContext(params.candidateAccessId)
      setPreview(previewResponse)
      setRelatedApplication(nextRelatedApplication)
      setError(null)
      toast.success(action === 'shortlist' ? 'Candidate shortlisted successfully.' : 'Application rejected successfully.')
    } catch (saveError) {
      toast.error(saveError instanceof ApiError ? saveError.message : 'Unable to update candidate status.')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleContactSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!params.candidateAccessId || !preview.student) {
      toast.error('Candidate context is missing.')
      return
    }

    setContactSubmitting(true)

    try {
      if (contactMode === 'question') {
        await apiRequest('/company/messages/threads', {
          method: 'POST',
          body: {
            participant_user_id: preview.student.student_id,
            category: 'interviews',
            message: questionMessage,
          },
          csrfToken,
        })
        toast.success('Question sent to candidate successfully.')
      } else {
        const response = await apiRequest<{ id: number }>(`/company/candidates/${params.candidateAccessId}/interviews`, {
          method: 'POST',
          body: {
            purpose: interviewPurpose,
            role_context: interviewRoleContext,
            start_at: new Date(interviewStartAt).toISOString(),
            end_at: new Date(interviewEndAt).toISOString(),
          },
          csrfToken,
        })
        toast.success(`Interview scheduled successfully. Event #${response.id} is now visible to the student.`)
      }

      const { previewResponse, relatedApplication: nextRelatedApplication } = await fetchCandidateContext(params.candidateAccessId)
      setPreview(previewResponse)
      setRelatedApplication(nextRelatedApplication)
      setError(null)
      setIsContactDialogOpen(false)
      resetContactDialog()
    } catch (saveError) {
      toast.error(saveError instanceof ApiError ? saveError.message : 'Unable to complete candidate outreach.')
    } finally {
      setContactSubmitting(false)
    }
  }

  const candidateName = preview.student?.name || 'Candidate Details'
  const initials = getInitials(candidateName)
  const skillSummary = preview.student?.skills.map((skill) => skill.skill_name).join(' | ') || ''
  const aboutSummary = preview.student?.about_me?.trim() || ''
  const shortlistLabel = preview.shortlist ? 'Shortlisted' : 'Shortlist'
  const shortlistDisabled = Boolean(preview.shortlist) || actionLoading !== null
  const rejectDisabled = !relatedApplication?.can_reject || actionLoading !== null
  const canContactCandidate = Boolean(preview.shortlist)

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
        <div className="space-y-3">
          <div className="h-5 w-40 animate-pulse rounded bg-muted" />
          <div className="h-10 w-64 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-52 animate-pulse rounded-[24px] border border-border bg-muted/20" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-32 animate-pulse rounded-[24px] border border-border bg-muted/20" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <Dialog
        open={isContactDialogOpen}
        onOpenChange={(open) => {
          setIsContactDialogOpen(open)
          if (!open) {
            resetContactDialog()
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact {candidateName}</DialogTitle>
            <DialogDescription>
              Send a question to the candidate or schedule an interview that will appear in the student interview calendar.
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-5" onSubmit={handleContactSubmit}>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                type="button"
                variant={contactMode === 'question' ? 'default' : 'outline'}
                className="justify-center rounded-xl"
                onClick={() => setContactMode('question')}
                disabled={contactSubmitting}
              >
                Ask question
              </Button>
              <Button
                type="button"
                variant={contactMode === 'interview' ? 'default' : 'outline'}
                className="justify-center rounded-xl"
                onClick={() => setContactMode('interview')}
                disabled={contactSubmitting}
              >
                Schedule interview
              </Button>
            </div>

            {contactMode === 'question' ? (
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="candidate-question-message">
                  Question for candidate
                </label>
                <Textarea
                  id="candidate-question-message"
                  value={questionMessage}
                  onChange={(event) => setQuestionMessage(event.target.value)}
                  placeholder="Write the question or message you want the candidate to receive."
                  className="min-h-36 resize-none"
                  required
                />
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="candidate-interview-purpose">
                    Interview purpose
                  </label>
                  <Textarea
                    id="candidate-interview-purpose"
                    value={interviewPurpose}
                    onChange={(event) => setInterviewPurpose(event.target.value)}
                    placeholder="Example: Portfolio review and frontend collaboration discussion."
                    className="min-h-28 resize-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="candidate-interview-role-context">
                    Role context
                  </label>
                  <Input
                    id="candidate-interview-role-context"
                    value={interviewRoleContext}
                    onChange={(event) => setInterviewRoleContext(event.target.value)}
                    placeholder="Example: Frontend trainee"
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="candidate-interview-start">
                      Start time
                    </label>
                    <Input
                      id="candidate-interview-start"
                      type="datetime-local"
                      value={interviewStartAt}
                      onChange={(event) => setInterviewStartAt(event.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="candidate-interview-end">
                      End time
                    </label>
                    <Input
                      id="candidate-interview-end"
                      type="datetime-local"
                      value={interviewEndAt}
                      onChange={(event) => setInterviewEndAt(event.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsContactDialogOpen(false)} disabled={contactSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={contactSubmitting}>
                {contactSubmitting ? 'Saving…' : contactMode === 'question' ? 'Send question' : 'Schedule interview'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/company" className="transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link to="/company/candidates" className="transition-colors hover:text-foreground">
          Candidates
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">{candidateName}</span>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="px-6 py-4 text-sm text-red-800 dark:text-red-200">{error}</CardContent>
        </Card>
      ) : null}

      {preview.visibility !== 'visible' || !preview.student ? (
        <Card className="rounded-[28px] border border-border bg-background">
          <CardContent className="space-y-4 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-border bg-muted/30 p-3 text-muted-foreground">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Profile details are hidden</h2>
                <p className="text-sm text-muted-foreground">
                  This candidate has not shared their profile preview with your company.
                </p>
              </div>
            </div>

            {preview.restrictions.length > 0 ? (
              <div className="space-y-2">
                {preview.restrictions.map((restriction) => (
                  <div key={restriction} className="rounded-2xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                    {restriction}
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="overflow-hidden border-slate-200 bg-white shadow-sm pt-0">
            <div className="relative">
              <div className="relative h-40 overflow-hidden bg-gradient-to-r from-slate-700 via-slate-600 to-sky-500 md:h-52">
                {preview.student.cover_image ? (
                  <img src={preview.student.cover_image} alt={`${candidateName} cover`} className="absolute inset-0 h-full w-full object-cover" />
                ) : null}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.18),transparent_28%)]" />
                <div className="absolute inset-y-0 right-0 w-1/3 bg-white/10" />
              </div>

              <div className="absolute left-6 top-full -translate-y-1/2">
                <div className="relative rounded-full border-4 border-white bg-white shadow-lg">
                  <Avatar className="h-28 w-28 md:h-32 md:w-32">
                    {preview.student.profile_image ? <AvatarImage src={preview.student.profile_image} alt={`${candidateName} profile`} /> : null}
                    <AvatarFallback className="bg-slate-100 text-3xl font-semibold text-slate-700">{initials}</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>

            <CardContent className="pt-18 md:pt-20">
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-6">
                      <h1
                        className="inline-flex items-center gap-3 text-left text-5xl leading-none font-black tracking-tight text-slate-900 md:text-6xl lg:text-7xl"
                        style={{ fontSize: 'xx-large' }}
                      >
                        <span>{candidateName}</span>
                      </h1>
                      <div className="flex flex-wrap items-center gap-3 md:justify-end">
                        <Button
                          type="button"
                          onClick={() => void runCandidateAction('shortlist')}
                          disabled={shortlistDisabled}
                          className="rounded-full bg-emerald-600 px-5 text-white hover:bg-emerald-700 disabled:bg-emerald-200 disabled:text-emerald-700"
                        >
                          {actionLoading === 'shortlist' ? 'Saving…' : shortlistLabel}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void runCandidateAction('reject')}
                          disabled={rejectDisabled}
                          className="rounded-full border-rose-200 px-5 text-rose-600 hover:bg-rose-50 hover:text-rose-700 disabled:border-rose-100 disabled:text-rose-300"
                        >
                          {actionLoading === 'reject' ? 'Rejecting…' : 'Reject'}
                        </Button>
                        {canContactCandidate ? (
                          <Button type="button" variant="outline" className="rounded-full px-5" onClick={openContactDialog}>
                            Contact candidate
                          </Button>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-4 w-4" />
                        Company candidate review
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {preview.student.desired_work_location || 'Location not shared'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-start gap-3 pt-1">
                      <p className="max-w-3xl text-sm leading-7 text-slate-700">
                        {skillSummary || 'No profile skills are shared in this preview.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-slate-900">About</h2>
              </div>
              <div className="space-y-3">
                <p className="whitespace-pre-line text-sm leading-7 text-slate-700">
                  {aboutSummary || 'This candidate has not added an about section yet.'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-5 pt-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Profile details</h2>
                <p className="mt-1 text-sm text-slate-500">Shared student profile preferences and language levels.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                    <BriefcaseBusiness className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Desired Job Type</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{preview.student.desired_job_type || 'Not shared'}</p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Preferred Location</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{preview.student.desired_work_location || 'Not shared'}</p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                    <Globe className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Japanese Level</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{preview.student.japanese_level || 'Not shared'}</p>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                    <Globe className="h-5 w-5" />
                  </div>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">English Level</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{preview.student.english_level || 'Not shared'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-5 px-6 py-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-slate-100 bg-slate-100 p-3 text-slate-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Skills</h2>
                  <p className="text-sm text-slate-500">Profile skills shared by this candidate.</p>
                </div>
              </div>

              {preview.student.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {preview.student.skills.map((skill) => (
                    <span
                      key={skill.id}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200"
                    >
                      {skill.skill_name} · {formatLabel(skill.proficiency_level)}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
                  <p className="text-sm font-medium text-slate-700">No skills are shared in this profile preview.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-5 pt-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Experience</h2>
                <p className="mt-1 text-sm text-slate-500">Shared professional background, projects, and recent work.</p>
              </div>

              {preview.student.experience_records.length > 0 ? (
                <div className="space-y-5">
                  {preview.student.experience_records.map((record, index) => {
                    const skillNames = record.skill_ids
                      .map((skillId) => preview.student?.skills.find((skill) => skill.skill_id === skillId)?.skill_name)
                      .filter((skillName): skillName is string => Boolean(skillName))

                    return (
                      <div key={record.id} className="relative pl-14">
                        {index < preview.student.experience_records.length - 1 ? (
                          <div className="absolute left-[19px] top-12 h-[calc(100%-0.5rem)] w-px bg-slate-200" />
                        ) : null}
                        <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                          <BriefcaseBusiness className="h-5 w-5" />
                        </div>
                        <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-slate-900">{record.role_title}</p>
                                {record.is_current ? (
                                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                    Current
                                  </span>
                                ) : null}
                              </div>
                              <p className="text-sm text-slate-500">
                                {record.organization} · {formatLabel(record.experience_type)}
                              </p>
                            </div>
                            <span className="text-sm text-slate-500">
                              {formatDateLabel(record.start_date)} - {record.is_current ? 'Present' : formatDateLabel(record.end_date)}
                            </span>
                          </div>
                          <p className="text-sm leading-6 text-slate-600">{record.summary || 'No experience summary added yet.'}</p>
                          {skillNames.length > 0 ? (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {skillNames.map((skillName) => (
                                <span
                                  key={`${record.id}-${skillName}`}
                                  className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200"
                                >
                                  {skillName}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
                  <p className="text-sm font-medium text-slate-700">No experience added yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-5 pt-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Education</h2>
                <p className="mt-1 text-sm text-slate-500">Shared academic background, training, and study achievements.</p>
              </div>

              {preview.student.education_records.length > 0 ? (
                <div className="space-y-5">
                  {preview.student.education_records.map((record) => {
                    const skillNames = record.skill_ids
                      .map((skillId) => preview.student?.skills.find((skill) => skill.skill_id === skillId)?.skill_name)
                      .filter((skillName): skillName is string => Boolean(skillName))

                    return (
                      <div key={record.id} className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                          <GraduationCap className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-lg font-semibold text-slate-900">{record.institution}</p>
                              <p className="text-sm text-slate-600">{record.field_of_study}</p>
                            </div>
                            <div className="space-y-1 text-right">
                              <p className="text-sm text-slate-500">
                                {formatDateLabel(record.start_date)} - {record.end_date ? formatDateLabel(record.end_date) : 'Present'}
                              </p>
                              <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                                {formatLabel(record.completion_status)}
                              </span>
                            </div>
                          </div>

                          {record.grade ? <p className="text-sm text-slate-700">Grade: {record.grade}</p> : null}
                          {record.activities ? <p className="text-sm text-slate-700">Activities and societies: {record.activities}</p> : null}
                          {record.description ? <p className="whitespace-pre-line text-sm leading-6 text-slate-600">{record.description}</p> : null}
                          {skillNames.length > 0 ? (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {skillNames.map((skillName) => (
                                <span
                                  key={`${record.id}-${skillName}`}
                                  className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200"
                                >
                                  {skillName}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
                  <p className="text-sm font-medium text-slate-700">No education added yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-5 pt-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Certificates</h2>
                <p className="mt-1 text-sm text-slate-500">Shared certifications, licenses, and verified achievements.</p>
              </div>

              {preview.student.certificates.length > 0 ? (
                <div className="space-y-5">
                  {preview.student.certificates.map((certificate) => {
                    const skillNames = certificate.skill_ids
                      .map((skillId) => preview.student?.skills.find((skill) => skill.skill_id === skillId)?.skill_name)
                      .filter((skillName): skillName is string => Boolean(skillName))

                    return (
                      <div key={certificate.id} className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                          <Award className="h-6 w-6" />
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-lg font-semibold text-slate-900">{certificate.name}</p>
                              <p className="text-sm text-slate-600">{certificate.issuer}</p>
                            </div>
                            <div className="space-y-1 text-right">
                              <p className="text-sm text-slate-500">
                                {formatDateLabel(certificate.issue_date)}
                                {certificate.expiry_date ? ` - ${formatDateLabel(certificate.expiry_date)}` : ''}
                              </p>
                              {certificate.credential_id ? (
                                <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                                  ID: {certificate.credential_id}
                                </span>
                              ) : null}
                            </div>
                          </div>

                          {certificate.description ? (
                            <p className="whitespace-pre-line text-sm leading-6 text-slate-600">{certificate.description}</p>
                          ) : null}
                          {certificate.credential_url ? (
                            <a
                              href={certificate.credential_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex text-sm font-medium text-primary transition hover:underline"
                            >
                              View credential
                            </a>
                          ) : null}
                          {skillNames.length > 0 ? (
                            <div className="flex flex-wrap gap-2 pt-1">
                              {skillNames.map((skillName) => (
                                <span
                                  key={`${certificate.id}-${skillName}`}
                                  className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200"
                                >
                                  {skillName}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
                  <p className="text-sm font-medium text-slate-700">No certificates added yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

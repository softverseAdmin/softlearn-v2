import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { BookOpen, ChevronRight, Eye, FileText, History, Lock, ShieldCheck, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { StudentPrivacySettings } from './types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const emptySettings: StudentPrivacySettings = {
  student_id: 0,
  share_profile_preview: true,
  share_learning_record: true,
  share_exam_results: false,
  history: [],
}

type PrivacyToggleKey = 'share_profile_preview' | 'share_learning_record' | 'share_exam_results'

type PrivacyOption = {
  key: PrivacyToggleKey
  title: string
  description: string
  icon: LucideIcon
  enabledLabel: string
  disabledLabel: string
}

const privacyOptions: PrivacyOption[] = [
  {
    key: 'share_profile_preview',
    title: 'Share profile preview',
    description: 'Let approved companies review your core profile, headline strengths, and visible skills during candidate review.',
    icon: Eye,
    enabledLabel: 'Profile shared',
    disabledLabel: 'Profile hidden',
  },
  {
    key: 'share_learning_record',
    title: 'Share learning record',
    description: 'Allow approved companies to see course progress, completed learning paths, and study momentum signals.',
    icon: BookOpen,
    enabledLabel: 'Learning shared',
    disabledLabel: 'Learning hidden',
  },
  {
    key: 'share_exam_results',
    title: 'Share exam results',
    description: 'Only enable this when you want approved companies to review exam outcomes and assessment summaries.',
    icon: FileText,
    enabledLabel: 'Exams shared',
    disabledLabel: 'Exams hidden',
  },
]

function formatVisibilityTimestamp(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

export function StudentPrivacySettingsPage() {
  const { csrfToken } = useAuth()
  const [settings, setSettings] = useState<StudentPrivacySettings>(emptySettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAllConsentHistory, setShowAllConsentHistory] = useState(false)

  useEffect(() => {
    let active = true

    async function loadSettings() {
      try {
        const response = await apiRequest<StudentPrivacySettings>('/student/privacy-settings')
        if (active) {
          setSettings(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load privacy settings.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadSettings()
    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const response = await apiRequest<StudentPrivacySettings>('/student/privacy-settings', {
        method: 'PUT',
        body: {
          share_profile_preview: settings.share_profile_preview,
          share_learning_record: settings.share_learning_record,
          share_exam_results: settings.share_exam_results,
        },
        csrfToken,
      })
      setSettings(response)
      toast.success('Privacy settings updated successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to update privacy settings.')
    } finally {
      setSaving(false)
    }
  }

  const sortedHistory = useMemo(
    () =>
      [...settings.history].sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime()),
    [settings.history]
  )
  const visibleConsentHistory = showAllConsentHistory ? sortedHistory : sortedHistory.slice(0, 3)

  const visibleCount = privacyOptions.reduce((count, option) => count + (settings[option.key] ? 1 : 0), 0)

  if (loading) {
    return (
      <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <Link to="/student" className="transition-colors hover:text-foreground">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">Privacy</span>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Student privacy</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Privacy settings</h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Choose what approved companies may review while keeping consent changes clear and auditable.
          </p>
        </div>

        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
              <p className="mt-4 text-sm text-muted-foreground">Loading privacy settings…</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/student" className="transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Privacy</span>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Student privacy</p>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Privacy settings</h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          Choose what companies may see during approved candidate review. Exam results remain private until you explicitly enable them.
        </p>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="px-6 py-4 text-sm text-red-800 dark:text-red-200">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Visibility controls</CardTitle>
            <CardDescription>Manage what approved companies can review when they have permission-controlled access to your profile.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {privacyOptions.map((option) => {
                const Icon = option.icon
                const enabled = settings[option.key]

                return (
                  <label
                    key={option.key}
                    className="flex cursor-pointer items-start gap-4 rounded-2xl border border-border p-4 transition hover:border-primary/30 hover:bg-muted/30"
                  >
                    <div className="rounded-xl bg-primary/10 p-2 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold">{option.title}</h2>
                        <Badge variant={enabled ? 'default' : 'outline'} className={enabled ? '' : 'text-muted-foreground'}>
                          {enabled ? option.enabledLabel : option.disabledLabel}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={enabled}
                        onChange={(event) => setSettings({ ...settings, [option.key]: event.target.checked })}
                      />
                      <span className="relative inline-flex h-6 w-11 rounded-full bg-muted transition peer-checked:bg-primary after:absolute after:top-0.5 after:left-0.5 after:h-5 after:w-5 after:rounded-full after:bg-background after:shadow-sm after:transition-transform after:content-[''] peer-checked:after:translate-x-5" />
                    </div>
                  </label>
                )
              })}

              <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Changes affect future approved review sessions and are recorded in your consent history below.
                </p>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save privacy settings'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Current visibility
              </CardTitle>
              <CardDescription>Keep a quick view of what is currently visible to approved companies.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="rounded-2xl border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Company-visible sections</p>
                <p className="mt-2 text-3xl font-bold">{visibleCount}/3</p>
              </div>

              <div className="space-y-3">
                {privacyOptions.map((option) => {
                  const Icon = option.icon
                  const enabled = settings[option.key]

                  return (
                    <div key={option.key} className="flex items-center justify-between gap-3 rounded-xl border border-border p-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-muted p-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{option.title}</span>
                      </div>
                      <Badge variant={enabled ? 'default' : 'outline'} className={enabled ? '' : 'text-muted-foreground'}>
                        {enabled ? 'Shared' : 'Hidden'}
                      </Badge>
                    </div>
                  )
                })}
              </div>

              <Button variant="outline" className="w-full" asChild>
                <Link to="/student/profile">Review profile page</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Privacy guardrails
              </CardTitle>
              <CardDescription>These controls work inside the platform's privacy-safe candidate review flow.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-6">
              <div className="rounded-xl border border-border p-3">
                <p className="font-medium">Permission-controlled access</p>
                <p className="mt-1 text-sm text-muted-foreground">Companies only see student data in approved review contexts, not through open browsing.</p>
              </div>
              <div className="rounded-xl border border-border p-3">
                <p className="font-medium">Exam results stay private by default</p>
                <p className="mt-1 text-sm text-muted-foreground">Assessment outcomes remain hidden until you choose to share them explicitly.</p>
              </div>
              <div className="rounded-xl border border-border p-3">
                <p className="font-medium">Consent changes are auditable</p>
                <p className="mt-1 text-sm text-muted-foreground">Every saved change creates a timestamped history entry so access decisions remain explainable.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                Recent consent history
              </CardTitle>
              <CardDescription>Each save creates a snapshot of your sharing choices.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              {sortedHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No consent changes yet.</p>
              ) : (
                visibleConsentHistory.map((event) => (
                  <article key={event.id} className="space-y-3 rounded-2xl border border-border p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{formatVisibilityTimestamp(event.created_at)}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={event.share_profile_preview ? 'default' : 'outline'} className={event.share_profile_preview ? '' : 'text-muted-foreground'}>
                        Profile {event.share_profile_preview ? 'shared' : 'hidden'}
                      </Badge>
                      <Badge variant={event.share_learning_record ? 'default' : 'outline'} className={event.share_learning_record ? '' : 'text-muted-foreground'}>
                        Learning {event.share_learning_record ? 'shared' : 'hidden'}
                      </Badge>
                      <Badge variant={event.share_exam_results ? 'default' : 'outline'} className={event.share_exam_results ? '' : 'text-muted-foreground'}>
                        Exams {event.share_exam_results ? 'shared' : 'hidden'}
                      </Badge>
                    </div>
                  </article>
                ))
              )}
              {!showAllConsentHistory && sortedHistory.length > 3 ? (
                <button
                  type="button"
                  className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
                  onClick={() => setShowAllConsentHistory(true)}
                >
                  See more
                </button>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { BookOpen, ChevronRight, FileBadge2, Image as ImageIcon, Mail, Pencil, UserRoundCheck, Users } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '@/auth/useAuth'
import { LoadingState } from '@/components/LoadingIndicator'
import type { TeacherProfileResponse } from '@/features/teacher/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ApiError, apiRequest, resolveApiAssetUrl } from '@/lib/api'
import { emitStoredProfileImages, type StoredProfileImages } from '@/lib/profileImages'

const emptyProfile: TeacherProfileResponse = {
  user_id: 0,
  full_name: '',
  email: '',
  role_label: 'Teacher',
  joined_at: '',
  overview: '',
  profile_image: null,
  cover_image: null,
  stats: {
    related_students: 0,
    courses: 0,
    exams: 0,
    lessons: 0,
    active_learning_records: 0,
  },
  workspace_focus: [],
  workspace_access: [],
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  if (parts.length === 0) {
    return 'TE'
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join('')
}

function formatJoinedLabel(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Not available'
  }

  return date.toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function toStoredProfileImages(profile: TeacherProfileResponse): StoredProfileImages {
  return {
    profileImage: resolveApiAssetUrl(profile.profile_image),
    coverImage: resolveApiAssetUrl(profile.cover_image),
  }
}

export function TeacherProfilePage() {
  const { csrfToken, user } = useAuth()
  const profileInputRef = useRef<HTMLInputElement | null>(null)
  const coverInputRef = useRef<HTMLInputElement | null>(null)
  const [isEditingName, setIsEditingName] = useState(false)
  const [isEditingOverview, setIsEditingOverview] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [overviewDraft, setOverviewDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedImages, setSavedImages] = useState<StoredProfileImages>({ profileImage: null, coverImage: null })
  const [draftImages, setDraftImages] = useState<StoredProfileImages>({ profileImage: null, coverImage: null })
  const [pendingImageFiles, setPendingImageFiles] = useState<{ profileImage: File | null; coverImage: File | null }>({
    profileImage: null,
    coverImage: null,
  })

  const profileQuery = useQuery({
    queryKey: ['teacher-profile'],
    queryFn: () => apiRequest<TeacherProfileResponse>('/teacher/profile'),
  })

  const profile = profileQuery.data ?? emptyProfile

  useEffect(() => {
    if (!profileQuery.data) {
      return
    }

    setNameDraft(profileQuery.data.full_name)
    setOverviewDraft(profileQuery.data.overview)
    const nextImages = toStoredProfileImages(profileQuery.data)
    setSavedImages(nextImages)
    setDraftImages(nextImages)
  }, [profileQuery.data])

  async function handleImageSelection(event: ChangeEvent<HTMLInputElement>, field: keyof StoredProfileImages) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file for your teacher profile.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Please choose an image smaller than 5 MB.')
      return
    }

    try {
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result)
            return
          }
          reject(new Error('Unable to read image file.'))
        }
        reader.onerror = () => reject(new Error('Unable to read image file.'))
        reader.readAsDataURL(file)
      })

      setDraftImages((current) => ({
        ...current,
        [field]: imageDataUrl,
      }))
      setPendingImageFiles((current) => ({
        ...current,
        [field]: file,
      }))
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load the selected image.')
    }
  }

  function openProfilePicker() {
    profileInputRef.current?.click()
  }

  function openCoverPicker() {
    coverInputRef.current?.click()
  }

  async function handleSaveImages() {
    setSaving(true)

    try {
      let updated = profile

      if (pendingImageFiles.coverImage) {
        const formData = new FormData()
        formData.set('file', pendingImageFiles.coverImage)
        updated = await apiRequest<TeacherProfileResponse>('/teacher/profile/images/cover', {
          method: 'POST',
          body: formData,
          csrfToken,
        })
      }

      if (pendingImageFiles.profileImage) {
        const formData = new FormData()
        formData.set('file', pendingImageFiles.profileImage)
        updated = await apiRequest<TeacherProfileResponse>('/teacher/profile/images/profile', {
          method: 'POST',
          body: formData,
          csrfToken,
        })
      }

      const nextImages = toStoredProfileImages(updated)
      setSavedImages(nextImages)
      setDraftImages(nextImages)
      setPendingImageFiles({ profileImage: null, coverImage: null })
      emitStoredProfileImages(user?.user_id, nextImages)
      void profileQuery.refetch()
      toast.success('Teacher profile images saved successfully.')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Unable to save teacher profile images.')
    } finally {
      setSaving(false)
    }
  }

  async function saveProfile(overrides?: Partial<Pick<TeacherProfileResponse, 'full_name' | 'overview'>>) {
    const fullName = (overrides?.full_name ?? nameDraft).trim()
    const overview = (overrides?.overview ?? overviewDraft).trim()

    if (!fullName) {
      toast.error('Teacher name cannot be empty.')
      return
    }

    setSaving(true)

    try {
      const updated = await apiRequest<TeacherProfileResponse>('/teacher/profile', {
        method: 'PUT',
        body: {
          full_name: fullName,
          overview,
        },
        csrfToken,
      })
      void profileQuery.refetch()
      setNameDraft(updated.full_name)
      setOverviewDraft(updated.overview)
      setIsEditingName(false)
      setIsEditingOverview(false)
      toast.success('Teacher profile updated successfully.')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Unable to update teacher profile.')
    } finally {
      setSaving(false)
    }
  }

  if (profileQuery.isLoading) {
    return (
      <section className="page">
        <div className="card">
          <LoadingState title="Loading teacher profile" className="min-h-40" />
        </div>
      </section>
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/teacher" className="transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Profile</span>
      </div>

      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => void handleImageSelection(event, 'coverImage')}
      />
      <input
        ref={profileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => void handleImageSelection(event, 'profileImage')}
      />

      <Card className="overflow-hidden border-slate-200 bg-white pt-0 shadow-sm">
        <div className="relative">
          <div className="relative h-40 overflow-hidden bg-gradient-to-r from-slate-700 via-slate-600 to-sky-500 md:h-52">
            {draftImages.coverImage ? (
              <img src={draftImages.coverImage} alt="Teacher cover preview" className="absolute inset-0 h-full w-full object-cover" />
            ) : null}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.18),transparent_28%)]" />
            <div className="absolute inset-y-0 right-0 w-1/3 bg-white/10" />
            <button
              type="button"
              onClick={openCoverPicker}
              className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white shadow-sm backdrop-blur-sm transition hover:bg-black/60"
              aria-label="Upload cover image"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-black/35 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              <ImageIcon className="h-3.5 w-3.5" />
              Cover image
            </div>
          </div>

          <div className="absolute left-6 top-full -translate-y-1/2">
            <div className="relative rounded-full border-4 border-white bg-white shadow-lg">
              <Avatar className="h-28 w-28 md:h-32 md:w-32">
                {draftImages.profileImage ? <AvatarImage src={draftImages.profileImage} alt={`${profile.full_name} profile`} /> : null}
                <AvatarFallback className="bg-slate-100 text-3xl font-semibold text-slate-700">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={openProfilePicker}
                className="absolute bottom-2 right-2 inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow-sm transition hover:bg-slate-700"
                aria-label="Upload profile image"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <CardContent className="pt-18 md:pt-20">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="space-y-3">
              <div className="space-y-1">
                {isEditingName ? (
                  <div className="space-y-3">
                    <Input
                      value={nameDraft}
                      onChange={(event) => setNameDraft(event.target.value)}
                      className="h-14 max-w-2xl text-2xl font-bold md:h-16 md:text-4xl"
                      autoFocus
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" onClick={() => void saveProfile({ full_name: nameDraft })} disabled={saving}>
                        {saving ? 'Saving…' : 'Save name'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setNameDraft(profile.full_name)
                          setIsEditingName(false)
                        }}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="inline-flex items-center gap-3 text-left text-5xl leading-none font-black tracking-tight text-slate-900 transition hover:text-primary md:text-6xl lg:text-7xl"
                    style={{ fontSize: 'xx-large' }}
                  >
                    <span>{profile.full_name || 'Teacher Profile'}</span>
                    <Pencil className="h-5 w-5 flex-shrink-0" />
                  </button>
                )}
                <p className="text-sm font-medium text-slate-500">{profile.role_label} workspace</p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  {profile.email || 'No email available'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <UserRoundCheck className="h-4 w-4" />
                  Joined {formatJoinedLabel(profile.joined_at)}
                </span>
              </div>
            </div>
            {draftImages.profileImage !== savedImages.profileImage || draftImages.coverImage !== savedImages.coverImage ? (
              <Button type="button" onClick={() => void handleSaveImages()} disabled={saving}>
                {saving ? 'Saving…' : 'Save images'}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-5 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-slate-900">Overview</h2>
              <p className="text-sm text-slate-500">Keep your teacher summary aligned with the learners and courses you own.</p>
            </div>
            {!isEditingOverview ? (
              <Button type="button" variant="outline" onClick={() => setIsEditingOverview(true)}>
                <Pencil className="h-4 w-4" />
                Edit overview
              </Button>
            ) : null}
          </div>

          {isEditingOverview ? (
            <div className="space-y-3">
              <Textarea value={overviewDraft} onChange={(event) => setOverviewDraft(event.target.value)} rows={6} />
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => void saveProfile({ overview: overviewDraft })} disabled={saving}>
                  {saving ? 'Saving…' : 'Save overview'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOverviewDraft(profile.overview)
                    setIsEditingOverview(false)
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{profile.overview}</p>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-6 pt-6">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Teacher information</h2>
            <p className="mt-1 text-sm text-slate-500">Only data linked to your own courses and learners is shown in this workspace.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Related students</p>
              <p className="text-sm font-medium text-slate-900">{profile.stats.related_students}</p>
            </div>
            <div className="space-y-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Courses</p>
              <p className="text-sm font-medium text-slate-900">{profile.stats.courses}</p>
            </div>
            <div className="space-y-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Exams</p>
              <p className="text-sm font-medium text-slate-900">{profile.stats.exams}</p>
            </div>
            <div className="space-y-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Lessons</p>
              <p className="text-sm font-medium text-slate-900">{profile.stats.lessons}</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Workspace focus</p>
              <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">
                {profile.workspace_focus.map((item) => (
                  <div key={item.label} className="flex items-start justify-between gap-4 border-b border-slate-200 pb-3 last:border-b-0 last:pb-0">
                    <span className="font-medium text-slate-900">{item.label}</span>
                    <span className="text-right text-slate-600">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Workspace access</p>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-wrap gap-2">
                  {profile.workspace_access.map((item) => (
                    <span key={item} className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                <Users className="h-4 w-4" />
                Students
              </p>
              <p className="text-sm font-medium text-slate-900">{profile.stats.related_students} linked learner accounts</p>
            </div>
            <div className="space-y-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                <BookOpen className="h-4 w-4" />
                Courses
              </p>
              <p className="text-sm font-medium text-slate-900">{profile.stats.courses} teacher-owned learning experiences</p>
            </div>
            <div className="space-y-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                <FileBadge2 className="h-4 w-4" />
                Activity
              </p>
              <p className="text-sm font-medium text-slate-900">
                {profile.stats.exams} exams and {profile.stats.active_learning_records} active learning records
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

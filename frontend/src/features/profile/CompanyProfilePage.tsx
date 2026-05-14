import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { CompanyProfile } from './types'
import { BriefcaseBusiness, ChevronRight, Image as ImageIcon, Mail, Pencil } from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { emitStoredProfileImages, type StoredProfileImages } from '@/lib/profileImages'

const emptyProfile: CompanyProfile = {
  company_id: 0,
  name: '',
  description: '',
  profile_image: null,
  cover_image: null,
  job_posting_id: '',
  founder_name: '',
  headquarters_address: '',
  office_locations: '',
  founded_at: '',
  website_url: '',
  industry: '',
  company_points: [],
  business_domains: [],
  business_models: [],
  employee_count_label: '',
  market_category: '',
  capital_label: '',
  revenue_label: '',
  tagline: '',
  company_features: '',
  additional_company_info: '',
  profile_complete: false,
}

const defaultDescription =
  'Add a short company summary to introduce your hiring focus and the opportunities available to students.'

const overviewPreviewLimit = 420

type CompanyProfilePayload = {
  name: string
  description: string
  profile_image: string
  cover_image: string
  job_posting_id: string
  founder_name: string
  headquarters_address: string
  office_locations: string
  founded_at: string
  website_url: string
  industry: string
  company_points: string[]
  business_domains: string[]
  business_models: string[]
  employee_count_label: string
  market_category: string
  capital_label: string
  revenue_label: string
  tagline: string
  company_features: string
  additional_company_info: string
}

type CompanyDetailsDraft = {
  founder_name: string
  headquarters_address: string
  office_locations: string
  founded_at: string
  website_url: string
  industry: string
  company_points: string
  business_domains: string
  business_models: string
  employee_count_label: string
  market_category: string
  capital_label: string
  revenue_label: string
  tagline: string
  description: string
  company_features: string
  additional_company_info: string
}

function getInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)

  if (parts.length === 0) {
    return 'CO'
  }

  return parts.map((part) => part.charAt(0).toUpperCase()).join('')
}

function readImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
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
}

function toStoredProfileImages(profile: CompanyProfile): StoredProfileImages {
  return {
    profileImage: profile.profile_image,
    coverImage: profile.cover_image,
  }
}

function joinLines(values: string[]) {
  return values.join('\n')
}

function splitLines(value: string) {
  return value
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function toDetailsDraft(profile: CompanyProfile): CompanyDetailsDraft {
  return {
    founder_name: profile.founder_name,
    headquarters_address: profile.headquarters_address,
    office_locations: profile.office_locations,
    founded_at: profile.founded_at,
    website_url: profile.website_url,
    industry: profile.industry,
    company_points: joinLines(profile.company_points),
    business_domains: joinLines(profile.business_domains),
    business_models: joinLines(profile.business_models),
    employee_count_label: profile.employee_count_label,
    market_category: profile.market_category,
    capital_label: profile.capital_label,
    revenue_label: profile.revenue_label,
    tagline: profile.tagline,
    description: profile.description,
    company_features: profile.company_features,
    additional_company_info: profile.additional_company_info,
  }
}

export function CompanyProfilePage() {
  const { user, csrfToken } = useAuth()
  const profileInputRef = useRef<HTMLInputElement | null>(null)
  const coverInputRef = useRef<HTMLInputElement | null>(null)
  const [profile, setProfile] = useState<CompanyProfile>(emptyProfile)
  const [savedImages, setSavedImages] = useState<StoredProfileImages>({ profileImage: null, coverImage: null })
  const [draftImages, setDraftImages] = useState<StoredProfileImages>({ profileImage: null, coverImage: null })
  const [loading, setLoading] = useState(true)
  const [savingImages, setSavingImages] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [isEditingOverview, setIsEditingOverview] = useState(false)
  const [overviewDraft, setOverviewDraft] = useState('')
  const [savingOverview, setSavingOverview] = useState(false)
  const [isOverviewExpanded, setIsOverviewExpanded] = useState(false)
  const [isEditingDetails, setIsEditingDetails] = useState(false)
  const [detailsDraft, setDetailsDraft] = useState<CompanyDetailsDraft>(toDetailsDraft(emptyProfile))
  const [savingDetails, setSavingDetails] = useState(false)

  const displayName = profile.name.trim() || user?.name?.trim() || 'Company Profile'
  const initials = getInitials(displayName)
  const overviewText = profile.description || defaultDescription
  const shouldShowOverviewToggle = overviewText.length > overviewPreviewLimit
  const displayedOverview =
    isOverviewExpanded || !shouldShowOverviewToggle
      ? overviewText
      : `${overviewText.slice(0, overviewPreviewLimit).trimEnd()}...`

  useEffect(() => {
    let active = true

    async function loadProfile() {
      try {
        const profileData = await apiRequest<CompanyProfile>('/company/profile')
        if (!active) {
          return
        }

        setProfile(profileData)
        setSavedImages(toStoredProfileImages(profileData))
        setDraftImages(toStoredProfileImages(profileData))
        setNameDraft(profileData.name)
        setOverviewDraft(profileData.description)
        setIsOverviewExpanded(false)
        setDetailsDraft(toDetailsDraft(profileData))
      } catch (error) {
        if (active) {
          toast.error(error instanceof ApiError ? error.message : 'Unable to load company profile.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadProfile()

    return () => {
      active = false
    }
  }, [])

  const hasUnsavedImageChanges =
    draftImages.profileImage !== savedImages.profileImage || draftImages.coverImage !== savedImages.coverImage

  function buildCompanyProfilePayload(overrides?: Partial<CompanyProfilePayload>): CompanyProfilePayload {
    return {
      name: overrides?.name ?? profile.name,
      description: overrides?.description ?? profile.description,
      profile_image: overrides?.profile_image ?? (savedImages.profileImage ?? ''),
      cover_image: overrides?.cover_image ?? (savedImages.coverImage ?? ''),
      job_posting_id: overrides?.job_posting_id ?? profile.job_posting_id,
      founder_name: overrides?.founder_name ?? profile.founder_name,
      headquarters_address: overrides?.headquarters_address ?? profile.headquarters_address,
      office_locations: overrides?.office_locations ?? profile.office_locations,
      founded_at: overrides?.founded_at ?? profile.founded_at,
      website_url: overrides?.website_url ?? profile.website_url,
      industry: overrides?.industry ?? profile.industry,
      company_points: overrides?.company_points ?? profile.company_points,
      business_domains: overrides?.business_domains ?? profile.business_domains,
      business_models: overrides?.business_models ?? profile.business_models,
      employee_count_label: overrides?.employee_count_label ?? profile.employee_count_label,
      market_category: overrides?.market_category ?? profile.market_category,
      capital_label: overrides?.capital_label ?? profile.capital_label,
      revenue_label: overrides?.revenue_label ?? profile.revenue_label,
      tagline: overrides?.tagline ?? profile.tagline,
      company_features: overrides?.company_features ?? profile.company_features,
      additional_company_info: overrides?.additional_company_info ?? profile.additional_company_info,
    }
  }

  async function handleImageSelection(
    event: ChangeEvent<HTMLInputElement>,
    field: keyof StoredProfileImages,
  ) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file for your company profile.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Please choose an image smaller than 5 MB.')
      return
    }

    try {
      const imageDataUrl = await readImageFile(file)
      setDraftImages((current) => ({
        ...current,
        [field]: imageDataUrl,
      }))
    } catch (uploadError) {
      toast.error(uploadError instanceof Error ? uploadError.message : 'Unable to load the selected image.')
    }
  }

  function openProfilePicker() {
    profileInputRef.current?.click()
  }

  function openCoverPicker() {
    coverInputRef.current?.click()
  }

  async function handleSaveImages() {
    setSavingImages(true)

    try {
      const updated = await apiRequest<CompanyProfile>('/company/profile', {
        method: 'PUT',
        body: buildCompanyProfilePayload({
          profile_image: draftImages.profileImage ?? '',
          cover_image: draftImages.coverImage ?? '',
        }),
        csrfToken,
      })
      setProfile(updated)
      setDetailsDraft(toDetailsDraft(updated))
      const nextImages = toStoredProfileImages(updated)
      setSavedImages(nextImages)
      setDraftImages(nextImages)
      emitStoredProfileImages(user?.user_id, nextImages)
      toast.success('Company profile images saved successfully.')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Unable to save company profile images.')
    } finally {
      setSavingImages(false)
    }
  }

  async function handleSaveName() {
    const trimmedName = nameDraft.trim()
    if (!trimmedName) {
      toast.error('Company name cannot be empty.')
      return
    }

    setSavingName(true)

    try {
      const updated = await apiRequest<CompanyProfile>('/company/profile', {
        method: 'PUT',
        body: buildCompanyProfilePayload({ name: trimmedName }),
        csrfToken,
      })
      setProfile(updated)
      setNameDraft(updated.name)
      setDetailsDraft(toDetailsDraft(updated))
      setIsEditingName(false)
      toast.success('Company name updated successfully.')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Unable to update company name.')
    } finally {
      setSavingName(false)
    }
  }

  function handleCancelNameEdit() {
    setNameDraft(profile.name)
    setIsEditingName(false)
  }

  function handleCancelOverviewEdit() {
    setOverviewDraft(profile.description)
    setIsEditingOverview(false)
  }

  async function handleSaveOverview() {
    const trimmedOverview = overviewDraft.trim()
    if (!trimmedOverview) {
      toast.error('Overview cannot be empty.')
      return
    }

    setSavingOverview(true)

    try {
      const updated = await apiRequest<CompanyProfile>('/company/profile', {
        method: 'PUT',
        body: buildCompanyProfilePayload({ description: trimmedOverview }),
        csrfToken,
      })
      setProfile(updated)
      setNameDraft(updated.name)
      setOverviewDraft(updated.description)
      setIsOverviewExpanded(false)
      setDetailsDraft(toDetailsDraft(updated))
      setIsEditingOverview(false)
      toast.success('Overview updated successfully.')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Unable to update overview.')
    } finally {
      setSavingOverview(false)
    }
  }

  async function handleSaveDetails() {
    setSavingDetails(true)

    try {
      const updated = await apiRequest<CompanyProfile>('/company/profile', {
        method: 'PUT',
        body: buildCompanyProfilePayload({
          founder_name: detailsDraft.founder_name.trim(),
          headquarters_address: detailsDraft.headquarters_address.trim(),
          office_locations: detailsDraft.office_locations.trim(),
          founded_at: detailsDraft.founded_at.trim(),
          website_url: detailsDraft.website_url.trim(),
          industry: detailsDraft.industry.trim(),
          company_points: splitLines(detailsDraft.company_points),
          business_domains: splitLines(detailsDraft.business_domains),
          business_models: splitLines(detailsDraft.business_models),
          employee_count_label: detailsDraft.employee_count_label.trim(),
          market_category: detailsDraft.market_category.trim(),
          capital_label: detailsDraft.capital_label.trim(),
          revenue_label: detailsDraft.revenue_label.trim(),
          tagline: detailsDraft.tagline.trim(),
          company_features: detailsDraft.company_features.trim(),
          additional_company_info: detailsDraft.additional_company_info.trim(),
        }),
        csrfToken,
      })
      setProfile(updated)
      setOverviewDraft(updated.description)
      setDetailsDraft(toDetailsDraft(updated))
      setIsEditingDetails(false)
      toast.success('Company details updated successfully.')
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Unable to update company details.')
    } finally {
      setSavingDetails(false)
    }
  }

  function handleCancelDetailsEdit() {
    setDetailsDraft(toDetailsDraft(profile))
    setIsEditingDetails(false)
  }

  if (loading) {
    return <section className="page"><div className="card">Loading company profile…</div></section>
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/company" className="transition-colors hover:text-foreground">
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

      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm pt-0">
        <div className="relative">
          <div className="relative h-40 overflow-hidden bg-gradient-to-r from-slate-700 via-slate-600 to-sky-500 md:h-52">
            {draftImages.coverImage ? (
              <img src={draftImages.coverImage} alt="Company cover preview" className="absolute inset-0 h-full w-full object-cover" />
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
                {draftImages.profileImage ? <AvatarImage src={draftImages.profileImage} alt={`${displayName} profile`} /> : null}
                <AvatarFallback className="bg-slate-100 text-3xl font-semibold text-slate-700">
                  {initials}
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
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          void handleSaveName()
                        }
                        if (event.key === 'Escape') {
                          handleCancelNameEdit()
                        }
                      }}
                      className="h-14 max-w-2xl text-2xl font-bold md:h-16 md:text-4xl"
                      autoFocus
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" onClick={() => void handleSaveName()} disabled={savingName}>
                        {savingName ? 'Saving…' : 'Save name'}
                      </Button>
                      <Button type="button" variant="outline" onClick={handleCancelNameEdit} disabled={savingName}>
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
                    <span>{displayName}</span>
                    <Pencil className="h-5 w-5 flex-shrink-0" />
                  </button>
                )}
                {user?.name ? <p className="text-sm font-medium text-slate-500">Representative: {user.name}</p> : null}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                {user?.email ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-1.5">
                  <BriefcaseBusiness className="h-4 w-4" />
                  Company workspace
                </span>
              </div>
            </div>

            {hasUnsavedImageChanges ? (
              <Button type="button" onClick={() => void handleSaveImages()} disabled={savingImages} className="min-w-28">
                {savingImages ? 'Saving…' : 'Save'}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-5 pt-6">
          <div className="flex items-start justify-between gap-1">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-slate-900">Overview</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingOverview(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Edit overview"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>

          {isEditingOverview ? (
            <div className="space-y-4">
              <Textarea
                value={overviewDraft}
                onChange={(event) => setOverviewDraft(event.target.value)}
                rows={8}
                className="resize-none"
                placeholder={defaultDescription}
                autoFocus
              />
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => void handleSaveOverview()} disabled={savingOverview}>
                  {savingOverview ? 'Saving…' : 'Save overview'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancelOverviewEdit} disabled={savingOverview}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{displayedOverview}</p>
              {shouldShowOverviewToggle ? (
                <button
                  type="button"
                  onClick={() => setIsOverviewExpanded((current) => !current)}
                  className="text-sm font-medium text-primary transition hover:underline"
                >
                  {isOverviewExpanded ? 'Show less' : 'Show more'}
                </button>
              ) : null}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="space-y-5 pt-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Company information</h2>
              <p className="mt-1 text-sm text-slate-500">Keep your public company profile aligned with the rest of the workspace.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditingDetails(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Edit company details"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>

          {isEditingDetails ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Core profile</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Founder name</span>
                    <Input value={detailsDraft.founder_name} onChange={(event) => setDetailsDraft((current) => ({ ...current, founder_name: event.target.value }))} placeholder="Taro Yamada" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Founded</span>
                    <Input value={detailsDraft.founded_at} onChange={(event) => setDetailsDraft((current) => ({ ...current, founded_at: event.target.value }))} placeholder="2013" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Website</span>
                    <Input value={detailsDraft.website_url} onChange={(event) => setDetailsDraft((current) => ({ ...current, website_url: event.target.value }))} placeholder="https://example.co.jp/" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Industry</span>
                    <Input value={detailsDraft.industry} onChange={(event) => setDetailsDraft((current) => ({ ...current, industry: event.target.value }))} placeholder="Staffing and Recruiting" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Company size</span>
                    <Input value={detailsDraft.employee_count_label} onChange={(event) => setDetailsDraft((current) => ({ ...current, employee_count_label: event.target.value }))} placeholder="11-50 employees" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Headquarters</span>
                    <Input value={detailsDraft.headquarters_address} onChange={(event) => setDetailsDraft((current) => ({ ...current, headquarters_address: event.target.value }))} placeholder="Shinjuku-ku, Tokyo" />
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Specialties and locations</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Locations</span>
                    <Textarea value={detailsDraft.office_locations} onChange={(event) => setDetailsDraft((current) => ({ ...current, office_locations: event.target.value }))} rows={4} placeholder={'Primary\n2-6-1 Nishi-Shinjuku, Shinjuku Sumitomo Bldg, 24th Floor\nShinjuku-ku, Tokyo 160-0023, JP'} />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Specialties</span>
                    <Textarea value={detailsDraft.business_domains} onChange={(event) => setDetailsDraft((current) => ({ ...current, business_domains: event.target.value }))} rows={5} placeholder={'Recruiting\nConsulting\nEducation\nEvent\nHuman Resources\nDiversity'} />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Company highlights</span>
                    <Textarea value={detailsDraft.company_points} onChange={(event) => setDetailsDraft((current) => ({ ...current, company_points: event.target.value }))} rows={5} placeholder={'Global talent network\nCross-cultural hiring\nInclusive workforce support'} />
                  </label>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Additional business details</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Market category</span>
                    <Input value={detailsDraft.market_category} onChange={(event) => setDetailsDraft((current) => ({ ...current, market_category: event.target.value }))} placeholder="Private" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Capital</span>
                    <Input value={detailsDraft.capital_label} onChange={(event) => setDetailsDraft((current) => ({ ...current, capital_label: event.target.value }))} placeholder="JPY 70 million" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-slate-700">Revenue</span>
                    <Input value={detailsDraft.revenue_label} onChange={(event) => setDetailsDraft((current) => ({ ...current, revenue_label: event.target.value }))} placeholder="Not disclosed" />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Tagline</span>
                    <Input value={detailsDraft.tagline} onChange={(event) => setDetailsDraft((current) => ({ ...current, tagline: event.target.value }))} placeholder="Build connections that drive innovation across cultures." />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Business models</span>
                    <Textarea value={detailsDraft.business_models} onChange={(event) => setDetailsDraft((current) => ({ ...current, business_models: event.target.value }))} rows={4} placeholder={'Recruiting services\nConsulting engagements\nEducation programs'} />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Company features</span>
                    <Textarea value={detailsDraft.company_features} onChange={(event) => setDetailsDraft((current) => ({ ...current, company_features: event.target.value }))} rows={8} placeholder="Describe your culture, office environment, funding, or unique strengths." />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm font-medium text-slate-700">Additional company information</span>
                    <Textarea value={detailsDraft.additional_company_info} onChange={(event) => setDetailsDraft((current) => ({ ...current, additional_company_info: event.target.value }))} rows={4} placeholder="Add extra notes such as major shareholders or media references." />
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => void handleSaveDetails()} disabled={savingDetails}>
                  {savingDetails ? 'Saving…' : 'Save details'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancelDetailsEdit} disabled={savingDetails}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="space-y-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Founder name</p>
                  <p className="text-sm font-medium text-slate-900">{profile.founder_name || 'Not set'}</p>
                </div>
                <div className="space-y-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Founded</p>
                  <p className="text-sm font-medium text-slate-900">{profile.founded_at || 'Not set'}</p>
                </div>
                <div className="space-y-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Website</p>
                  {profile.website_url ? (
                    <a href={profile.website_url} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline">
                      {profile.website_url}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-slate-900">Not set</p>
                  )}
                </div>
                <div className="space-y-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Industry</p>
                  <p className="text-sm font-medium text-slate-900">{profile.industry || 'Not set'}</p>
                </div>
                <div className="space-y-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Company size</p>
                  <p className="text-sm font-medium text-slate-900">{profile.employee_count_label || 'Not set'}</p>
                </div>
                <div className="space-y-1 rounded-2xl border border-slate-100 bg-slate-50 p-4 md:col-span-2 xl:col-span-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Headquarters</p>
                  <p className="whitespace-pre-line text-sm font-medium text-slate-900">{profile.headquarters_address || 'Not set'}</p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Locations</p>
                  <p className="whitespace-pre-line rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">
                    {profile.office_locations || 'Not set'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Tagline</p>
                  <p className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-900">
                    {profile.tagline || 'Not set'}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.business_domains.length > 0 ? profile.business_domains.map((domain) => (
                      <span key={domain} className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">
                        {domain}
                      </span>
                    )) : <p className="text-sm text-slate-500">Not set</p>}
                  </div>
                </div>
                <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Company highlights</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.company_points.length > 0 ? profile.company_points.map((point) => (
                      <span key={point} className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">
                        {point}
                      </span>
                    )) : <p className="text-sm text-slate-500">Not set</p>}
                  </div>
                </div>
                <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Business models</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.business_models.length > 0 ? profile.business_models.map((model) => (
                      <span key={model} className="rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm">
                        {model}
                      </span>
                    )) : <p className="text-sm text-slate-500">Not set</p>}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Market category</p>
                  <p className="text-sm font-medium text-slate-900">{profile.market_category || 'Not set'}</p>
                </div>
                <div className="space-y-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Capital</p>
                  <p className="text-sm font-medium text-slate-900">{profile.capital_label || 'Not set'}</p>
                </div>
                <div className="space-y-1 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Revenue</p>
                  <p className="text-sm font-medium text-slate-900">{profile.revenue_label || 'Not set'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Company features</p>
                <p className="whitespace-pre-line rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">
                  {profile.company_features || 'Not set'}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Additional company information</p>
                <p className="whitespace-pre-line rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4 text-sm leading-7 text-slate-700">
                  {profile.additional_company_info || 'Not set'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

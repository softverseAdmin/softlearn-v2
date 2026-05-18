import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Briefcase, ChevronRight, Clock3, Globe2, MoreVertical, PencilLine, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { useAuth } from '@/auth/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ApiError } from '@/lib/api'
import { fetchCompanyVacancies, retireCompanyVacancy, saveCompanyVacancy } from './companyVacanciesApi'

import type { CompanyVacanciesResponse, VacancyPostingDetails, VacancyRecord } from './types'
import { FormField, FormSelect, FormTextarea, ToggleField } from './company-post-jobs/FormFields'
import {
  emptyPostingDetails,
  emptyVacanciesResponse,
  employmentTypeOptions,
  experienceLevelOptions,
  formatLabel,
  formatRelativeDate,
  formatSalary,
  formatSkillsSummary,
  getCompanyInitials,
  getSelectOptionsWithCurrentValue,
  normalizePostingDetails,
  postingDetailSections,
  type PostingDetailField,
  statusOptions,
  workStyleOptions,
} from './company-post-jobs/shared'

export function CompanyPostJobsPage() {
  const { csrfToken } = useAuth()
  const [data, setData] = useState<CompanyVacanciesResponse>(emptyVacanciesResponse)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedVacancyId, setSelectedVacancyId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [employmentType, setEmploymentType] = useState('full_time')
  const [experienceLevel, setExperienceLevel] = useState('mid')
  const [location, setLocation] = useState('')
  const [workStyle, setWorkStyle] = useState('remote')
  const [relocationSupport, setRelocationSupport] = useState(false)
  const [status, setStatus] = useState('draft')
  const [minSalary, setMinSalary] = useState('')
  const [maxSalary, setMaxSalary] = useState('')
  const [postingDetails, setPostingDetails] = useState<VacancyPostingDetails>(emptyPostingDetails)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Partial<Record<'title' | 'location' | 'minSalary' | 'maxSalary' | 'responsibilities', string>>>({})

  const selectedVacancy = useMemo(
    () => data.vacancies.find((vacancy) => vacancy.vacancy_id === selectedVacancyId) ?? null,
    [data.vacancies, selectedVacancyId],
  )
  const isEditing = isFormOpen && selectedVacancy !== null

  useEffect(() => {
    let active = true

    async function loadVacancies() {
      try {
        const response = await fetchCompanyVacancies()
        if (!active) {
          return
        }
        setData(response)
      } catch (loadError) {
        if (!active) {
          return
        }
        setError(loadError instanceof ApiError ? loadError.message : 'Unable to load job posts.')
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadVacancies()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selectedVacancy) {
      setTitle('')
      setEmploymentType('full_time')
      setExperienceLevel('mid')
      setLocation('')
      setWorkStyle('remote')
      setRelocationSupport(false)
      setStatus('draft')
      setMinSalary('')
      setMaxSalary('')
      setPostingDetails(emptyPostingDetails)
      setFormErrors({})
      return
    }

    setTitle(selectedVacancy.title)
    setEmploymentType(selectedVacancy.employment_type)
    setExperienceLevel(selectedVacancy.experience_level)
    setLocation(selectedVacancy.location)
    setWorkStyle(selectedVacancy.work_style)
    setRelocationSupport(selectedVacancy.relocation_support)
    setStatus(selectedVacancy.status)
    setMinSalary(selectedVacancy.min_salary?.toString() ?? '')
    setMaxSalary(selectedVacancy.max_salary?.toString() ?? '')
    setPostingDetails(
      normalizePostingDetails({
        ...selectedVacancy.posting_details,
        responsibilities:
          selectedVacancy.posting_details.responsibilities || selectedVacancy.description,
      }),
    )
    setFormErrors({})
  }, [selectedVacancy])

  async function refreshVacancies() {
    const response = await fetchCompanyVacancies()
    setData(response)
  }

  function openCreateForm() {
    setSelectedVacancyId(null)
    setIsFormOpen(true)
    setError(null)
    setFormErrors({})
  }

  function openEditForm(vacancy: VacancyRecord) {
    setSelectedVacancyId(vacancy.vacancy_id)
    setIsFormOpen(true)
    setError(null)
    setFormErrors({})
  }

  function closeForm() {
    setSelectedVacancyId(null)
    setIsFormOpen(false)
    setError(null)
    setFormErrors({})
  }

  function updatePostingDetail(key: PostingDetailField, value: string) {
    setPostingDetails((current) => ({
      ...current,
      [key]: value,
    }))
    if (key === 'responsibilities') {
      setFormErrors((current) => ({ ...current, responsibilities: undefined }))
      setError(null)
    }
  }

  function validateForm() {
    const nextErrors: Partial<Record<'title' | 'location' | 'minSalary' | 'maxSalary' | 'responsibilities', string>> = {}
    const normalizedTitle = title.trim()
    const normalizedLocation = location.trim()
    const normalizedResponsibilities = postingDetails.responsibilities.trim()

    const parsedMinSalary = minSalary.trim() ? Number(minSalary) : null
    const parsedMaxSalary = maxSalary.trim() ? Number(maxSalary) : null

    if (!normalizedTitle) {
      nextErrors.title = 'Role title is required.'
    }
    if (!normalizedLocation) {
      nextErrors.location = 'Work location is required.'
    }
    if (!normalizedResponsibilities) {
      nextErrors.responsibilities = 'Responsibilities are required.'
    }
    if (minSalary.trim() && (!Number.isFinite(parsedMinSalary) || parsedMinSalary === null || parsedMinSalary < 0)) {
      nextErrors.minSalary = 'Minimum salary must be a valid non-negative number.'
    }
    if (maxSalary.trim() && (!Number.isFinite(parsedMaxSalary) || parsedMaxSalary === null || parsedMaxSalary < 0)) {
      nextErrors.maxSalary = 'Maximum salary must be a valid non-negative number.'
    }
    if (
      parsedMinSalary !== null &&
      parsedMaxSalary !== null &&
      Number.isFinite(parsedMinSalary) &&
      Number.isFinite(parsedMaxSalary) &&
      parsedMaxSalary < parsedMinSalary
    ) {
      nextErrors.maxSalary = 'Maximum salary must be greater than or equal to minimum salary.'
    }

    return nextErrors
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateForm()
    setFormErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      setError('Fix the highlighted job post fields before saving.')
      return
    }

    setSaving(true)
    setError(null)

    const body = {
      title: title.trim(),
      description: postingDetails.responsibilities.trim(),
      employment_type: employmentType,
      experience_level: experienceLevel,
      location: location.trim(),
      work_style: workStyle,
      relocation_support: relocationSupport,
      min_salary: minSalary.trim() ? Number(minSalary) : null,
      max_salary: maxSalary.trim() ? Number(maxSalary) : null,
      status,
      posting_details: postingDetails,
      required_skill_ids: selectedVacancy?.skill_requirements
        .filter((requirement) => requirement.requirement_type === 'required')
        .map((requirement) => requirement.skill_id) ?? [],
      preferred_skill_ids: selectedVacancy?.skill_requirements
        .filter((requirement) => requirement.requirement_type === 'preferred')
        .map((requirement) => requirement.skill_id) ?? [],
      language_requirements: selectedVacancy?.language_requirements ?? [],
    }

    try {
      if (selectedVacancy) {
        await saveCompanyVacancy({
          vacancyId: selectedVacancy.vacancy_id,
          payload: body,
          csrfToken,
        })
        toast.success('Job post updated successfully.')
      } else {
        await saveCompanyVacancy({
          payload: body,
          csrfToken,
        })
        toast.success('Job post created successfully.')
      }

      await refreshVacancies()
      closeForm()
    } catch (saveError) {
      const message = saveError instanceof ApiError ? saveError.message : 'Unable to save this job post.'
      setError(message)
      toast.error(message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(vacancyId: number) {
    setSaving(true)
    setError(null)

    try {
      await retireCompanyVacancy(vacancyId, csrfToken)
      await refreshVacancies()
      if (selectedVacancyId === vacancyId) {
        closeForm()
      }
      toast.success('Job post retired successfully.')
    } catch (saveError) {
      toast.error(saveError instanceof ApiError ? saveError.message : 'Unable to retire this job post.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">Loading job posts...</div>
  }

  return (
    <div className="space-y-6 px-4 py-6 md:space-y-8 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/company" className="transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="transition-colors hover:text-foreground">Post Jobs</span>
        {isEditing ? (
          <>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground">{selectedVacancy.title}</span>
          </>
        ) : null}
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Company hiring</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            {isEditing ? `Edit ${selectedVacancy.title}` : 'Post Jobs'}
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            {isEditing
              ? 'Update this job post without the distraction of the jobs list.'
              : 'Create and manage job posts with the same protected company workflow used across the app.'}
          </p>
        </div>
        <Button onClick={openCreateForm} className="gap-2 self-start md:self-auto">
          <Plus className="h-4 w-4" />
          Post a job
        </Button>
      </div>

      {error ? (
        <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
          <CardContent className="px-5 py-4 text-sm text-red-700 dark:text-red-200" role="alert">{error}</CardContent>
        </Card>
      ) : null}

      {isFormOpen ? (
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>{selectedVacancy ? 'Edit job post' : 'Create a new job post'}</CardTitle>
            <CardDescription>
              Fill the job brief in English. The top-level vacancy fields stay compatible with the existing company vacancy API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-8" onSubmit={handleSubmit} noValidate>
              <section className="rounded-[28px] border border-slate-200/80 bg-slate-50/70 p-5 shadow-sm sm:p-6">
                <div className="mb-5 space-y-1">
                  <h2 className="text-lg font-semibold tracking-tight text-slate-950">Role overview</h2>
                  <p className="text-sm text-slate-600">
                    Set the details candidates see first, including title, work mode, status, and headline compensation.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    id="job-title"
                    label="Role title"
                    placeholder="Full Remote Bridge Engineering (Japan x Philippines product development)"
                    value={title}
                    onChange={(value) => {
                      setTitle(value)
                      setFormErrors((current) => ({ ...current, title: undefined }))
                      setError(null)
                    }}
                    description="Use a specific title that helps students quickly understand the role."
                    error={formErrors.title}
                    required
                    className="md:col-span-2"
                  />
                  <FormSelect
                    label="Employment type"
                    value={employmentType}
                    onValueChange={setEmploymentType}
                    options={employmentTypeOptions}
                    description="Choose the main contract model for the opening."
                  />
                  <FormSelect
                    label="Experience level"
                    value={experienceLevel}
                    onValueChange={setExperienceLevel}
                    options={experienceLevelOptions}
                    description="Match the role to the expected seniority."
                  />
                  <FormField
                    id="job-location"
                    label="Work location"
                    placeholder="Full remote (company-designated work location)"
                    value={location}
                    onChange={(value) => {
                      setLocation(value)
                      setFormErrors((current) => ({ ...current, location: undefined }))
                      setError(null)
                    }}
                    description="State the primary work location or the main remote base."
                    error={formErrors.location}
                    required
                  />
                  <FormSelect
                    label="Work style"
                    value={workStyle}
                    onValueChange={setWorkStyle}
                    options={workStyleOptions}
                    description="Show whether the role is onsite, hybrid, or remote."
                  />
                  <FormSelect
                    label="Publishing status"
                    value={status}
                    onValueChange={setStatus}
                    options={statusOptions}
                    description="Keep drafts private until the post is ready."
                  />
                  <FormField
                    id="job-min-salary"
                    label="Annual salary minimum (JPY)"
                    placeholder="3780000"
                    value={minSalary}
                    onChange={(value) => {
                      setMinSalary(value)
                      setFormErrors((current) => ({ ...current, minSalary: undefined, maxSalary: undefined }))
                      setError(null)
                    }}
                    inputMode="numeric"
                    description="Numbers only. Leave blank if you do not want to publish a minimum."
                    error={formErrors.minSalary}
                  />
                  <FormField
                    id="job-max-salary"
                    label="Annual salary maximum (JPY)"
                    placeholder="5580000"
                    value={maxSalary}
                    onChange={(value) => {
                      setMaxSalary(value)
                      setFormErrors((current) => ({ ...current, minSalary: undefined, maxSalary: undefined }))
                      setError(null)
                    }}
                    inputMode="numeric"
                    description="Numbers only. Leave blank if you do not want to publish a maximum."
                    error={formErrors.maxSalary}
                  />
                  <ToggleField
                    label="Relocation support"
                    description="Turn this on when the company can assist with relocation."
                    checked={relocationSupport}
                    onCheckedChange={setRelocationSupport}
                    className="md:col-span-2"
                  />
                </div>
              </section>

              {postingDetailSections.map((section) => (
                <section key={section.title} className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold tracking-tight text-slate-950">{section.title}</h2>
                    <p className="text-sm text-slate-600">{section.description}</p>
                  </div>
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {section.fields.map((field) =>
                      field.options ? (
                        <FormSelect
                          key={field.key}
                          label={field.label}
                          placeholder={field.placeholder}
                          value={postingDetails[field.key]}
                          onValueChange={(value) => updatePostingDetail(field.key, value)}
                          options={getSelectOptionsWithCurrentValue(field.options, postingDetails[field.key])}
                          description={field.description}
                          className={field.className}
                        />
                        ) : field.textarea ? (
                          <FormTextarea
                            key={field.key}
                            id={`posting-${field.key}`}
                            label={field.label}
                            placeholder={field.placeholder}
                            value={postingDetails[field.key]}
                            onChange={(value) => updatePostingDetail(field.key, value)}
                            description={field.description}
                            error={field.key === 'responsibilities' ? formErrors.responsibilities : undefined}
                            required={field.key === 'responsibilities'}
                            className={field.className ?? 'md:col-span-2'}
                          />
                        ) : (
                          <FormField
                            key={field.key}
                            id={`posting-${field.key}`}
                            label={field.label}
                            placeholder={field.placeholder}
                            value={postingDetails[field.key]}
                            onChange={(value) => updatePostingDetail(field.key, value)}
                            description={field.description}
                          className={field.className}
                        />
                      ),
                    )}
                  </div>
                </section>
              ))}

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : selectedVacancy ? 'Update job post' : 'Create job post'}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm} disabled={saving}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      {!isEditing ? (
        <>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {data.vacancies.length} job listing{data.vacancies.length === 1 ? '' : 's'}
            </p>
          </div>

          {data.vacancies.length > 0 ? (
            <div className="space-y-4">
              {data.vacancies.map((vacancy) => (
                <Card
                  key={vacancy.vacancy_id}
                  className="rounded-[24px] border border-slate-200/80 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
                >
                  <CardContent className="relative px-4 py-4 sm:px-6 sm:py-5">
                    <div className="absolute right-4 top-4 sm:hidden">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                            aria-label={`More actions for ${vacancy.title}`}
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => openEditForm(vacancy)} className="cursor-pointer">
                            <PencilLine className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(vacancy.vacancy_id)}
                            disabled={saving}
                            variant="destructive"
                            className="cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="flex min-w-0 gap-3 pr-12 sm:gap-4 sm:pr-0">
                        <Avatar size="lg" className="border border-slate-200 bg-white shadow-sm">
                          <AvatarImage src={vacancy.company_profile_image ?? undefined} alt={vacancy.company_name} />
                          <AvatarFallback className="bg-white font-semibold text-slate-700">
                            {getCompanyInitials(vacancy.company_name)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1 space-y-2">
                          <h2 className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">{vacancy.title}</h2>
                          <p className="text-sm font-medium text-slate-700 sm:text-base">
                            {vacancy.company_name} · {vacancy.location}
                          </p>

                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600">
                            <span className="inline-flex items-center gap-2">
                              <Clock3 className="h-4 w-4" />
                              {formatLabel(vacancy.experience_level)}
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <Briefcase className="h-4 w-4" />
                              {formatSalary(vacancy.min_salary, vacancy.max_salary)}
                            </span>
                            <span className="inline-flex items-center gap-2">
                              <Globe2 className="h-4 w-4" />
                              {vacancy.work_style_label}
                            </span>
                          </div>

                          <p className="text-sm text-slate-600">
                            Skills: <span className="text-slate-700">{formatSkillsSummary(vacancy)}</span>
                          </p>
                        </div>
                      </div>

                      <div className="hidden sm:flex sm:flex-row sm:items-start sm:justify-between sm:gap-4 lg:min-w-[140px] lg:flex-col lg:items-end">
                        <div className="text-sm font-medium text-emerald-700">{formatRelativeDate(vacancy.updated_at)}</div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              type="button"
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                              aria-label={`More actions for ${vacancy.title}`}
                            >
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => openEditForm(vacancy)} className="cursor-pointer">
                              <PencilLine className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(vacancy.vacancy_id)}
                              disabled={saving}
                              variant="destructive"
                              className="cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                          <Badge className="border-transparent bg-blue-100 text-blue-700 hover:bg-blue-100">
                            {formatLabel(vacancy.status)}
                          </Badge>
                          {vacancy.relocation_support ? (
                            <Badge variant="outline" className="bg-white">
                              Relocation support
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <p className="mt-4 hidden text-sm text-slate-500 sm:block">
                      {vacancy.created_by_name} is hiring · {formatLabel(vacancy.status)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border border-border bg-muted/10 px-6 py-10 text-center">
              <p className="text-lg font-semibold text-foreground">No jobs yet</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Use <span className="font-medium text-foreground">Post a job</span> to create your first company listing.
              </p>
            </div>
          )}
        </>
      ) : null}
    </div>
  )
}

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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ApiError, apiRequest } from '@/lib/api'

import type { CompanyVacanciesResponse, VacancyPostingDetails, VacancyRecord } from './types'

const emptyVacanciesResponse: CompanyVacanciesResponse = {
  vacancies: [],
  available_skills: [],
}

const employmentTypeOptions = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
]

const experienceLevelOptions = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-level' },
  { value: 'senior', label: 'Senior' },
]

const workStyleOptions = [
  { value: 'onsite', label: 'Onsite' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
]

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

type FormOption = {
  value: string
  label: string
}

const contractRenewalOptions: FormOption[] = [
  { value: 'not_applicable', label: 'Not applicable' },
  { value: 'renewable', label: 'Renewable' },
  { value: 'fixed_term_no_renewal', label: 'Fixed term, no renewal' },
]

const breakTimeOptions: FormOption[] = [
  { value: '45_minutes', label: '45 minutes' },
  { value: '60_minutes', label: '60 minutes' },
  { value: '90_minutes', label: '90 minutes' },
  { value: 'custom', label: 'Custom arrangement' },
]

const compensationTypeOptions: FormOption[] = [
  { value: 'annual_salary', label: 'Annual salary' },
  { value: 'monthly_salary', label: 'Monthly salary' },
  { value: 'hourly_rate', label: 'Hourly rate' },
  { value: 'daily_rate', label: 'Daily rate' },
]

const interviewRoundsOptions: FormOption[] = [
  { value: '1_round', label: '1 round' },
  { value: '2_rounds', label: '2 rounds' },
  { value: '3_rounds', label: '3 rounds' },
  { value: '4_plus_rounds', label: '4+ rounds' },
]

const selectionMethodOptions: FormOption[] = [
  { value: 'interviews_only', label: 'Interviews only' },
  { value: 'document_screening_and_interviews', label: 'Document screening + interviews' },
  { value: 'test_and_interviews', label: 'Test + interviews' },
  { value: 'assignment_and_interviews', label: 'Assignment + interviews' },
]

const locationChangeScopeOptions: FormOption[] = [
  { value: 'no_relocation', label: 'No relocation expected' },
  { value: 'company_defined_sites', label: 'Company-defined work sites' },
  { value: 'domestic_relocation_possible', label: 'Domestic relocation possible' },
  { value: 'global_relocation_possible', label: 'Global relocation possible' },
]

const emptyPostingDetails: VacancyPostingDetails = {
  job_highlights: '',
  responsibilities: '',
  role_change_scope: '',
  required_experience: '',
  preferred_experience: '',
  culture_and_other: '',
  employment_term: '',
  probation_period: '',
  probation_conditions: '',
  contract_renewal: '',
  working_hours: '',
  break_time: '',
  flex_time: '',
  overtime: '',
  compensation_type: '',
  planned_annual_salary: '',
  monthly_salary: '',
  overtime_pay: '',
  interview_rounds: '',
  selection_method: '',
  location_change_scope: '',
  nearest_station: '',
  allowances: '',
  insurance: '',
  notes: '',
}

type PostingDetailField = keyof VacancyPostingDetails

type PostingDetailConfig = {
  key: PostingDetailField
  label: string
  placeholder: string
  description?: string
  textarea?: boolean
  options?: FormOption[]
  className?: string
}

const postingDetailSections: Array<{
  title: string
  description: string
  fields: PostingDetailConfig[]
}> = [
  {
    title: 'Requirements',
    description: 'Capture both must-have and nice-to-have qualifications in English.',
    fields: [
      {
        key: 'required_experience',
        label: 'Required experience and qualifications',
        placeholder:
          'Software engineering experience, business-level English, native/business Japanese, distributed team experience, AI-assisted translation and documentation experience.',
        description: 'List the must-have experience, skills, and compliance expectations.',
        textarea: true,
      },
      {
        key: 'preferred_experience',
        label: 'Preferred experience',
        placeholder:
          '3+ years engineering experience, Philippines work experience, PM/PdM background, technical specification writing.',
        description: 'Show what gives a candidate an edge without blocking strong applicants.',
        textarea: true,
      },
    ],
  },
  {
    title: 'Employment and compensation',
    description: 'Add the contract, work schedule, and salary information.',
    fields: [
      {
        key: 'employment_term',
        label: 'Employment term',
        placeholder: 'No fixed term.',
        description: 'Clarify whether this role is permanent, fixed-term, or project-based.',
      },
      {
        key: 'probation_period',
        label: 'Probation period',
        placeholder: '3 months.',
        description: 'Keep the timeline short and easy to scan.',
      },
      {
        key: 'probation_conditions',
        label: 'Probation conditions',
        placeholder: 'No special conditions.',
        description: 'Mention if salary, role scope, or benefits differ during probation.',
      },
      {
        key: 'contract_renewal',
        label: 'Contract renewal',
        placeholder: 'Select a contract renewal policy',
        description: 'Use a predefined option so the terms stay consistent.',
        options: contractRenewalOptions,
      },
      {
        key: 'working_hours',
        label: 'Working hours',
        placeholder: '9:00-18:00',
        description: 'Use the expected daily schedule or core hours.',
      },
      {
        key: 'break_time',
        label: 'Break time',
        placeholder: 'Select a break arrangement',
        description: 'Choose the standard break duration for this role.',
        options: breakTimeOptions,
      },
      {
        key: 'flex_time',
        label: 'Flex time',
        placeholder: 'Available, core time 11:00-17:00, flexible time 8:00-11:00 / 17:00-22:00.',
        description: 'Describe the flex policy only if the team offers one.',
        textarea: true,
      },
      {
        key: 'overtime',
        label: 'Overtime',
        placeholder: 'Overtime available.',
        description: 'Add the general expectation or recent average.',
      },
      {
        key: 'compensation_type',
        label: 'Compensation type',
        placeholder: 'Select the pay structure',
        description: 'Standardize the primary pay model.',
        options: compensationTypeOptions,
      },
      {
        key: 'planned_annual_salary',
        label: 'Planned annual salary',
        placeholder: 'JPY 3.78M - JPY 5.58M',
        description: 'Use a simple range if the exact package varies.',
      },
      {
        key: 'monthly_salary',
        label: 'Monthly salary',
        placeholder: 'JPY 310k - JPY 460k',
        description: 'Optional when you want to mirror the annual range in monthly terms.',
      },
      {
        key: 'overtime_pay',
        label: 'Overtime pay',
        placeholder: 'Included or paid separately.',
        description: 'Clarify whether overtime is included, capped, or paid separately.',
      },
    ],
  },
  {
    title: 'Hiring flow and location',
    description: 'Keep the recruitment and location details explicit.',
    fields: [
      {
        key: 'interview_rounds',
        label: 'Interview rounds',
        placeholder: 'Select the interview count',
        description: 'Pick the usual hiring loop for this role.',
        options: interviewRoundsOptions,
      },
      {
        key: 'selection_method',
        label: 'Selection method',
        placeholder: 'Select the selection method',
        description: 'Keep the hiring flow consistent and easy to compare.',
        options: selectionMethodOptions,
      },
      {
        key: 'location_change_scope',
        label: 'Scope of work location changes',
        placeholder: 'Select the relocation scope',
        description: 'Tell candidates whether relocation could happen later.',
        options: locationChangeScopeOptions,
      },
      {
        key: 'nearest_station',
        label: 'Nearest station',
        placeholder: 'Shibuya',
        description: 'Useful when the role is not fully remote.',
      },
      {
        key: 'allowances',
        label: 'Allowances',
        placeholder: 'Commuting allowance.',
        description: 'Mention commuting, remote setup, visa, or language support if relevant.',
      },
      {
        key: 'insurance',
        label: 'Insurance',
        placeholder: 'Health insurance, pension, employment insurance, workers compensation.',
        description: 'List the coverage candidates should expect from day one.',
        textarea: true,
      },
      {
        key: 'notes',
        label: 'Notes',
        placeholder: 'Shibuya office or remote. Full remote available.',
        description: 'Use this for short operational notes that do not fit elsewhere.',
        textarea: true,
      },
    ],
  },
]

function formatSalary(minSalary: number | null, maxSalary: number | null) {
  if (minSalary === null && maxSalary === null) {
    return 'Salary shared after screening'
  }

  const formatter = new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 0,
  })

  if (minSalary !== null && maxSalary !== null) {
    return `${formatter.format(minSalary)} - ${formatter.format(maxSalary)} JPY`
  }

  if (minSalary !== null) {
    return `From ${formatter.format(minSalary)} JPY`
  }

  return `Up to ${formatter.format(maxSalary ?? 0)} JPY`
}

function formatLabel(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function getCompanyInitials(companyName: string) {
  return companyName
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatRelativeDate(value: string) {
  const now = new Date()
  const date = new Date(value)
  const diffInHours = Math.max(1, Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60)))

  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.round(diffInHours / 24)
  return `${diffInDays}d ago`
}

function formatSkillsSummary(vacancy: VacancyRecord) {
  return vacancy.skill_requirements.map((requirement) => requirement.skill_name).join(', ')
}

function normalizePostingDetails(details?: VacancyPostingDetails | null): VacancyPostingDetails {
  return {
    ...emptyPostingDetails,
    ...details,
  }
}

function getSelectOptionsWithCurrentValue(options: FormOption[], value: string) {
  if (!value || options.some((option) => option.value === value)) {
    return options
  }

  return [{ value, label: `Current value: ${value}` }, ...options]
}

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

  const selectedVacancy = useMemo(
    () => data.vacancies.find((vacancy) => vacancy.vacancy_id === selectedVacancyId) ?? null,
    [data.vacancies, selectedVacancyId],
  )
  const isEditing = isFormOpen && selectedVacancy !== null

  useEffect(() => {
    let active = true

    async function loadVacancies() {
      try {
        const response = await apiRequest<CompanyVacanciesResponse>('/company/vacancies')
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
  }, [selectedVacancy])

  async function refreshVacancies() {
    const response = await apiRequest<CompanyVacanciesResponse>('/company/vacancies')
    setData(response)
  }

  function openCreateForm() {
    setSelectedVacancyId(null)
    setIsFormOpen(true)
    setError(null)
  }

  function openEditForm(vacancy: VacancyRecord) {
    setSelectedVacancyId(vacancy.vacancy_id)
    setIsFormOpen(true)
    setError(null)
  }

  function closeForm() {
    setSelectedVacancyId(null)
    setIsFormOpen(false)
    setError(null)
  }

  function updatePostingDetail(key: PostingDetailField, value: string) {
    setPostingDetails((current) => ({
      ...current,
      [key]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
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
        await apiRequest<VacancyRecord>(`/company/vacancies/${selectedVacancy.vacancy_id}`, {
          method: 'PUT',
          body,
          csrfToken,
        })
        toast.success('Job post updated successfully.')
      } else {
        await apiRequest<VacancyRecord>('/company/vacancies', {
          method: 'POST',
          body,
          csrfToken,
        })
        toast.success('Job post created successfully.')
      }

      await refreshVacancies()
      closeForm()
    } catch (saveError) {
      toast.error(saveError instanceof ApiError ? saveError.message : 'Unable to save this job post.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(vacancyId: number) {
    setSaving(true)
    setError(null)

    try {
      await apiRequest<VacancyRecord>(`/company/vacancies/${vacancyId}`, {
        method: 'DELETE',
        csrfToken,
      })
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
          <CardContent className="px-5 py-4 text-sm text-red-700 dark:text-red-200">{error}</CardContent>
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
            <form className="space-y-8" onSubmit={handleSubmit}>
              <section className="rounded-[28px] border border-slate-200/80 bg-slate-50/70 p-5 shadow-sm sm:p-6">
                <div className="mb-5 space-y-1">
                  <h2 className="text-lg font-semibold tracking-tight text-slate-950">Role overview</h2>
                  <p className="text-sm text-slate-600">
                    Set the details candidates see first, including title, work mode, status, and headline compensation.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    label="Role title"
                    placeholder="Full Remote Bridge Engineering (Japan x Philippines product development)"
                    value={title}
                    onChange={setTitle}
                    description="Use a specific title that helps students quickly understand the role."
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
                    label="Work location"
                    placeholder="Full remote (company-designated work location)"
                    value={location}
                    onChange={setLocation}
                    description="State the primary work location or the main remote base."
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
                    label="Annual salary minimum (JPY)"
                    placeholder="3780000"
                    value={minSalary}
                    onChange={setMinSalary}
                    inputMode="numeric"
                    description="Numbers only. Leave blank if you do not want to publish a minimum."
                  />
                  <FormField
                    label="Annual salary maximum (JPY)"
                    placeholder="5580000"
                    value={maxSalary}
                    onChange={setMaxSalary}
                    inputMode="numeric"
                    description="Numbers only. Leave blank if you do not want to publish a maximum."
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
                          label={field.label}
                          placeholder={field.placeholder}
                          value={postingDetails[field.key]}
                          onChange={(value) => updatePostingDetail(field.key, value)}
                          description={field.description}
                          className={field.className ?? 'md:col-span-2'}
                        />
                      ) : (
                        <FormField
                          key={field.key}
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

type FormFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  description?: string
  className?: string
  inputMode?: React.ComponentProps<typeof Input>['inputMode']
}

function FormField({ label, value, onChange, placeholder, description, className, inputMode }: FormFieldProps) {
  return (
    <div className={className ?? ''}>
      <div className="space-y-2.5">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-900">{label}</p>
          {description ? <p className="text-xs leading-5 text-slate-500">{description}</p> : null}
        </div>
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          className="h-11 rounded-xl border-slate-200 bg-white shadow-sm"
        />
      </div>
    </div>
  )
}

type FormTextareaProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  description?: string
  className?: string
}

function FormTextarea({ label, value, onChange, placeholder, description, className }: FormTextareaProps) {
  return (
    <div className={className ?? ''}>
      <div className="space-y-2.5">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-900">{label}</p>
          {description ? <p className="text-xs leading-5 text-slate-500">{description}</p> : null}
        </div>
        <Textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="min-h-28 rounded-2xl border-slate-200 bg-white shadow-sm"
        />
      </div>
    </div>
  )
}

type FormSelectProps = {
  label: string
  value: string
  onValueChange: (value: string) => void
  options: FormOption[]
  placeholder?: string
  description?: string
  className?: string
}

function FormSelect({ label, value, onValueChange, options, placeholder, description, className }: FormSelectProps) {
  return (
    <div className={className ?? ''}>
      <div className="space-y-2.5">
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-900">{label}</p>
          {description ? <p className="text-xs leading-5 text-slate-500">{description}</p> : null}
        </div>
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="h-11 w-full rounded-xl border-slate-200 bg-white shadow-sm">
            <SelectValue placeholder={placeholder ?? label} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

type ToggleFieldProps = {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
}

function ToggleField({ label, description, checked, onCheckedChange, className }: ToggleFieldProps) {
  return (
    <div className={className ?? ''}>
      <label className="flex min-h-full cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-input"
          checked={checked}
          onChange={(event) => onCheckedChange(event.target.checked)}
        />
        <span className="space-y-1">
          <span className="block text-sm font-medium text-slate-900">{label}</span>
          <span className="block text-sm text-slate-500">{description}</span>
        </span>
      </label>
    </div>
  )
}

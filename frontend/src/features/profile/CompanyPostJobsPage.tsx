import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ChevronRight, PencilLine, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useAuth } from '@/auth/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

const postingDetailSections: Array<{
  title: string
  description: string
  fields: Array<{
    key: PostingDetailField
    label: string
    placeholder: string
    textarea?: boolean
  }>
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
        textarea: true,
      },
      {
        key: 'preferred_experience',
        label: 'Preferred experience',
        placeholder:
          '3+ years engineering experience, Philippines work experience, PM/PdM background, technical specification writing.',
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
      },
      {
        key: 'probation_period',
        label: 'Probation period',
        placeholder: '3 months.',
      },
      {
        key: 'probation_conditions',
        label: 'Probation conditions',
        placeholder: 'No special conditions.',
      },
      {
        key: 'contract_renewal',
        label: 'Contract renewal',
        placeholder: 'Not applicable.',
      },
      {
        key: 'working_hours',
        label: 'Working hours',
        placeholder: '9:00-18:00',
      },
      {
        key: 'break_time',
        label: 'Break time',
        placeholder: '60 minutes',
      },
      {
        key: 'flex_time',
        label: 'Flex time',
        placeholder: 'Available, core time 11:00-17:00, flexible time 8:00-11:00 / 17:00-22:00.',
        textarea: true,
      },
      {
        key: 'overtime',
        label: 'Overtime',
        placeholder: 'Overtime available.',
      },
      {
        key: 'compensation_type',
        label: 'Compensation type',
        placeholder: 'Monthly salary system.',
      },
      {
        key: 'planned_annual_salary',
        label: 'Planned annual salary',
        placeholder: 'JPY 3.78M - JPY 5.58M',
      },
      {
        key: 'monthly_salary',
        label: 'Monthly salary',
        placeholder: 'JPY 310k - JPY 460k',
      },
      {
        key: 'overtime_pay',
        label: 'Overtime pay',
        placeholder: 'Included or paid separately.',
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
        placeholder: '3 rounds',
      },
      {
        key: 'selection_method',
        label: 'Selection method',
        placeholder: '2-3 interviews.',
      },
      {
        key: 'location_change_scope',
        label: 'Scope of work location changes',
        placeholder: 'Work locations defined by the company.',
      },
      {
        key: 'nearest_station',
        label: 'Nearest station',
        placeholder: 'Shibuya',
      },
      {
        key: 'allowances',
        label: 'Allowances',
        placeholder: 'Commuting allowance.',
      },
      {
        key: 'insurance',
        label: 'Insurance',
        placeholder: 'Health insurance, pension, employment insurance, workers compensation.',
        textarea: true,
      },
      {
        key: 'notes',
        label: 'Notes',
        placeholder: 'Shibuya office or remote. Full remote available.',
        textarea: true,
      },
    ],
  },
]

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function normalizePostingDetails(details?: VacancyPostingDetails | null): VacancyPostingDetails {
  return {
    ...emptyPostingDetails,
    ...details,
  }
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
  const [success, setSuccess] = useState<string | null>(null)

  const selectedVacancy = useMemo(
    () => data.vacancies.find((vacancy) => vacancy.vacancy_id === selectedVacancyId) ?? null,
    [data.vacancies, selectedVacancyId],
  )

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
    setSuccess(null)
  }

  function openEditForm(vacancy: VacancyRecord) {
    setSelectedVacancyId(vacancy.vacancy_id)
    setIsFormOpen(true)
    setError(null)
    setSuccess(null)
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
    setSuccess(null)

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
        setSuccess('Job post updated successfully.')
      } else {
        await apiRequest<VacancyRecord>('/company/vacancies', {
          method: 'POST',
          body,
          csrfToken,
        })
        setSuccess('Job post created successfully.')
      }

      await refreshVacancies()
      closeForm()
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to save this job post.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(vacancyId: number) {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await apiRequest<VacancyRecord>(`/company/vacancies/${vacancyId}`, {
        method: 'DELETE',
        csrfToken,
      })
      await refreshVacancies()
      if (selectedVacancyId === vacancyId) {
        closeForm()
      }
      setSuccess('Job post retired successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to retire this job post.')
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
        <span className="font-medium text-foreground">Post Jobs</span>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Company hiring</p>
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Post Jobs</h1>
          <p className="max-w-2xl text-base text-muted-foreground">
            Create and manage job posts with the same protected company workflow used across the app.
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
      {success ? (
        <Card className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CardContent className="px-5 py-4 text-sm text-green-700 dark:text-green-200">{success}</CardContent>
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
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  label="Role title"
                  placeholder="Full Remote Bridge Engineering (Japan x Philippines product development)"
                  value={title}
                  onChange={setTitle}
                />
                <FormSelect
                  label="Employment type"
                  value={employmentType}
                  onValueChange={setEmploymentType}
                  options={employmentTypeOptions}
                />
                <FormSelect
                  label="Experience level"
                  value={experienceLevel}
                  onValueChange={setExperienceLevel}
                  options={experienceLevelOptions}
                />
                <FormField
                  label="Work location"
                  placeholder="Full remote (company-designated work location)"
                  value={location}
                  onChange={setLocation}
                />
                <FormSelect
                  label="Work style"
                  value={workStyle}
                  onValueChange={setWorkStyle}
                  options={workStyleOptions}
                />
                <FormSelect
                  label="Publishing status"
                  value={status}
                  onValueChange={setStatus}
                  options={statusOptions}
                />
                <FormField
                  label="Annual salary minimum (JPY)"
                  placeholder="3780000"
                  value={minSalary}
                  onChange={setMinSalary}
                  inputMode="numeric"
                />
                <FormField
                  label="Annual salary maximum (JPY)"
                  placeholder="5580000"
                  value={maxSalary}
                  onChange={setMaxSalary}
                  inputMode="numeric"
                />
                <ToggleField
                  label="Relocation support"
                  description="Mark this on if the company supports relocation."
                  checked={relocationSupport}
                  onCheckedChange={setRelocationSupport}
                />
              </div>

              {postingDetailSections.map((section) => (
                <div key={section.title} className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold tracking-tight">{section.title}</h2>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {section.fields.map((field) =>
                      field.textarea ? (
                        <FormTextarea
                          key={field.key}
                          label={field.label}
                          placeholder={field.placeholder}
                          value={postingDetails[field.key]}
                          onChange={(value) => updatePostingDetail(field.key, value)}
                          className="md:col-span-2"
                        />
                      ) : (
                        <FormField
                          key={field.key}
                          label={field.label}
                          placeholder={field.placeholder}
                          value={postingDetails[field.key]}
                          onChange={(value) => updatePostingDetail(field.key, value)}
                        />
                      ),
                    )}
                  </div>
                </div>
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <Card>
          <CardHeader className="space-y-2">
            <CardTitle>Existing job posts</CardTitle>
            <CardDescription>Edit active drafts and retire roles you no longer want to show.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.vacancies.length === 0 ? (
              <div className="rounded-xl border border-dashed px-5 py-10 text-center text-sm text-muted-foreground">
                No job posts yet. Use <span className="font-medium text-foreground">Post a job</span> to create the first one.
              </div>
            ) : (
              data.vacancies.map((vacancy) => (
                <div
                  key={vacancy.vacancy_id}
                  className="flex flex-col gap-4 rounded-xl border px-4 py-4 md:flex-row md:items-start md:justify-between"
                >
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold tracking-tight">{vacancy.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {vacancy.location} · {vacancy.work_style_label} · {vacancy.status.replace('_', ' ')}
                      </p>
                    </div>
                    <p className="line-clamp-2 max-w-2xl text-sm text-muted-foreground">
                      {vacancy.posting_details.responsibilities || vacancy.description}
                    </p>
                    <p className="text-xs text-muted-foreground">Updated {formatDate(vacancy.updated_at)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => openEditForm(vacancy)}>
                      <PencilLine className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(vacancy.vacancy_id)}
                      disabled={saving}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Retire
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

type FormFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  inputMode?: React.ComponentProps<typeof Input>['inputMode']
}

function FormField({ label, value, onChange, placeholder, className, inputMode }: FormFieldProps) {
  return (
    <div className={className ?? ''}>
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} inputMode={inputMode} />
      </div>
    </div>
  )
}

type FormTextareaProps = {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

function FormTextarea({ label, value, onChange, placeholder, className }: FormTextareaProps) {
  return (
    <div className={className ?? ''}>
      <div className="space-y-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <Textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="min-h-28" />
      </div>
    </div>
  )
}

type FormSelectProps = {
  label: string
  value: string
  onValueChange: (value: string) => void
  options: Array<{ value: string; label: string }>
}

function FormSelect({ label, value, onValueChange, options }: FormSelectProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-foreground">{label}</p>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={label} />
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
  )
}

type ToggleFieldProps = {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

function ToggleField({ label, description, checked, onCheckedChange }: ToggleFieldProps) {
  return (
    <label className="flex min-h-full cursor-pointer items-start gap-3 rounded-xl border px-4 py-3">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-input"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
      />
      <span className="space-y-1">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        <span className="block text-sm text-muted-foreground">{description}</span>
      </span>
    </label>
  )
}

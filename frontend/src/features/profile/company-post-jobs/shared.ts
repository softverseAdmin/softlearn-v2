import type { CompanyVacanciesResponse, VacancyPostingDetails, VacancyRecord } from '../types'

export const emptyVacanciesResponse: CompanyVacanciesResponse = {
  vacancies: [],
  available_skills: [],
}

export const employmentTypeOptions = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
]

export const experienceLevelOptions = [
  { value: 'junior', label: 'Junior' },
  { value: 'mid', label: 'Mid-level' },
  { value: 'senior', label: 'Senior' },
]

export const workStyleOptions = [
  { value: 'onsite', label: 'Onsite' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'remote', label: 'Remote' },
]

export const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export type FormOption = {
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

export const emptyPostingDetails: VacancyPostingDetails = {
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

export type PostingDetailField = keyof VacancyPostingDetails

export type PostingDetailConfig = {
  key: PostingDetailField
  label: string
  placeholder: string
  description?: string
  textarea?: boolean
  options?: FormOption[]
  className?: string
}

export const postingDetailSections: Array<{
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

export function formatSalary(minSalary: number | null, maxSalary: number | null) {
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

export function formatLabel(value: string) {
  return value
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export function getCompanyInitials(companyName: string) {
  return companyName
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function formatRelativeDate(value: string) {
  const now = new Date()
  const date = new Date(value)
  const diffInHours = Math.max(1, Math.round((now.getTime() - date.getTime()) / (1000 * 60 * 60)))

  if (diffInHours < 24) {
    return `${diffInHours}h ago`
  }

  const diffInDays = Math.round(diffInHours / 24)
  return `${diffInDays}d ago`
}

export function formatSkillsSummary(vacancy: VacancyRecord) {
  return vacancy.skill_requirements.map((requirement) => requirement.skill_name).join(', ')
}

export function normalizePostingDetails(details?: VacancyPostingDetails | null): VacancyPostingDetails {
  return {
    ...emptyPostingDetails,
    ...details,
  }
}

export function getSelectOptionsWithCurrentValue(options: FormOption[], value: string) {
  if (!value || options.some((option) => option.value === value)) {
    return options
  }

  return [{ value, label: `Current value: ${value}` }, ...options]
}

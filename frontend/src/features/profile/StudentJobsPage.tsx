import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Bookmark,
  BookmarkCheck,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Globe2,
  MoreVertical,
  Search,
  SlidersHorizontal,
} from 'lucide-react'

import type { StudentJobsResponse, VacancyLanguageRequirement, VacancyRecord, VacancySkillRequirement } from './types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

function buildSkillRequirement(
  id: number,
  skillId: number,
  skillName: string,
  skillSlug: string,
  requirementType = 'preferred'
): VacancySkillRequirement {
  return {
    id,
    skill_id: skillId,
    skill_name: skillName,
    skill_slug: skillSlug,
    requirement_type: requirementType,
  }
}

function buildLanguageRequirement(
  id: number,
  language: string,
  languageLabel: string,
  minimumLevel: string,
  minimumLevelLabel: string,
  requirementType = 'required'
): VacancyLanguageRequirement {
  return {
    id,
    language,
    language_label: languageLabel,
    minimum_level: minimumLevel,
    minimum_level_label: minimumLevelLabel,
    requirement_type: requirementType,
  }
}

const mockJobsResponse: StudentJobsResponse = {
  vacancies: [
    {
      vacancy_id: 101,
      company_id: 1,
      company_name: 'LinkedBridge Labs',
      title: 'Frontend Engineer Intern',
      description:
        'Join a product squad building student-facing career tools. You will collaborate on polished React screens, reusable UI components, and accessibility-focused interactions.',
      employment_type: 'Internship',
      experience_level: 'Entry level',
      location: 'Tokyo',
      work_style: 'hybrid',
      work_style_label: 'Hybrid',
      relocation_support: false,
      min_salary: 180000,
      max_salary: 240000,
      skill_requirements: [
        buildSkillRequirement(1, 1, 'React', 'react', 'required'),
        buildSkillRequirement(2, 2, 'TypeScript', 'typescript', 'required'),
        buildSkillRequirement(3, 3, 'Tailwind CSS', 'tailwind-css'),
      ],
      language_requirements: [
        buildLanguageRequirement(1, 'english', 'English', 'b2', 'B2'),
        buildLanguageRequirement(2, 'japanese', 'Japanese', 'n3', 'JLPT N3', 'preferred'),
      ],
      is_bookmarked: true,
      status: 'open',
      created_by_name: 'Recruiting Team',
      created_at: '2026-05-08T10:00:00Z',
      updated_at: '2026-05-13T09:15:00Z',
    },
    {
      vacancy_id: 102,
      company_id: 2,
      company_name: 'Northstar Commerce',
      title: 'UI/UX Product Design Trainee',
      description:
        'Support the growth team with high-converting landing pages, design system updates, and rapid prototype work for marketplace experiences.',
      employment_type: 'Full-time',
      experience_level: 'Junior',
      location: 'Osaka',
      work_style: 'remote',
      work_style_label: 'Remote',
      relocation_support: true,
      min_salary: 260000,
      max_salary: 340000,
      skill_requirements: [
        buildSkillRequirement(4, 4, 'Figma', 'figma', 'required'),
        buildSkillRequirement(5, 5, 'Product Design', 'product-design', 'required'),
        buildSkillRequirement(6, 6, 'Design Systems', 'design-systems'),
      ],
      language_requirements: [buildLanguageRequirement(3, 'english', 'English', 'c1', 'C1')],
      is_bookmarked: false,
      status: 'open',
      created_by_name: 'Hiring Manager',
      created_at: '2026-05-09T08:30:00Z',
      updated_at: '2026-05-12T07:45:00Z',
    },
    {
      vacancy_id: 103,
      company_id: 3,
      company_name: 'Apex Data Works',
      title: 'Backend Developer Associate',
      description:
        'Help build scalable APIs for learning analytics and hiring workflows. You will work across Django services, relational data models, and secure integrations.',
      employment_type: 'Full-time',
      experience_level: 'Associate',
      location: 'Yokohama',
      work_style: 'onsite',
      work_style_label: 'On-site',
      relocation_support: false,
      min_salary: 320000,
      max_salary: 420000,
      skill_requirements: [
        buildSkillRequirement(7, 7, 'Python', 'python', 'required'),
        buildSkillRequirement(8, 8, 'Django', 'django', 'required'),
        buildSkillRequirement(9, 9, 'PostgreSQL', 'postgresql'),
      ],
      language_requirements: [
        buildLanguageRequirement(4, 'japanese', 'Japanese', 'n2', 'JLPT N2'),
        buildLanguageRequirement(5, 'english', 'English', 'b2', 'B2', 'preferred'),
      ],
      is_bookmarked: true,
      status: 'open',
      created_by_name: 'Platform Lead',
      created_at: '2026-05-07T12:00:00Z',
      updated_at: '2026-05-11T11:10:00Z',
    },
    {
      vacancy_id: 104,
      company_id: 4,
      company_name: 'BrightPath AI',
      title: 'AI Product Operations Intern',
      description:
        'Coordinate annotation workflows, improve AI feature QA, and support explainable matching operations with crisp stakeholder communication.',
      employment_type: 'Internship',
      experience_level: 'Entry level',
      location: 'Tokyo',
      work_style: 'hybrid',
      work_style_label: 'Hybrid',
      relocation_support: false,
      min_salary: 170000,
      max_salary: 220000,
      skill_requirements: [
        buildSkillRequirement(10, 10, 'SQL', 'sql', 'required'),
        buildSkillRequirement(11, 11, 'Operations', 'operations'),
        buildSkillRequirement(12, 12, 'Documentation', 'documentation'),
      ],
      language_requirements: [buildLanguageRequirement(6, 'english', 'English', 'b2', 'B2')],
      is_bookmarked: false,
      status: 'open',
      created_by_name: 'Talent Partner',
      created_at: '2026-05-06T09:30:00Z',
      updated_at: '2026-05-10T13:50:00Z',
    },
    {
      vacancy_id: 105,
      company_id: 5,
      company_name: 'Orbit Fintech',
      title: 'Data Analyst Graduate Role',
      description:
        'Work with finance and product teams to turn operational data into dashboards, decision-ready insights, and weekly reporting narratives.',
      employment_type: 'Full-time',
      experience_level: 'Graduate',
      location: 'Kyoto',
      work_style: 'remote',
      work_style_label: 'Remote',
      relocation_support: true,
      min_salary: 300000,
      max_salary: 390000,
      skill_requirements: [
        buildSkillRequirement(13, 13, 'Excel', 'excel', 'required'),
        buildSkillRequirement(14, 10, 'SQL', 'sql', 'required'),
        buildSkillRequirement(15, 14, 'Data Analysis', 'data-analysis'),
      ],
      language_requirements: [
        buildLanguageRequirement(7, 'english', 'English', 'b2', 'B2'),
        buildLanguageRequirement(8, 'japanese', 'Japanese', 'n3', 'JLPT N3', 'preferred'),
      ],
      is_bookmarked: false,
      status: 'open',
      created_by_name: 'Finance Operations',
      created_at: '2026-05-05T05:00:00Z',
      updated_at: '2026-05-09T16:20:00Z',
    },
    {
      vacancy_id: 106,
      company_id: 6,
      company_name: 'CloudNest Systems',
      title: 'Junior Full Stack Developer',
      description:
        'Build internal dashboards and customer-facing workflows with React, Django, and shared design patterns.',
      employment_type: 'Full-time',
      experience_level: 'Junior',
      location: 'Tokyo',
      work_style: 'hybrid',
      work_style_label: 'Hybrid',
      relocation_support: false,
      min_salary: 280000,
      max_salary: 360000,
      skill_requirements: [
        buildSkillRequirement(16, 1, 'React', 'react', 'required'),
        buildSkillRequirement(17, 8, 'Django', 'django', 'required'),
        buildSkillRequirement(18, 2, 'TypeScript', 'typescript'),
      ],
      language_requirements: [buildLanguageRequirement(9, 'english', 'English', 'b2', 'B2')],
      is_bookmarked: false,
      status: 'open',
      created_by_name: 'Engineering Manager',
      created_at: '2026-05-08T04:00:00Z',
      updated_at: '2026-05-13T05:30:00Z',
    },
    {
      vacancy_id: 107,
      company_id: 7,
      company_name: 'PixelForge Studio',
      title: 'Visual Designer',
      description:
        'Create marketing assets, product illustrations, and polished interface visuals across web and mobile.',
      employment_type: 'Full-time',
      experience_level: 'Associate',
      location: 'Osaka',
      work_style: 'remote',
      work_style_label: 'Remote',
      relocation_support: false,
      min_salary: 240000,
      max_salary: 320000,
      skill_requirements: [
        buildSkillRequirement(19, 4, 'Figma', 'figma', 'required'),
        buildSkillRequirement(20, 5, 'Product Design', 'product-design'),
        buildSkillRequirement(21, 6, 'Design Systems', 'design-systems'),
      ],
      language_requirements: [buildLanguageRequirement(10, 'english', 'English', 'b2', 'B2')],
      is_bookmarked: true,
      status: 'open',
      created_by_name: 'Creative Lead',
      created_at: '2026-05-07T08:00:00Z',
      updated_at: '2026-05-12T15:00:00Z',
    },
    {
      vacancy_id: 108,
      company_id: 8,
      company_name: 'Nexa Retail',
      title: 'Business Analyst Trainee',
      description:
        'Support retail planning, document requirements, and turn operational reporting into product backlog insights.',
      employment_type: 'Internship',
      experience_level: 'Entry level',
      location: 'Kyoto',
      work_style: 'onsite',
      work_style_label: 'On-site',
      relocation_support: false,
      min_salary: 160000,
      max_salary: 210000,
      skill_requirements: [
        buildSkillRequirement(22, 13, 'Excel', 'excel', 'required'),
        buildSkillRequirement(23, 14, 'Data Analysis', 'data-analysis'),
        buildSkillRequirement(24, 12, 'Documentation', 'documentation'),
      ],
      language_requirements: [buildLanguageRequirement(11, 'japanese', 'Japanese', 'n2', 'JLPT N2')],
      is_bookmarked: false,
      status: 'open',
      created_by_name: 'Business Team',
      created_at: '2026-05-04T11:00:00Z',
      updated_at: '2026-05-11T02:15:00Z',
    },
    {
      vacancy_id: 109,
      company_id: 9,
      company_name: 'DataPulse Health',
      title: 'Data Engineer Associate',
      description:
        'Work on warehouse pipelines, reporting models, and analytics infrastructure for healthcare operations.',
      employment_type: 'Full-time',
      experience_level: 'Associate',
      location: 'Yokohama',
      work_style: 'hybrid',
      work_style_label: 'Hybrid',
      relocation_support: true,
      min_salary: 340000,
      max_salary: 450000,
      skill_requirements: [
        buildSkillRequirement(25, 10, 'SQL', 'sql', 'required'),
        buildSkillRequirement(26, 7, 'Python', 'python', 'required'),
        buildSkillRequirement(27, 9, 'PostgreSQL', 'postgresql'),
      ],
      language_requirements: [
        buildLanguageRequirement(12, 'english', 'English', 'b2', 'B2'),
        buildLanguageRequirement(13, 'japanese', 'Japanese', 'n3', 'JLPT N3', 'preferred'),
      ],
      is_bookmarked: false,
      status: 'open',
      created_by_name: 'Platform Operations',
      created_at: '2026-05-03T14:20:00Z',
      updated_at: '2026-05-10T06:10:00Z',
    },
    {
      vacancy_id: 110,
      company_id: 10,
      company_name: 'LaunchLoop',
      title: 'Product Marketing Coordinator',
      description:
        'Help launch new product stories, manage campaign execution, and coordinate cross-functional release content.',
      employment_type: 'Full-time',
      experience_level: 'Graduate',
      location: 'Tokyo',
      work_style: 'remote',
      work_style_label: 'Remote',
      relocation_support: false,
      min_salary: 250000,
      max_salary: 310000,
      skill_requirements: [
        buildSkillRequirement(28, 12, 'Documentation', 'documentation', 'required'),
        buildSkillRequirement(29, 11, 'Operations', 'operations'),
        buildSkillRequirement(30, 14, 'Data Analysis', 'data-analysis'),
      ],
      language_requirements: [buildLanguageRequirement(14, 'english', 'English', 'c1', 'C1')],
      is_bookmarked: false,
      status: 'open',
      created_by_name: 'Marketing Director',
      created_at: '2026-05-02T06:45:00Z',
      updated_at: '2026-05-08T18:30:00Z',
    },
    {
      vacancy_id: 111,
      company_id: 11,
      company_name: 'SecureStack',
      title: 'Junior QA Engineer',
      description:
        'Validate release quality, automate regression checks, and document bug reports for secure enterprise products.',
      employment_type: 'Full-time',
      experience_level: 'Junior',
      location: 'Osaka',
      work_style: 'hybrid',
      work_style_label: 'Hybrid',
      relocation_support: false,
      min_salary: 230000,
      max_salary: 300000,
      skill_requirements: [
        buildSkillRequirement(31, 2, 'TypeScript', 'typescript'),
        buildSkillRequirement(32, 12, 'Documentation', 'documentation', 'required'),
        buildSkillRequirement(33, 11, 'Operations', 'operations'),
      ],
      language_requirements: [buildLanguageRequirement(15, 'english', 'English', 'b2', 'B2')],
      is_bookmarked: true,
      status: 'open',
      created_by_name: 'QA Lead',
      created_at: '2026-05-01T10:15:00Z',
      updated_at: '2026-05-07T12:40:00Z',
    },
    {
      vacancy_id: 112,
      company_id: 12,
      company_name: 'GreenGrid Energy',
      title: 'Software Engineer Graduate Program',
      description:
        'Rotate through platform, frontend, and data teams while building production-ready features and dashboards.',
      employment_type: 'Full-time',
      experience_level: 'Graduate',
      location: 'Kyoto',
      work_style: 'onsite',
      work_style_label: 'On-site',
      relocation_support: true,
      min_salary: 290000,
      max_salary: 370000,
      skill_requirements: [
        buildSkillRequirement(34, 7, 'Python', 'python', 'required'),
        buildSkillRequirement(35, 1, 'React', 'react'),
        buildSkillRequirement(36, 10, 'SQL', 'sql'),
      ],
      language_requirements: [
        buildLanguageRequirement(16, 'english', 'English', 'b2', 'B2'),
        buildLanguageRequirement(17, 'japanese', 'Japanese', 'n2', 'JLPT N2'),
      ],
      is_bookmarked: false,
      status: 'open',
      created_by_name: 'University Programs',
      created_at: '2026-04-30T07:20:00Z',
      updated_at: '2026-05-06T09:05:00Z',
    },
    ...Array.from({ length: 18 }, (_, index) => {
      const vacancyId = 113 + index
      const companyId = 13 + index
      const locations = ['Tokyo', 'Osaka', 'Yokohama', 'Kyoto']
      const workStyles = [
        { value: 'hybrid', label: 'Hybrid' },
        { value: 'remote', label: 'Remote' },
        { value: 'onsite', label: 'On-site' },
      ] as const
      const titles = [
        'Frontend Developer',
        'Operations Analyst',
        'Product Designer',
        'Backend Engineer',
        'Data Analyst',
        'QA Engineer',
      ] as const
      const companyPrefixes = ['Nova', 'Blue', 'Peak', 'Urban', 'Clear', 'Bright'] as const
      const companySuffixes = ['Labs', 'Systems', 'Works', 'Studio', 'Tech', 'Cloud'] as const
      const workStyle = workStyles[index % workStyles.length]
      const location = locations[index % locations.length]
      const title = `${titles[index % titles.length]} ${index + 1}`
      const companyName = `${companyPrefixes[index % companyPrefixes.length]}${companySuffixes[index % companySuffixes.length]}`

      return {
        vacancy_id: vacancyId,
        company_id: companyId,
        company_name: companyName,
        title,
        description: `Mock UI vacancy ${index + 1} for pagination preview and jobs list styling.`,
        employment_type: index % 3 === 0 ? 'Internship' : 'Full-time',
        experience_level: index % 4 === 0 ? 'Entry level' : index % 4 === 1 ? 'Junior' : index % 4 === 2 ? 'Associate' : 'Graduate',
        location,
        work_style: workStyle.value,
        work_style_label: workStyle.label,
        relocation_support: index % 5 === 0,
        min_salary: 180000 + index * 10000,
        max_salary: 260000 + index * 12000,
        skill_requirements: [
          buildSkillRequirement(37 + index * 3, 1 + (index % 5), ['React', 'TypeScript', 'Python', 'SQL', 'Figma'][index % 5], ['react', 'typescript', 'python', 'sql', 'figma'][index % 5], 'required'),
          buildSkillRequirement(38 + index * 3, 8 + (index % 4), ['Django', 'PostgreSQL', 'Operations', 'Documentation'][index % 4], ['django', 'postgresql', 'operations', 'documentation'][index % 4]),
          buildSkillRequirement(39 + index * 3, 13 + (index % 2), ['Excel', 'Data Analysis'][index % 2], ['excel', 'data-analysis'][index % 2]),
        ],
        language_requirements: [
          buildLanguageRequirement(18 + index * 2, index % 2 === 0 ? 'english' : 'japanese', index % 2 === 0 ? 'English' : 'Japanese', index % 2 === 0 ? 'b2' : 'n3', index % 2 === 0 ? 'B2' : 'JLPT N3'),
          buildLanguageRequirement(19 + index * 2, index % 2 === 0 ? 'japanese' : 'english', index % 2 === 0 ? 'Japanese' : 'English', index % 2 === 0 ? 'n4' : 'b2', index % 2 === 0 ? 'JLPT N4' : 'B2', 'preferred'),
        ],
        is_bookmarked: index % 4 === 0,
        status: 'open',
        created_by_name: `${title} Team`,
        created_at: `2026-04-${String(29 - (index % 20)).padStart(2, '0')}T08:00:00Z`,
        updated_at: `2026-05-${String(5 + (index % 9)).padStart(2, '0')}T09:00:00Z`,
      } satisfies VacancyRecord
    }),
  ],
  query: '',
  filters: {
    skills: [],
    languages: [],
    locations: [],
    work_styles: [],
  },
  result_count: 30,
  bookmark_count: 9,
  available_skills: [
    { id: 1, name: 'React', slug: 'react' },
    { id: 2, name: 'TypeScript', slug: 'typescript' },
    { id: 3, name: 'Tailwind CSS', slug: 'tailwind-css' },
    { id: 4, name: 'Figma', slug: 'figma' },
    { id: 5, name: 'Product Design', slug: 'product-design' },
    { id: 6, name: 'Design Systems', slug: 'design-systems' },
    { id: 7, name: 'Python', slug: 'python' },
    { id: 8, name: 'Django', slug: 'django' },
    { id: 9, name: 'PostgreSQL', slug: 'postgresql' },
    { id: 10, name: 'SQL', slug: 'sql' },
    { id: 11, name: 'Operations', slug: 'operations' },
    { id: 12, name: 'Documentation', slug: 'documentation' },
    { id: 13, name: 'Excel', slug: 'excel' },
    { id: 14, name: 'Data Analysis', slug: 'data-analysis' },
  ],
  available_languages: [
    { value: 'english', label: 'English' },
    { value: 'japanese', label: 'Japanese' },
  ],
  available_locations: ['Tokyo', 'Osaka', 'Yokohama', 'Kyoto'],
  available_work_styles: [
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'onsite', label: 'On-site' },
  ],
}

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

function getCompensationScore(vacancy: VacancyRecord) {
  return vacancy.max_salary ?? vacancy.min_salary ?? 0
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

function getPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 'end-ellipsis', totalPages] as const
  }

  if (currentPage >= totalPages - 2) {
    return [1, 'start-ellipsis', totalPages - 2, totalPages - 1, totalPages] as const
  }

  return [1, 'start-ellipsis', currentPage, 'end-ellipsis', totalPages] as const
}

export function StudentJobsPage() {
  const jobs = mockJobsResponse
  const jobsPerPage = 5
  const [searchQuery, setSearchQuery] = useState('')
  const [skill, setSkill] = useState('All Skills')
  const [language, setLanguage] = useState('All Languages')
  const [location, setLocation] = useState('All Locations')
  const [workStyle, setWorkStyle] = useState('All Work Styles')
  const [sortBy, setSortBy] = useState('Newest')
  const [page, setPage] = useState(1)
  const [savedVacancyIds, setSavedVacancyIds] = useState<number[]>(
    jobs.vacancies.filter((vacancy) => vacancy.is_bookmarked).map((vacancy) => vacancy.vacancy_id)
  )

  const skillOptions = useMemo(
    () => ['All Skills', ...jobs.available_skills.map((option) => option.slug)],
    [jobs.available_skills]
  )

  const quickSkillOptions = useMemo(
    () => ['All Skills', ...jobs.available_skills.slice(0, 8).map((option) => option.slug)],
    [jobs.available_skills]
  )

  const languageOptions = useMemo(
    () => ['All Languages', ...jobs.available_languages.map((option) => option.value)],
    [jobs.available_languages]
  )

  const locationOptions = useMemo(() => ['All Locations', ...jobs.available_locations], [jobs.available_locations])

  const workStyleOptions = useMemo(
    () => ['All Work Styles', ...jobs.available_work_styles.map((option) => option.value)],
    [jobs.available_work_styles]
  )

  const languageLabels = useMemo(
    () => new Map(jobs.available_languages.map((option) => [option.value, option.label])),
    [jobs.available_languages]
  )

  const workStyleLabels = useMemo(
    () => new Map(jobs.available_work_styles.map((option) => [option.value, option.label])),
    [jobs.available_work_styles]
  )

  const displayVacancies = useMemo(
    () =>
      jobs.vacancies.map((vacancy) => ({
        ...vacancy,
        is_bookmarked: savedVacancyIds.includes(vacancy.vacancy_id),
      })),
    [jobs.vacancies, savedVacancyIds]
  )

  const filteredJobs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    const filtered = displayVacancies.filter((vacancy) => {
      const matchesQuery =
        !normalizedQuery ||
        [vacancy.title, vacancy.description, vacancy.company_name, vacancy.location]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      const matchesSkill =
        skill === 'All Skills' || vacancy.skill_requirements.some((requirement) => requirement.skill_slug === skill)

      const matchesLanguage =
        language === 'All Languages' ||
        vacancy.language_requirements.some((requirement) => requirement.language === language)

      const matchesLocation = location === 'All Locations' || vacancy.location === location
      const matchesWorkStyle = workStyle === 'All Work Styles' || vacancy.work_style === workStyle

      return matchesQuery && matchesSkill && matchesLanguage && matchesLocation && matchesWorkStyle
    })

    return filtered.sort((left, right) => {
      if (sortBy === 'Company A-Z') {
        return left.company_name.localeCompare(right.company_name)
      }

      if (sortBy === 'Title A-Z') {
        return left.title.localeCompare(right.title)
      }

      if (sortBy === 'Compensation') {
        return getCompensationScore(right) - getCompensationScore(left)
      }

      return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime()
    })
  }, [displayVacancies, language, location, searchQuery, skill, sortBy, workStyle])

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / jobsPerPage))
  const currentPage = Math.min(page, totalPages)
  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * jobsPerPage
    return filteredJobs.slice(startIndex, startIndex + jobsPerPage)
  }, [currentPage, filteredJobs, jobsPerPage])
  const paginationItems = useMemo(
    () => getPaginationItems(currentPage, totalPages),
    [currentPage, totalPages]
  )

  function resetFilters() {
    setSearchQuery('')
    setSkill('All Skills')
    setLanguage('All Languages')
    setLocation('All Locations')
    setWorkStyle('All Work Styles')
    setSortBy('Newest')
    setPage(1)
  }

  function toggleSaved(vacancyId: number) {
    setSavedVacancyIds((current) =>
      current.includes(vacancyId) ? current.filter((currentId) => currentId !== vacancyId) : [...current, vacancyId]
    )
  }

  return (
    <div className="space-y-6 px-4 py-6 md:px-6 lg:px-8">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link to="/student" className="transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-foreground">Jobs</span>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Jobs</h1>
        <p className="text-base text-muted-foreground">
          LinkedIn-style mock job listings for UI review. You can swap this mock dataset back to original API data later.
        </p>
      </div>

      <div className="flex gap-3 md:hidden">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value)
              setPage(1)
            }}
            placeholder="Search jobs"
            className="h-11 rounded-none pl-10"
          />
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button type="button" variant="outline" className="h-11 rounded-none px-4">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-sm rounded-none px-6">
            <SheetHeader className="px-0">
              <SheetTitle>Filter jobs</SheetTitle>
              <SheetDescription>Refine by skill, language, location, work style, or sorting.</SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-4">
              <select
                value={skill}
                onChange={(event) => {
                  setSkill(event.target.value)
                  setPage(1)
                }}
                className="h-11 w-full rounded-none border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {skillOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'All Skills' ? option : formatLabel(option)}
                  </option>
                ))}
              </select>

              <select
                value={language}
                onChange={(event) => {
                  setLanguage(event.target.value)
                  setPage(1)
                }}
                className="h-11 w-full rounded-none border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {languageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'All Languages' ? option : languageLabels.get(option) ?? formatLabel(option)}
                  </option>
                ))}
              </select>

              <select
                value={location}
                onChange={(event) => {
                  setLocation(event.target.value)
                  setPage(1)
                }}
                className="h-11 w-full rounded-none border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {locationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <select
                value={workStyle}
                onChange={(event) => {
                  setWorkStyle(event.target.value)
                  setPage(1)
                }}
                className="h-11 w-full rounded-none border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
              >
                {workStyleOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === 'All Work Styles' ? option : workStyleLabels.get(option) ?? formatLabel(option)}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2 rounded-none border border-input bg-background px-4">
                <span className="text-sm whitespace-nowrap text-muted-foreground">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(event) => {
                    setSortBy(event.target.value)
                    setPage(1)
                  }}
                  className="h-11 w-full bg-transparent text-sm font-medium text-foreground outline-none"
                >
                  <option>Newest</option>
                  <option>Company A-Z</option>
                  <option>Title A-Z</option>
                  <option>Compensation</option>
                </select>
              </div>

              <Button type="button" variant="outline" className="h-11 w-full rounded-none" onClick={resetFilters}>
                Reset filters
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden gap-4 md:grid md:grid-cols-2 xl:grid-cols-6">
        <div className="relative md:col-span-2 xl:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value)
              setPage(1)
            }}
            placeholder="Search jobs"
            className="h-11 rounded-none pl-10"
          />
        </div>

        <select
          value={skill}
          onChange={(event) => {
            setSkill(event.target.value)
            setPage(1)
          }}
          className="h-11 rounded-none border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {skillOptions.map((option) => (
            <option key={option} value={option}>
              {option === 'All Skills' ? option : formatLabel(option)}
            </option>
          ))}
        </select>

        <select
          value={language}
          onChange={(event) => {
            setLanguage(event.target.value)
            setPage(1)
          }}
          className="h-11 rounded-none border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {languageOptions.map((option) => (
            <option key={option} value={option}>
              {option === 'All Languages' ? option : languageLabels.get(option) ?? formatLabel(option)}
            </option>
          ))}
        </select>

        <select
          value={location}
          onChange={(event) => {
            setLocation(event.target.value)
            setPage(1)
          }}
          className="h-11 rounded-none border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {locationOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <select
          value={workStyle}
          onChange={(event) => {
            setWorkStyle(event.target.value)
            setPage(1)
          }}
          className="h-11 rounded-none border border-input bg-background px-4 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          {workStyleOptions.map((option) => (
            <option key={option} value={option}>
              {option === 'All Work Styles' ? option : workStyleLabels.get(option) ?? formatLabel(option)}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden items-center gap-4 md:flex">
        <div className="flex items-center gap-2 rounded-none border border-input bg-background px-4">
          <span className="text-sm whitespace-nowrap text-muted-foreground">Sort by:</span>
          <select
            value={sortBy}
            onChange={(event) => {
              setSortBy(event.target.value)
              setPage(1)
            }}
            className="h-11 w-full bg-transparent text-sm font-medium text-foreground outline-none"
          >
            <option>Newest</option>
            <option>Company A-Z</option>
            <option>Title A-Z</option>
            <option>Compensation</option>
          </select>
        </div>

        <Button type="button" variant="outline" className="h-11 rounded-none px-5" onClick={resetFilters}>
          Reset filters
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {quickSkillOptions.map((option) => {
          const isActive = skill === option

          return (
            <button
              key={option}
              type="button"
              onClick={() => {
                setSkill(option)
                setPage(1)
              }}
              className={cn(
                'flex-none whitespace-nowrap border px-4 py-2 text-center text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:border-primary/30 hover:text-primary'
              )}
            >
              {option === 'All Skills' ? option : formatLabel(option)}
            </button>
          )
        })}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {filteredJobs.length} job listing{filteredJobs.length === 1 ? '' : 's'}
        </p>
      </div>

      {filteredJobs.length > 0 ? (
        <div className="space-y-4">
          {paginatedJobs.map((vacancy) => {
            const isSaved = vacancy.is_bookmarked

            return (
              <Card
                key={vacancy.vacancy_id}
                className="rounded-[24px] border border-slate-200/80 bg-white shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
              >
                <CardContent className="px-4 py-4 sm:px-6 sm:py-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 gap-3 sm:gap-4">
                      <Avatar size="lg" className="border border-slate-200 bg-white shadow-sm">
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
                            {workStyleLabels.get(vacancy.work_style) ?? vacancy.work_style_label}
                          </span>
                        </div>

                        <p className="text-sm text-slate-600">
                          Skills: <span className="text-slate-700">{formatSkillsSummary(vacancy)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="hidden sm:flex sm:flex-row sm:items-start sm:justify-between sm:gap-4 lg:min-w-[140px] lg:flex-col lg:items-end">
                      <div className="text-sm font-medium text-emerald-700">{formatRelativeDate(vacancy.updated_at)}</div>

                      <div className="flex items-center gap-2 text-slate-500">
                        <button
                          type="button"
                          onClick={() => toggleSaved(vacancy.vacancy_id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
                          aria-label={isSaved ? 'Remove saved job' : 'Save job'}
                        >
                          {isSaved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:text-slate-700"
                          aria-label="More actions"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                        <Badge className="border-transparent bg-blue-100 text-blue-700 hover:bg-blue-100">Easy Apply</Badge>
                        {vacancy.relocation_support ? (
                          <Badge variant="outline" className="bg-white">
                            Promoted
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:hidden">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-emerald-700">{formatRelativeDate(vacancy.updated_at)}</p>
                      <div className="flex items-center gap-2 text-slate-500">
                        <button
                          type="button"
                          onClick={() => toggleSaved(vacancy.vacancy_id)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
                          aria-label={isSaved ? 'Remove saved job' : 'Save job'}
                        >
                          {isSaved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
                        </button>
                        <button
                          type="button"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:border-slate-300 hover:text-slate-700"
                          aria-label="More actions"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="border-transparent bg-blue-100 text-blue-700 hover:bg-blue-100">Easy Apply</Badge>
                      {vacancy.relocation_support ? (
                        <Badge variant="outline" className="bg-white">
                          Promoted
                        </Badge>
                      ) : null}
                    </div>

                    <p className="text-sm text-slate-500">
                      {vacancy.created_by_name} is hiring · {formatLabel(vacancy.status)}
                    </p>
                  </div>

                  <p className="mt-4 hidden text-sm text-slate-500 sm:block">
                    {vacancy.created_by_name} is hiring · {formatLabel(vacancy.status)}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="border border-border bg-muted/10 px-6 py-10 text-center">
          <p className="text-lg font-semibold text-foreground">No jobs match your filters</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a different keyword, location, or work style to broaden the results.
          </p>
        </div>
      )}

      {filteredJobs.length > jobsPerPage ? (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {paginationItems.map((item, index) =>
            typeof item === 'number' ? (
              <button
                key={item}
                type="button"
                onClick={() => setPage(item)}
                className={cn(
                  'inline-flex h-10 min-w-10 items-center justify-center rounded-xl border px-3 text-sm font-medium transition',
                  currentPage === item
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                )}
              >
                {item}
              </button>
            ) : (
              <span key={`${item}-${index}`} className="px-1 text-sm text-slate-400">
                ...
              </span>
            )
          )}

          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}
    </div>
  )
}

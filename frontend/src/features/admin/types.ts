export interface AdminSkillOption {
  id: number
  name: string
  slug: string
}

export interface AdminVacancySkillRequirement {
  id: number
  skill_id: number
  skill_name: string
  skill_slug: string
  requirement_type: string
}

export interface AdminVacancyLanguageRequirement {
  id: number
  language: string
  language_label: string
  minimum_level: string
  minimum_level_label: string
  requirement_type: string
}

export interface AdminUserRecord {
  user_id: number
  email: string
  name: string
  role: string
  company_id: number | null
  company_name: string | null
  is_active: boolean
  date_joined: string
}

export interface AdminCompanyRecord {
  company_id: number
  name: string
  description: string
  is_active: boolean
  user_count: number
  created_at: string
  updated_at: string
}

export interface AdminUsersResponse {
  users: AdminUserRecord[]
  companies: AdminCompanyRecord[]
}

export interface AdminCompaniesResponse {
  companies: AdminCompanyRecord[]
}

export interface AdminVacanciesResponse {
  vacancies: AdminVacancyRecord[]
  companies: AdminCompanyRecord[]
  company_users: AdminCompanyUserRecord[]
  available_skills: AdminSkillOption[]
}

export interface AdminCompanyUserRecord {
  user_id: number
  name: string
  email: string
  company_id: number | null
  company_name: string | null
  is_active: boolean
}

export interface AdminVacancyRecord {
  vacancy_id: number
  company_id: number
  company_name: string
  title: string
  description: string
  employment_type: string
  experience_level: string
  location: string
  work_style: string
  work_style_label: string
  relocation_support: boolean
  skill_requirements: AdminVacancySkillRequirement[]
  language_requirements: AdminVacancyLanguageRequirement[]
  is_bookmarked: boolean
  status: string
  created_by_id: number
  created_by_name: string
  created_at: string
  updated_at: string
}

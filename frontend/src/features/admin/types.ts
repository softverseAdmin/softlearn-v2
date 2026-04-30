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
  status: string
  created_by_id: number
  created_by_name: string
  created_at: string
  updated_at: string
}

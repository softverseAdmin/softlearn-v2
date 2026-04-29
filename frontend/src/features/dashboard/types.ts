import type { NotificationItem } from '../notifications/types'
import type { CompanyCandidate, InterviewSummary } from '../profile/types'

export interface StudentDashboardResponse {
  student_id: number
  metrics: {
    profile_complete: boolean
    skill_count: number
    total_courses: number
    completed_courses: number
    total_results: number
    passed_results: number
    interview_count: number
    active_interviews: number
    unread_notifications: number
  }
  highlights: {
    average_score: number | null
    next_interview_at: string | null
    share_exam_results: boolean
  }
  recent_interviews: InterviewSummary[]
  recent_notifications: NotificationItem[]
}

export interface CompanyDashboardResponse {
  company_id: number
  company_name: string
  metrics: {
    vacancy_count: number
    candidate_count: number
    shortlist_count: number
    interview_count: number
    active_interviews: number
    completed_interviews: number
    unread_notifications: number
    profile_complete: boolean
  }
  recent_interviews: InterviewSummary[]
  recent_candidates: CompanyCandidate[]
  recent_notifications: NotificationItem[]
}

export interface AdminDashboardResponse {
  metrics: {
    total_users: number
    students: number
    company_users: number
    admins: number
    companies: number
    active_vacancies: number
    total_interviews: number
    active_interviews: number
    completed_interviews: number
    cancelled_interviews: number
    unread_notifications: number
  }
  recent_users: Array<{
    user_id: number
    name: string
    email: string
    role: string
    company_name: string | null
    date_joined: string
  }>
  recent_interviews: Array<{
    id: number
    company_name: string
    student_name: string
    status: string
    updated_at: string
    scheduled_start: string | null
    scheduled_end: string | null
  }>
  recent_notifications: NotificationItem[]
}

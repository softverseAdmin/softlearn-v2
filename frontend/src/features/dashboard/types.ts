import type { NotificationItem } from '../notifications/types'
import type { CompanyCandidate, InterviewSummary } from '../profile/types'

export type RoadmapNodeState = 'not_started' | 'in_progress' | 'completed' | 'exam_required' | 'locked'

export interface StudentDashboardResponse {
  student_id: number
  student_name: string
  header_message: string
  continue_learning: {
    roadmap_title: string
    topic_title: string
    progress_percent: number
    status: Exclude<RoadmapNodeState, 'exam_required' | 'locked'>
    cta_label: string
    cta_href: string
  }
  next_action: {
    action_type: 'start_learning' | 'start_topic' | 'complete_topic' | 'take_exam' | 'continue_roadmap'
    title: string
    description: string
    cta_label: string
    cta_href: string
    requirement: string | null
  }
  progress_overview: {
    completed_topics: number
    exam_average: number | null
    current_level: string
  }
  roadmap_preview: {
    nodes: Array<{
      id: string
      title: string
      subtitle: string
      state: RoadmapNodeState
      progress_percent: number | null
      cta_href: string | null
      is_current: boolean
    }>
  }
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

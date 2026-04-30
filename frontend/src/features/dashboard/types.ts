import type { NotificationItem } from '../notifications/types'

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
  header_message: string
  candidates_to_review: Array<{
    candidate_access_id: number
    display_name: string
    source: string
    score_percent: number | null
    top_skills: string[]
    is_shortlisted: boolean
    cta_label: string
    cta_href: string
  }>
  active_jobs: {
    pipeline_summary: string
    jobs: Array<{
      vacancy_id: number
      title: string
      status: string
      location: string
      cta_label: string
      cta_href: string
    }>
  }
  interviews: {
    active_count: number
    completed_count: number
    items: Array<{
      id: number
      student_name: string
      purpose: string
      status: string
      timing_label: string
      cta_label: string
      cta_href: string
    }>
  }
  analytics: {
    candidates_to_review: number
    shortlisted_candidates: number
    active_jobs: number
    unread_updates: number
  }
}

export interface AdminDashboardResponse {
  header_message: string
  system_stats: {
    total_users: number
    active_students: number
    companies: number
    revenue_label: string
    revenue_description: string
  }
  recent_activity: Array<{
    id: string
    kind: 'user' | 'interview' | 'notification'
    title: string
    description: string
    timestamp: string
  }>
  system_status: Array<{
    id: number
    label: string
    value: string
    tone: 'healthy' | 'warning' | 'neutral'
    description: string
  }>
}

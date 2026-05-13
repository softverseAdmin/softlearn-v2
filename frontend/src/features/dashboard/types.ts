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
  current_lesson: {
    lesson_id: number
    title: string
    course_title: string
    sequence_number: number
    href: string
    status: 'not_started' | 'in_progress' | 'completed'
  } | null
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
    id: string
    label: string
    value: string
    tone: 'healthy' | 'warning' | 'neutral'
    description: string
  }>
}

// Analytics Dashboard Types
export interface StudentAnalyticsDashboardData {
  metrics: {
    courses_in_progress: number
    courses_completed: number
    exams_attempted: number
    average_exam_score: number
    applications_submitted: number
    applications_accepted: number
    applications_rejected: number
    interviews_scheduled: number
    interviews_completed: number
    skills_total: number
    skills_endorsed: number
  }
  score_history: Array<{
    date: string
    score: number
    exam: string
  }>
  learning_status: {
    not_started: number
    in_progress: number
    completed: number
  }
  upcoming_interviews: Array<{
    id: number
    company: string
    purpose: string
    scheduled_start: string | null
    status: string
    meeting_url: string
  }>
  application_status: {
    submitted: number
    under_review: number
    shortlisted: number
    rejected: number
    withdrawn: number
  }
  study_streak_days: number
  last_updated: string
}

export interface CompanyAnalyticsDashboardData {
  metrics: {
    open_vacancies: number
    total_applications: number
    interviews_scheduled: number
    offers_made: number
    new_applications_7days: number
    interview_conversion_rate: number
    average_time_to_hire_days: number
    shortlist_ratio: number
    recent_interviews_completed: number
    recent_candidates_shortlisted: number
    recent_notes_added: number
  }
  vacancy_performance: Array<{
    id: number
    title: string
    applications: number
    active: boolean
  }>
  funnel_data: Array<{
    stage: string
    count: number
  }>
  daily_activity: Record<
    string,
    {
      applications: number
      interviews: number
    }
  >
  last_updated: string
}

export interface AdminAnalyticsDashboardData {
  platform_overview: {
    total_students: number
    total_companies: number
    total_admins: number
    active_users_30d: number
    new_signups_this_month: number
  }
  platform_activity: {
    applications_created_30d: number
    interviews_completed_30d: number
    exams_taken_30d: number
    courses_started_30d: number
  }
  content_metrics: {
    total_courses: number
    total_exams: number
    total_vacancies: number
  }
  user_growth: Array<{
    month: string
    users: number
  }>
  last_updated: string
}

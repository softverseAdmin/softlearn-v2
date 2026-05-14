export interface SelectOption {
  value: string
  label: string
}

export interface StudentProfile {
  student_id: number
  name: string
  desired_job_type: string
  desired_work_location: string
  japanese_level: string
  english_level: string
  about_me: string
  profile_image: string | null
  cover_image: string | null
  profile_complete: boolean
  education_records: StudentEducationRecord[]
  experience_records: StudentExperienceRecord[]
  certificates: StudentCertificateRecord[]
  resumes: StudentResumeRecord[]
  availability: StudentAvailabilityProfile
  profile_extension_summary: StudentProfileExtensionSummary
}

export interface StudentEducationRecord {
  id: number
  institution: string
  field_of_study: string
  start_date: string
  end_date: string | null
  completion_status: string
  grade: string
  activities: string
  description: string
  skill_ids: number[]
}

export interface StudentExperienceRecord {
  id: number
  organization: string
  role_title: string
  experience_type: string
  start_date: string
  end_date: string | null
  is_current: boolean
  summary: string
  skill_ids: number[]
}

export interface StudentCertificateRecord {
  id: number
  name: string
  issuer: string
  issue_date: string
  expiry_date: string | null
  credential_id: string
  credential_url: string
  description: string
  skill_ids: number[]
}

export interface StudentResumeRecord {
  id: number
  display_name: string
  file_name: string
  source_type: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StudentAvailabilityProfile {
  job_search_status: string
  earliest_start_date: string | null
  interview_availability: string
  scheduling_notes: string
  availability_set: boolean
  updated_at: string
}

export interface StudentProfileExtensionSummary {
  education_count: number
  experience_count: number
  resume_count: number
  has_active_resume: boolean
  availability_set: boolean
}

export interface CompanyProfile {
  company_id: number
  name: string
  description: string
  profile_image: string | null
  cover_image: string | null
  job_posting_id: string
  founder_name: string
  headquarters_address: string
  office_locations: string
  founded_at: string
  website_url: string
  industry: string
  company_points: string[]
  business_domains: string[]
  business_models: string[]
  employee_count_label: string
  market_category: string
  capital_label: string
  revenue_label: string
  tagline: string
  company_features: string
  additional_company_info: string
  profile_complete: boolean
}

export interface CompanyHiringPreferences {
  default_experience_level: string
  preferred_skills: string[]
  min_salary: number | null
  max_salary: number | null
}

export interface VacancyPostingDetails {
  job_highlights: string
  responsibilities: string
  role_change_scope: string
  required_experience: string
  preferred_experience: string
  culture_and_other: string
  employment_term: string
  probation_period: string
  probation_conditions: string
  contract_renewal: string
  working_hours: string
  break_time: string
  flex_time: string
  overtime: string
  compensation_type: string
  planned_annual_salary: string
  monthly_salary: string
  overtime_pay: string
  interview_rounds: string
  selection_method: string
  location_change_scope: string
  nearest_station: string
  allowances: string
  insurance: string
  notes: string
}

export interface CompanyMember {
  id: number
  user_id: number
  email: string
  full_name: string
  role: 'admin' | 'member' | 'viewer'
  created_at: string
}

export interface VacancyRecord {
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
  min_salary: number | null
  max_salary: number | null
  posting_details: VacancyPostingDetails
  skill_requirements: VacancySkillRequirement[]
  language_requirements: VacancyLanguageRequirement[]
  is_bookmarked: boolean
  status: string
  created_by_name: string
  created_at: string
  updated_at: string
}

export interface VacancySkillRequirement {
  id: number
  skill_id: number
  skill_name: string
  skill_slug: string
  requirement_type: string
}

export interface VacancyLanguageRequirement {
  id: number
  language: string
  language_label: string
  minimum_level: string
  minimum_level_label: string
  requirement_type: string
}

export interface CompanyVacanciesResponse {
  vacancies: VacancyRecord[]
  available_skills: SkillOption[]
}

export interface StudentJobsResponse {
  vacancies: VacancyRecord[]
  query: string
  filters: {
    skills: string[]
    languages: string[]
    locations: string[]
    work_styles: string[]
  }
  result_count: number
  bookmark_count: number
  available_skills: SkillOption[]
  available_languages: SelectOption[]
  available_locations: string[]
  available_work_styles: SelectOption[]
}

export interface MatchFactorBreakdown {
  skill: number
  language: number
  location: number
  readiness: number
  profile: number
}

export interface StudentMatchedJobRecord extends VacancyRecord {
  match_score: number
  match_level: string
  strengths: string[]
  gaps: string[]
  factor_breakdown: MatchFactorBreakdown
  has_active_application: boolean
  can_apply: boolean
}

export interface StudentMatchesResponse {
  student_id: number
  match_count: number
  matches: StudentMatchedJobRecord[]
}

export interface ApplicationStatusHistoryRecord {
  id: number
  from_status: string | null
  to_status: string
  actor_name: string | null
  actor_role: string | null
  note: string
  created_at: string
}

export interface StudentApplicationRecord {
  application_id: number
  vacancy_id: number
  vacancy_title: string
  company_id: number
  company_name: string
  status: string
  can_withdraw: boolean
  submitted_at: string
  updated_at: string
  history: ApplicationStatusHistoryRecord[]
}

export interface StudentApplicationsResponse {
  student_id: number
  application_count: number
  applications: StudentApplicationRecord[]
}

export interface CompanyApplicationRecord {
  application_id: number
  candidate_access_id: number | null
  vacancy_id: number
  vacancy_title: string
  student_id: number
  display_name: string
  desired_job_type: string
  desired_work_location: string
  status: string
  can_shortlist: boolean
  can_reject: boolean
  submitted_at: string
  updated_at: string
  history: ApplicationStatusHistoryRecord[]
}

export interface CompanyApplicationsResponse {
  company_id: number
  application_count: number
  applications: CompanyApplicationRecord[]
}

export interface SkillOption {
  id: number
  name: string
  slug: string
}

export interface StudentSkill {
  id: number
  skill_id: number
  skill_name: string
  proficiency_level: string
}

export interface StudentSkillsResponse {
  skills: StudentSkill[]
  available_skills: SkillOption[]
  skill_count: number
}

export interface LearningRecord {
  id: number
  course_id: number | null
  course_title: string
  category: string
  progress_percent: number
  status: string
  completed_at: string | null
}

export interface LearningSummary {
  student_id: number
  total_courses: number
  completed_courses: number
  in_progress_courses: number
  records: LearningRecord[]
}

export interface CourseCatalogRecord {
  course_id: number
  title: string
  description: string
  category: string
  difficulty_level: string
  estimated_hours: number
  status: string
  lesson_count: number
  is_enrolled: boolean
  enrollment_status: string | null
  progress_percent: number | null
  readiness_cues: string[]
  detail_href: string
  next_step_label: string
  next_step_href: string
}

export interface CourseCatalogResponse {
  result_count: number
  courses: CourseCatalogRecord[]
}

export interface CourseEnrollmentState {
  is_enrolled: boolean
  learning_record_id: number | null
  status: string | null
  progress_percent: number | null
  completed_at: string | null
  lesson_count: number
  completed_lesson_count: number
}

export interface CourseLessonSummary {
  lesson_id: number
  title: string
  summary: string
  sequence_number: number
  status: string | null
  is_accessible: boolean
  detail_href: string | null
}

export interface CourseDetailResponse extends CourseCatalogRecord {
  enrollment: CourseEnrollmentState
  lessons: CourseLessonSummary[]
  learning_outcomes: string[]
}

export interface StudentCourseEnrollmentResponse {
  course_id: number
  created: boolean
  enrollment: CourseEnrollmentState
  next_step_href: string
  next_step_label: string
}

export interface LessonProgressState {
  status: string
  started_at: string | null
  completed_at: string | null
}

export interface LessonDetailResponse {
  lesson_id: number
  course_id: number
  course_title: string
  course_href: string
  title: string
  summary: string
  content: string
  sequence_number: number
  total_lessons: number
  progress: LessonProgressState
  previous_lesson_href: string | null
  next_lesson_href: string | null
}

export interface LessonProgressUpdateResponse {
  lesson: LessonDetailResponse
  enrollment: CourseEnrollmentState
  next_step_href: string
}

export interface ExamResult {
  id: number
  exam_id: number | null
  attempt_id: number | null
  exam_title: string
  category: string
  score_percent: number
  passed: boolean
  attempt_number: number
  taken_at: string
}

export interface AvailableExamRecord {
  exam_id: number
  title: string
  description: string
  category: string
  duration_minutes: number
  passing_score_percent: number
  question_count: number
  max_attempts: number
  attempt_count: number
  can_take: boolean
  retake_message: string
  next_attempt_number: number | null
  detail_href: string
}

export interface ExamResultsSummary {
  student_id: number
  total_results: number
  passed_results: number
  average_score: number | null
  results: ExamResult[]
  available_exams: AvailableExamRecord[]
}

export interface StudentExamQuestionOption {
  option_id: number
  option_text: string
  sequence_number: number
}

export interface StudentExamQuestion {
  question_id: number
  prompt: string
  instructions: string
  question_type: string
  sequence_number: number
  points: number
  options: StudentExamQuestionOption[]
}

export interface StudentExamDetailResponse {
  exam_id: number
  title: string
  description: string
  category: string
  duration_minutes: number
  passing_score_percent: number
  question_count: number
  max_attempts: number
  attempt_count: number
  can_take: boolean
  retake_message: string
  next_attempt_number: number | null
  questions: StudentExamQuestion[]
}

export interface StudentExamSubmitResponse {
  exam_id: number
  attempt_id: number
  attempt_number: number
  score_percent: number
  passed: boolean
  passing_score_percent: number
  result_id: number
  history_href: string
}

export interface PreparationCategorySummary {
  category: string
  label: string
  course_count: number
  completed_courses: number
  in_progress_courses: number
  practice_question_count: number
  practice_attempt_count: number
  practice_accuracy: number | null
  mock_attempt_count: number
  best_mock_score: number | null
  latest_mock_score: number | null
  available_exam_count: number
}

export interface StudyPlanItem {
  category: string
  label: string
  status: 'not_started' | 'focus' | 'in_progress' | 'ready'
  practice_target: number
  practice_completed: number
  latest_mock_score: number | null
  next_step: string
  cta_href: string
}

export interface PreparationPerformanceCategory {
  category: string
  label: string
  practice_attempt_count: number
  practice_accuracy: number | null
  mock_attempt_count: number
  best_mock_score: number | null
  latest_mock_score: number | null
}

export interface PracticeAttemptActivity {
  attempt_id: number
  exam_id: number
  exam_title: string
  category: string
  question_id: number
  question_prompt: string
  is_correct: boolean
  created_at: string
}

export interface MockExamAttemptRecord {
  attempt_id: number
  exam_id: number
  exam_title: string
  category: string
  attempt_number: number
  score_percent: number
  correct_answer_count: number
  total_questions: number
  submitted_at: string
}

export interface StudentMockExamRecord {
  exam_id: number
  title: string
  description: string
  category: string
  duration_minutes: number
  question_count: number
  attempt_count: number
  best_score: number | null
  last_score: number | null
  detail_href: string
}

export interface PreparationSummaryResponse {
  student_id: number
  categories: PreparationCategorySummary[]
  study_plan: {
    items: StudyPlanItem[]
  }
  performance: {
    practice_attempt_count: number
    practice_accuracy: number | null
    mock_attempt_count: number
    best_mock_score: number | null
    recent_mock_score: number | null
    category_breakdown: PreparationPerformanceCategory[]
  }
  mock_exams: StudentMockExamRecord[]
  recent_activity: {
    practice_attempts: PracticeAttemptActivity[]
    mock_attempts: MockExamAttemptRecord[]
  }
}

export interface PracticeQuestionRecord {
  question_id: number
  exam_id: number
  exam_title: string
  category: string
  prompt: string
  instructions: string
  sequence_number: number
  points: number
  options: StudentExamQuestionOption[]
  attempt_count: number
  last_outcome: boolean | null
}

export interface PracticeQuestionsResponse {
  selected_category: string | null
  selected_exam_id: number | null
  categories: SelectOption[]
  exams: Array<{
    exam_id: number
    title: string
    category: string
  }>
  question_count: number
  questions: PracticeQuestionRecord[]
}

export interface PracticeQuestionAttemptResponse {
  attempt_id: number
  question_id: number
  selected_option_id: number
  is_correct: boolean
  correct_option_id: number
  correct_option_text: string
  feedback: string
  performance_snapshot: {
    category: string
    practice_attempt_count: number
    practice_accuracy: number | null
  }
}

export interface StudentMockExamDetailResponse {
  exam_id: number
  title: string
  description: string
  category: string
  duration_minutes: number
  question_count: number
  attempt_count: number
  next_attempt_number: number
  best_score: number | null
  last_score: number | null
  questions: StudentExamQuestion[]
}

export interface StudentMockExamSubmitResponse {
  attempt_id: number
  exam_id: number
  exam_title: string
  attempt_number: number
  score_percent: number
  correct_answer_count: number
  total_questions: number
  history_href: string
}

export interface CompanyCandidate {
  candidate_access_id: number
  source: string
  student_id: number
  display_name: string
  desired_job_type: string
  desired_work_location: string
  top_skills: string[]
  strengths: string[]
  gaps: string[]
  visibility: {
    profile_preview: string
    learning_record: string
    exam_results: string
  }
  is_shortlisted: boolean
  notes_count: number
  shortlist: CandidateShortlist | null
  updated_at: string
}

export interface CompanyCandidatesResponse {
  company_id: number
  candidate_count: number
  candidates: CompanyCandidate[]
}

export interface CompanyVacancyMatchRecord {
  candidate_access_id: number | null
  vacancy_id: number
  student_id: number
  display_name: string
  desired_job_type: string
  desired_work_location: string
  top_skills: string[]
  match_score: number
  match_level: string
  strengths: string[]
  gaps: string[]
  factor_breakdown: MatchFactorBreakdown
  visibility: {
    profile_preview: string
    learning_record: string
    exam_results: string
  }
}

export interface CompanyVacancyMatchesResponse {
  company_id: number
  vacancy_id: number
  vacancy_title: string
  match_count: number
  matches: CompanyVacancyMatchRecord[]
}

export interface CompanyCandidatePreviewResponse {
  candidate_access_id: number
  source: string
  visibility: string
  shortlist: CandidateShortlist | null
  notes: CandidateNote[]
  student: {
    student_id: number
    name: string
    desired_job_type: string
    desired_work_location: string
    japanese_level: string
    english_level: string
    skills: StudentSkill[]
  } | null
  restrictions: string[]
}

export interface CompanyCandidateRecordResponse<TSummary> {
  candidate_access_id: number
  visibility: string
  summary: TSummary
  restrictions: string[]
}

export interface CandidateShortlist {
  id: number
  created_at: string
  created_by_name: string
}

export interface CandidateNote {
  id: number
  author_name: string
  author_email: string
  body: string
  created_at: string
}

export interface CandidateNotesResponse {
  candidate_access_id: number
  notes: CandidateNote[]
}

export interface CandidateShortlistResponse {
  candidate_access_id: number
  is_shortlisted: boolean
  shortlist: CandidateShortlist | null
}

export interface CompanyShortlistEntry {
  candidate_access_id: number
  student_id: number
  display_name: string
  created_at: string
  created_by_name: string
  source: string
}

export interface CompanyShortlistResponse {
  company_id: number
  shortlist_count: number
  shortlists: CompanyShortlistEntry[]
}

export interface StudentVisibilityEvent {
  id: number
  share_profile_preview: boolean
  share_learning_record: boolean
  share_exam_results: boolean
  created_at: string
}

export interface StudentPrivacySettings {
  student_id: number
  share_profile_preview: boolean
  share_learning_record: boolean
  share_exam_results: boolean
  history: StudentVisibilityEvent[]
}

export interface InterviewAvailability {
  id: number
  submitted_by_name: string
  submitted_by_role: string
  start_at: string
  end_at: string
  note: string
  created_at: string
}

export interface InterviewHistoryEvent {
  id: number
  event_type: string
  description: string
  actor_name: string | null
  actor_role: string | null
  created_at: string
}

export interface InterviewSummary {
  id: number
  candidate_access_id: number
  student_id: number
  student_name: string
  company_id: number
  purpose: string
  role_context: string
  status: string
  scheduled_start: string | null
  scheduled_end: string | null
  confirmed_at: string | null
  cancelled_at: string | null
  completed_at: string | null
  meeting_provider: string | null
  meeting_url: string | null
  created_at: string
  updated_at: string
}

export interface InterviewDetail extends InterviewSummary {
  availabilities: InterviewAvailability[]
  history: InterviewHistoryEvent[]
}

export interface InterviewListResponse {
  interviews: InterviewSummary[]
}

export interface CandidateInterviewsResponse {
  candidate_access_id: number
  interviews: InterviewSummary[]
}

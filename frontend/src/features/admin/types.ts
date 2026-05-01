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
  vacancy_count: number
  active_vacancy_count: number
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

export interface AdminCourseRecord {
  course_id: number
  title: string
  description: string
  category: string
  difficulty_level: string
  estimated_hours: number
  status: string
  lesson_count: number
  learning_record_count: number
  created_at: string
  updated_at: string
}

export interface AdminCoursesResponse {
  courses: AdminCourseRecord[]
}

export interface AdminLessonRecord {
  lesson_id: number
  course_id: number
  course_title: string
  title: string
  summary: string
  content: string
  sequence_number: number
  status: string
  progress_entry_count: number
  created_at: string
  updated_at: string
}

export interface AdminCourseLessonsResponse {
  course: AdminCourseRecord
  lessons: AdminLessonRecord[]
}

export interface AdminExamRecord {
  exam_id: number
  title: string
  description: string
  category: string
  duration_minutes: number
  passing_score_percent: number
  question_count: number
  max_attempts: number
  status: string
  result_count: number
  created_at: string
  updated_at: string
}

export interface AdminExamsResponse {
  exams: AdminExamRecord[]
}

export interface AdminExamQuestionRecord {
  question_id: number
  exam_id: number
  prompt: string
  instructions: string
  question_type: string
  sequence_number: number
  points: number
  status: string
  option_count: number
  created_at: string
  updated_at: string
}

export interface AdminExamAnswerOptionRecord {
  option_id: number
  question_id: number
  option_text: string
  sequence_number: number
  is_correct: boolean
  status: string
  created_at: string
  updated_at: string
}

export interface AdminExamQuestionsResponse {
  exam: AdminExamRecord
  questions: AdminExamQuestionRecord[]
}

export interface AdminQuestionOptionsResponse {
  question: AdminExamQuestionRecord
  options: AdminExamAnswerOptionRecord[]
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

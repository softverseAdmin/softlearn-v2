import type { AdminCourseRecord, AdminExamRecord } from '@/features/admin/types'

export interface TeacherProfileResponse {
  user_id: number
  full_name: string
  email: string
  role_label: string
  joined_at: string
  overview: string
   profile_image: string | null
   cover_image: string | null
  stats: {
    related_students: number
    courses: number
    exams: number
    lessons: number
    active_learning_records: number
  }
  workspace_focus: Array<{
    label: string
    value: string
  }>
  workspace_access: string[]
}

export interface TeacherCoursesResponse {
  courses: AdminCourseRecord[]
  summary: {
    total: number
    active: number
    draft: number
    inactive: number
  }
}

export interface TeacherExamsResponse {
  exams: AdminExamRecord[]
  summary: {
    total: number
    active: number
    draft: number
    inactive: number
  }
}

export interface TeacherStudentRecord {
  student_id: number
  full_name: string
  email: string
  desired_job_type: string
  desired_work_location: string
  japanese_level: string
  english_level: string
  profile_complete: boolean
  skill_count: number
  resume_count: number
  experience_count: number
  education_count: number
  date_joined: string
}

export interface TeacherStudentsResponse {
  students: TeacherStudentRecord[]
  summary: {
    total: number
    profile_complete: number
    with_resumes: number
    with_experience: number
  }
}

export interface TeacherProgressRecord {
  learning_record_id: number
  student_id: number
  student_name: string
  student_email: string
  course_id: number
  course_title: string
  course_category: string
  course_status: string
  learning_status: string
  progress_percent: number
  completed_lessons: number
  total_lessons: number
  in_progress_lessons: number
  lesson_exam_passed_count: number
  current_lesson_title: string | null
  last_activity_at: string
  final_exam: {
    assessment_id: number
    title: string
    latest_score: number | null
    passed: boolean
    attempt_count: number
  } | null
}

export interface TeacherProgressResponse {
  records: TeacherProgressRecord[]
  summary: {
    students: number
    learning_records: number
    in_progress: number
    completed: number
    average_progress_percent: number
  }
}

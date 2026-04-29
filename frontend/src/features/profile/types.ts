export interface StudentProfile {
  student_id: number
  name: string
  desired_job_type: string
  desired_work_location: string
  japanese_level: string
  english_level: string
  profile_complete: boolean
}

export interface CompanyProfile {
  company_id: number
  name: string
  description: string
  profile_complete: boolean
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

export interface ExamResult {
  id: number
  exam_title: string
  category: string
  score_percent: number
  passed: boolean
  attempt_number: number
  taken_at: string
}

export interface ExamResultsSummary {
  student_id: number
  total_results: number
  passed_results: number
  average_score: number | null
  results: ExamResult[]
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

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
  profile_complete: boolean
}

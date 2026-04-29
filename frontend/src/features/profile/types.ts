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

export interface ExamCategory {
  id: number
  name: string
  description: string
  icon: string
  order: number
  active: boolean
  created_at: string
}

export interface PracticeQuestionOption {
  id: number
  question_id: number
  option_text: string
  is_correct: boolean
  explanation: string
}

export interface PracticeQuestion {
  id: number
  exam_id: number
  question_text: string
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  topic: string
  options: PracticeQuestionOption[]
  created_at: string
}

export interface MockExam {
  id: number
  exam_id: number
  title: string
  description: string
  duration_minutes: number
  created_at: string
}

export interface MockExamAttempt {
  id: number
  student_id: number
  exam_id: number
  exam_title: string
  category: string
  attempt_number: number
  score_percent: number
  correct_answer_count: number
  total_questions: number
  started_at: string
  submitted_at: string
  created_at: string
  updated_at: string
}

export interface StudyPlan {
  id: number
  student_id: number
  exam_id: number
  exam_title: string
  created_at: string
  completed_at: string | null
}

export interface StudyPlanItem {
  id: number
  study_plan_id: number
  item_type: 'lesson' | 'practice' | 'mock' | 'reading'
  lesson_id: number | null
  practice_question_id: number | null
  mock_exam_id: number | null
  completed: boolean
  completion_date: string | null
  order: number
}

export interface StudentPerformanceMetric {
  id: number
  student_id: number
  exam_id: number
  metric_type: string
  value: number
  trend: 'up' | 'stable' | 'down' | null
  calculated_at: string
}

export interface Exam {
  exam_id: number
  title: string
  description: string
  category: string
  duration_minutes: number
  passing_score_percent: number
  question_count: number
  max_attempts: number
  status: string
}

export interface ExamQuestion {
  question_id: number
  prompt: string
  instructions: string
  question_type: string
  sequence_number: number
  points: number
  options: ExamAnswerOption[]
}

export interface ExamAnswerOption {
  option_id: number
  option_text: string
  sequence_number: number
}

export interface StudentExamQuestion extends ExamQuestion {
  flagged?: boolean
}

import type { StudentDashboardResponse } from './types'

type StudentDashboardProps = {
  userName: string
  loading: boolean
  error: string | null
  data: StudentDashboardResponse | null
}

export function StudentDashboard(props: StudentDashboardProps) {
  void props
  return <section className="px-4 py-6 md:px-6 lg:px-8" />
}

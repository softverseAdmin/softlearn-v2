import { CompanyCourseEditorPage } from '@/features/profile/CompanyCourseEditorPage'

export function TeacherCourseCreatePage() {
  return <CompanyCourseEditorPage mode="create" workspaceRole="teacher" />
}

export function TeacherCourseEditPage() {
  return <CompanyCourseEditorPage mode="edit" workspaceRole="teacher" />
}

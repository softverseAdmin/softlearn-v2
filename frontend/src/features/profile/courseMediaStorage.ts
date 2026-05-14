export type CourseMediaOverride = {
  thumbnailImage: string
  previewImage: string
  thumbnailAltText: string
}

const courseMediaStorageKey = 'course-media-overrides'

function readCourseMediaMap(): Record<string, CourseMediaOverride> {
  if (typeof window === 'undefined') {
    return {}
  }

  const rawValue = window.localStorage.getItem(courseMediaStorageKey)
  if (!rawValue) {
    return {}
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Record<string, CourseMediaOverride>
    return parsedValue && typeof parsedValue === 'object' ? parsedValue : {}
  } catch {
    return {}
  }
}

function writeCourseMediaMap(value: Record<string, CourseMediaOverride>) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(courseMediaStorageKey, JSON.stringify(value))
}

export function getCourseMediaOverride(courseId: number | string) {
  const courseMediaMap = readCourseMediaMap()
  return courseMediaMap[String(courseId)] ?? null
}

export function getAllCourseMediaOverrides() {
  return readCourseMediaMap()
}

export function setCourseMediaOverride(courseId: number | string, value: CourseMediaOverride) {
  const courseMediaMap = readCourseMediaMap()
  const hasMedia = Boolean(value.thumbnailImage || value.previewImage || value.thumbnailAltText)

  if (hasMedia) {
    courseMediaMap[String(courseId)] = value
  } else {
    delete courseMediaMap[String(courseId)]
  }

  writeCourseMediaMap(courseMediaMap)
}

export type CourseMediaOverride = {
  thumbnailImage: string
  previewImage: string
  thumbnailAltText: string
}

type CourseMediaState = {
  overrides: Record<string, CourseMediaOverride>
  slugToCourseKey: Record<string, string>
}

const courseMediaStorageKey = 'course-media-overrides'

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function createEmptyCourseMediaState(): CourseMediaState {
  return {
    overrides: {},
    slugToCourseKey: {},
  }
}

function isCourseMediaOverride(value: unknown): value is CourseMediaOverride {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<CourseMediaOverride>

  return (
    typeof candidate.thumbnailImage === 'string' &&
    typeof candidate.previewImage === 'string' &&
    typeof candidate.thumbnailAltText === 'string'
  )
}

function readCourseMediaState(): CourseMediaState {
  if (typeof window === 'undefined') {
    return createEmptyCourseMediaState()
  }

  const rawValue = window.localStorage.getItem(courseMediaStorageKey)
  if (!rawValue) {
    return createEmptyCourseMediaState()
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown
    if (!parsedValue || typeof parsedValue !== 'object') {
      return createEmptyCourseMediaState()
    }

    const recordValue = parsedValue as Record<string, unknown>
    const overrides = recordValue.overrides
    const slugToCourseKey = recordValue.slugToCourseKey

    if (overrides && typeof overrides === 'object' && slugToCourseKey && typeof slugToCourseKey === 'object') {
      return {
        overrides: Object.fromEntries(
          Object.entries(overrides).filter(([, value]) => isCourseMediaOverride(value))
        ) as Record<string, CourseMediaOverride>,
        slugToCourseKey: Object.fromEntries(
          Object.entries(slugToCourseKey).filter(
            ([slug, courseKey]) => typeof slug === 'string' && typeof courseKey === 'string'
          )
        ) as Record<string, string>,
      }
    }

    const migratedState = createEmptyCourseMediaState()

    for (const [key, value] of Object.entries(recordValue)) {
      if (!isCourseMediaOverride(value)) {
        continue
      }

      if (/^\d+$/.test(key)) {
        migratedState.overrides[`id:${key}`] = value
        continue
      }

      migratedState.overrides[key] = value

      if (key.startsWith('slug:')) {
        migratedState.slugToCourseKey[key.slice(5)] = key
      }
    }

    return migratedState
  } catch {
    return createEmptyCourseMediaState()
  }
}

function writeCourseMediaState(value: CourseMediaState) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(courseMediaStorageKey, JSON.stringify(value))
}

export function getCourseMediaOverride(courseId: number | string) {
  const courseMediaState = readCourseMediaState()
  return (
    courseMediaState.overrides[`id:${String(courseId)}`] ??
    courseMediaState.overrides[String(courseId)] ??
    null
  )
}

export function getCourseMediaOverrideForCourse(courseId: number | string, title: string) {
  const courseMediaState = readCourseMediaState()
  const courseKey = `id:${String(courseId)}`
  const slugKey = slugify(title)
  const aliasedCourseKey = courseMediaState.slugToCourseKey[slugKey]

  return (
    courseMediaState.overrides[courseKey] ??
    courseMediaState.overrides[aliasedCourseKey] ??
    courseMediaState.overrides[`slug:${slugKey}`] ??
    courseMediaState.overrides[String(courseId)] ??
    null
  )
}

export function getAllCourseMediaOverrides() {
  return readCourseMediaState().overrides
}

export function setCourseMediaOverride(courseId: number | string, title: string, value: CourseMediaOverride) {
  const courseMediaState = readCourseMediaState()
  const hasMedia = Boolean(value.thumbnailImage || value.previewImage || value.thumbnailAltText)
  const idKey = `id:${String(courseId)}`
  const legacyIdKey = String(courseId)
  const slugKey = slugify(title)

  for (const [savedSlug, savedCourseKey] of Object.entries(courseMediaState.slugToCourseKey)) {
    if (savedCourseKey === idKey) {
      delete courseMediaState.slugToCourseKey[savedSlug]
      delete courseMediaState.overrides[`slug:${savedSlug}`]
    }
  }

  delete courseMediaState.overrides[legacyIdKey]

  if (hasMedia) {
    courseMediaState.overrides[idKey] = value
    courseMediaState.slugToCourseKey[slugKey] = idKey
  } else {
    delete courseMediaState.overrides[idKey]
    delete courseMediaState.slugToCourseKey[slugKey]
  }

  writeCourseMediaState(courseMediaState)
}

export function clearCourseMediaOverride(courseId: number | string, title: string) {
  const courseMediaState = readCourseMediaState()
  const idKey = `id:${String(courseId)}`
  const legacyIdKey = String(courseId)
  const slugKey = slugify(title)
  const aliasedCourseKey = courseMediaState.slugToCourseKey[slugKey]

  delete courseMediaState.overrides[idKey]
  delete courseMediaState.overrides[legacyIdKey]
  delete courseMediaState.overrides[`slug:${slugKey}`]
  if (aliasedCourseKey) {
    delete courseMediaState.overrides[aliasedCourseKey]
  }
  delete courseMediaState.slugToCourseKey[slugKey]

  for (const [savedSlug, savedCourseKey] of Object.entries(courseMediaState.slugToCourseKey)) {
    if (savedCourseKey === idKey || savedCourseKey === aliasedCourseKey) {
      delete courseMediaState.slugToCourseKey[savedSlug]
      delete courseMediaState.overrides[`slug:${savedSlug}`]
    }
  }

  writeCourseMediaState(courseMediaState)
}

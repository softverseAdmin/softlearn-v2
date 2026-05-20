import { BookOpen, Clock3, FileVideo, Image as ImageIcon, PlayCircle, Rows3, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

import { editorCardClassName, formatCompactNumber, formatLabel } from './shared'

function formatPreviewDuration(minutes: number | null) {
  if (!minutes || minutes <= 0) {
    return 'Not set'
  }

  if (minutes < 60) {
    return `${minutes} min preview`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours}h preview`
  }

  return `${hours}h ${remainingMinutes}m preview`
}

type CoursePreviewHeroProps = {
  previewThumbnailImage: string
  previewTitle: string
  previewDescription: string
  learnerCount: number
  previewDuration: number | null
  previewAccessType: string
  previewStatus: string
  courseTags: string[]
  mode: 'create' | 'edit'
  courseId?: string
  lessonsHref?: string | null
  saving: boolean
  onBack: () => void
}

export function CoursePreviewHero({
  previewThumbnailImage,
  previewTitle,
  previewDescription,
  learnerCount,
  previewDuration,
  previewAccessType,
  previewStatus,
  courseTags,
  mode,
  courseId,
  lessonsHref,
  saving,
  onBack,
}: CoursePreviewHeroProps) {
  return (
    <section className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className="h-52 overflow-hidden rounded-xl bg-slate-950 shadow">
        {previewThumbnailImage ? (
          <img
            src={previewThumbnailImage}
            alt={previewTitle || 'Course preview image'}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-6 text-white">
            <div className="text-center">
              <ImageIcon className="mx-auto h-12 w-12 text-cyan-300" />
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-200">Preview media</p>
              <p className="mt-2 text-lg font-semibold">{previewTitle || 'Add preview artwork'}</p>
            </div>
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Course preview</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900 lg:text-4xl dark:text-slate-100">
          {previewTitle || 'Preview title'}
        </h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-500 dark:text-slate-400">
          {previewDescription || 'Add the learner-facing preview summary here.'}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            {formatCompactNumber(learnerCount)} learners
          </span>
          <span className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            {formatPreviewDuration(previewDuration)}
          </span>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
            {previewAccessType ? formatLabel(previewAccessType) : 'Access not set'}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 dark:bg-slate-900 dark:text-slate-300">
            {previewStatus ? formatLabel(previewStatus) : 'Draft'}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {courseTags.length > 0 ? (
            courseTags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-slate-100 px-3 py-1 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="rounded-md bg-slate-100 px-3 py-1 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">
              Add category and level details
            </span>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <Button
            type="submit"
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 hover:text-white"
            disabled={saving}
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            {saving ? 'Saving…' : mode === 'edit' ? 'Update course' : 'Create course'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="rounded-xl border-slate-200 px-6 py-3 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
            onClick={onBack}
          >
            Back to courses
          </Button>
          {mode === 'edit' && courseId && lessonsHref ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-slate-200 px-6 py-3 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
              asChild
            >
              <Link to={lessonsHref}>Lessons</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  )
}

type CoursePreviewSidebarProps = {
  courseStatus: string
  previewStatus: string
  previewDuration: number | null
  previewAccessType: string
  previewVideoUrl: string
  previewOrder: string
  populatedLessonCount: number
  lessonsLength: number
  previewTitle: string
  previewDescription: string
  category: string
  courseLevel: string
  previewThumbnailImage: string
  mode: 'create' | 'edit'
  saving: boolean
  onBack: () => void
  onRetire: () => void
}

export function CoursePreviewSidebar({
  courseStatus,
  previewStatus,
  previewDuration,
  previewAccessType,
  previewVideoUrl,
  previewOrder,
  populatedLessonCount,
  lessonsLength,
  previewTitle,
  previewDescription,
  category,
  courseLevel,
  previewThumbnailImage,
  mode,
  saving,
  onBack,
  onRetire,
}: CoursePreviewSidebarProps) {
  const hasPreviewFoundation = previewTitle.trim() && previewDescription.trim()
  const hasPreviewMedia = previewThumbnailImage.trim()
  const hasPreviewVideo = previewVideoUrl.trim()

  return (
    <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
      <section className={editorCardClassName}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Preview snapshot</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Live summary of the dedicated course preview content you are saving.
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
            {previewStatus ? formatLabel(previewStatus) : 'Draft'}
          </span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Preview duration</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {formatPreviewDuration(previewDuration)}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Preview access</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {previewAccessType ? formatLabel(previewAccessType) : 'Not set'}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <Rows3 className="h-5 w-5 text-violet-600" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Preview order</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{previewOrder || 'Not set'}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <FileVideo className="h-5 w-5 text-amber-600" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Preview video</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{hasPreviewVideo ? 'Ready' : 'Missing'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
          <p className="font-semibold text-slate-900 dark:text-slate-100">Course context</p>
          <p className="mt-2">{category.trim() ? formatLabel(category) : 'Category not set'}</p>
          <p className="mt-1">{courseLevel.trim() ? formatLabel(courseLevel) : 'Level not set'}</p>
          <p className="mt-1">Course status: {courseStatus ? formatLabel(courseStatus) : 'Draft'}</p>
          <p className="mt-1">Lessons tracked: {populatedLessonCount || lessonsLength}</p>
        </div>
      </section>

      <section className={editorCardClassName}>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Publishing checklist</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p className="flex items-center justify-between gap-3">
            <span>Preview title and description</span>
            <span className={hasPreviewFoundation ? 'text-emerald-600' : 'text-slate-400'}>
              {hasPreviewFoundation ? 'Ready' : 'Missing'}
            </span>
          </p>
          <p className="flex items-center justify-between gap-3">
            <span>Preview media</span>
            <span className={hasPreviewMedia ? 'text-emerald-600' : 'text-slate-400'}>{hasPreviewMedia ? 'Ready' : 'Missing'}</span>
          </p>
          <p className="flex items-center justify-between gap-3">
            <span>Preview video</span>
            <span className={hasPreviewVideo ? 'text-emerald-600' : 'text-slate-400'}>{hasPreviewVideo ? 'Ready' : 'Missing'}</span>
          </p>
          <p className="flex items-center justify-between gap-3">
            <span>Catalog positioning</span>
            <span className={category.trim() && courseLevel.trim() ? 'text-emerald-600' : 'text-slate-400'}>
              {category.trim() && courseLevel.trim() ? 'Ready' : 'Missing'}
            </span>
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <Button type="submit" className="rounded-xl bg-blue-600 text-white hover:bg-blue-700 hover:text-white" disabled={saving}>
            {saving ? 'Saving…' : mode === 'edit' ? 'Update course' : 'Create course'}
          </Button>
          <Button type="button" variant="outline" className="rounded-xl" onClick={onBack}>
            Back to courses
          </Button>
          {mode === 'edit' ? (
            <Button type="button" variant="destructive" className="rounded-xl" onClick={onRetire} disabled={saving}>
              Retire
            </Button>
          ) : null}
        </div>
      </section>
    </aside>
  )
}

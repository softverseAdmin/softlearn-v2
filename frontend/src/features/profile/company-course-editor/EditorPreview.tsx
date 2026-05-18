import { BookOpen, Clock3, FileText, PlayCircle, Star, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

import { editorCardClassName, formatCompactNumber, formatDuration, formatLabel } from './shared'

type CoursePreviewHeroProps = {
  thumbnailImage: string
  thumbnailAltText: string
  previewTitle: string
  previewDescription: string
  learnerCount: number
  estimatedHours: number
  courseTags: string[]
  mode: 'create' | 'edit'
  courseId?: string
  saving: boolean
  onBack: () => void
}

export function CoursePreviewHero({
  thumbnailImage,
  thumbnailAltText,
  previewTitle,
  previewDescription,
  learnerCount,
  estimatedHours,
  courseTags,
  mode,
  courseId,
  saving,
  onBack,
}: CoursePreviewHeroProps) {
  return (
    <section className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
      <div className="h-52 overflow-hidden rounded-xl bg-slate-950 shadow">
        {thumbnailImage ? (
          <img
            src={thumbnailImage}
            alt={thumbnailAltText || `${previewTitle} cover`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
            <div className="text-center">
              <div className="mb-3 text-6xl text-cyan-400">⚛</div>
              <h2 className="text-3xl font-bold">
                {previewTitle.split(' ').slice(0, 1).join(' ') || 'Course'}{' '}
                <span className="rounded bg-blue-600 px-2">
                  {previewTitle.split(' ').slice(1, 2).join(' ') || 'Design'}
                </span>
              </h2>
              <p className="mt-1 text-xl">{previewTitle.split(' ').slice(2).join(' ') || 'Blueprint'}</p>
            </div>
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Build course preview</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900 lg:text-4xl dark:text-slate-100">{previewTitle}</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-500 dark:text-slate-400">{previewDescription}</p>

        <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-current text-amber-400" />
            <span className="text-slate-900 dark:text-slate-100">No ratings yet</span>
          </span>
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            {formatCompactNumber(learnerCount)} learners
          </span>
          <span className="flex items-center gap-2">
            <Clock3 className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            {formatDuration(estimatedHours)}
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
              Add category, level, and format details
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
          {mode === 'edit' && courseId ? (
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-slate-200 px-6 py-3 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
              asChild
            >
              <Link to={`/company/courses/${courseId}/lessons`}>Lessons</Link>
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  )
}

type CoursePreviewSidebarProps = {
  status: string
  estimatedHours: number
  lessonsWithTranscriptCount: number
  populatedLessonCount: number
  lessonsLength: number
  learningHighlights: string[]
  title: string
  shortDescription: string
  fullDescription: string
  category: string
  courseLevel: string
  thumbnailImage: string
  mode: 'create' | 'edit'
  saving: boolean
  onBack: () => void
  onRetire: () => void
}

export function CoursePreviewSidebar({
  status,
  estimatedHours,
  lessonsWithTranscriptCount,
  populatedLessonCount,
  lessonsLength,
  learningHighlights,
  title,
  shortDescription,
  fullDescription,
  category,
  courseLevel,
  thumbnailImage,
  mode,
  saving,
  onBack,
  onRetire,
}: CoursePreviewSidebarProps) {
  return (
    <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
      <section className={editorCardClassName}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Course snapshot</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Live summary of what learners will see on the course detail page.
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
            {status ? formatLabel(status) : 'Draft'}
          </span>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Duration</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{formatDuration(estimatedHours)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-violet-600" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Transcripts</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{lessonsWithTranscriptCount} ready</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Lessons</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100">{populatedLessonCount || lessonsLength}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">What learners get</p>
          <div className="space-y-3">
            {learningHighlights.length > 0 ? (
              learningHighlights.map((item) => (
                <p key={item} className="flex gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
                    ✓
                  </span>
                  <span>{item}</span>
                </p>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Add descriptions, technologies, transcripts, or lessons to build out the learner promise.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className={editorCardClassName}>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Publishing checklist</h2>
        <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p className="flex items-center justify-between gap-3">
            <span>Title and description</span>
            <span className={title.trim() && (shortDescription.trim() || fullDescription.trim()) ? 'text-emerald-600' : 'text-slate-400'}>
              {title.trim() && (shortDescription.trim() || fullDescription.trim()) ? 'Ready' : 'Missing'}
            </span>
          </p>
          <p className="flex items-center justify-between gap-3">
            <span>Category and level</span>
            <span className={category.trim() && courseLevel.trim() ? 'text-emerald-600' : 'text-slate-400'}>
              {category.trim() && courseLevel.trim() ? 'Ready' : 'Missing'}
            </span>
          </p>
          <p className="flex items-center justify-between gap-3">
            <span>Cover media</span>
            <span className={thumbnailImage ? 'text-emerald-600' : 'text-slate-400'}>
              {thumbnailImage ? 'Ready' : 'Optional'}
            </span>
          </p>
          <p className="flex items-center justify-between gap-3">
            <span>Lesson outline</span>
            <span className={populatedLessonCount > 0 ? 'text-emerald-600' : 'text-slate-400'}>
              {populatedLessonCount > 0 ? 'Ready' : 'Draft'}
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

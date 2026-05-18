import { useEffect, useMemo, useState } from 'react'
import { MessageSquareText, Star, Users } from 'lucide-react'

import { ApiError, apiRequest } from '../../lib/api'
import type { CourseDetailResponse, StudentCourseReviewResponse } from './types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

type CourseReviewSectionProps = {
  course: Pick<
    CourseDetailResponse,
    'course_id' | 'average_rating' | 'rating_count' | 'reviews' | 'current_user_review' | 'learning_record_count' | 'enrollment'
  >
  csrfToken: string | null
  onReviewSaved: () => Promise<void> | void
  compact?: boolean
}

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

function formatReviewTimestamp(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function renderStars(rating: number, activeColorClassName: string, inactiveColorClassName: string) {
  return Array.from({ length: 5 }, (_, index) => {
    const filled = index < rating
    return (
      <Star
        key={index}
        className={cn('h-4 w-4', filled ? `fill-current ${activeColorClassName}` : inactiveColorClassName)}
      />
    )
  })
}

function getReviewInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function CourseReviewSection({ course, csrfToken, onReviewSaved, compact = false }: CourseReviewSectionProps) {
  const [rating, setRating] = useState(course.current_user_review?.rating ?? 0)
  const [reviewText, setReviewText] = useState(course.current_user_review?.review_text ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setRating(course.current_user_review?.rating ?? 0)
    setReviewText(course.current_user_review?.review_text ?? '')
    setError(null)
  }, [course.current_user_review])

  const reviewSummaryLabel = useMemo(() => {
    if (course.rating_count <= 0 || course.average_rating === null) {
      return 'No ratings yet'
    }

    return `${course.average_rating.toFixed(1)} average rating`
  }, [course.average_rating, course.rating_count])

  async function handleSubmitReview() {
    if (!course.enrollment.is_enrolled || rating < 1) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      await apiRequest<StudentCourseReviewResponse>(`/student/courses/${course.course_id}/review`, {
        method: 'POST',
        body: {
          rating,
          review_text: reviewText,
        },
        csrfToken,
      })
      await onReviewSaved()
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to save your review.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Ratings & reviews</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Share what helped most in this course and read feedback from other learners.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700 dark:bg-amber-950/60 dark:text-amber-200">
            <Star className={cn('h-4 w-4', course.rating_count > 0 && 'fill-current')} />
            {reviewSummaryLabel}
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 dark:bg-slate-900">
            <Users className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            {formatCompactNumber(course.learning_record_count)} learners
          </span>
        </div>
      </div>

      <div className={cn('grid gap-5', !compact && 'xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]')}>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Your review</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {course.current_user_review ? 'Update your rating anytime.' : 'Rate the course once you have started learning.'}
              </p>
            </div>
            {course.current_user_review ? (
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Updated {formatReviewTimestamp(course.current_user_review.updated_at)}
              </span>
            ) : null}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {Array.from({ length: 5 }, (_, index) => {
              const starValue = index + 1
              const isActive = starValue <= rating
              return (
                <button
                  key={starValue}
                  type="button"
                  className={cn(
                    'inline-flex h-11 w-11 items-center justify-center rounded-xl border transition-colors',
                    isActive
                      ? 'border-amber-300 bg-amber-50 text-amber-500 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'border-slate-200 bg-white text-slate-300 hover:border-slate-300 hover:text-amber-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-600 dark:hover:border-slate-700'
                  )}
                  onClick={() => setRating(starValue)}
                  disabled={!course.enrollment.is_enrolled || saving}
                  aria-label={`Rate this course ${starValue} star${starValue === 1 ? '' : 's'}`}
                >
                  <Star className={cn('h-5 w-5', isActive && 'fill-current')} />
                </button>
              )
            })}
          </div>

          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            {rating > 0 ? `${rating} star${rating === 1 ? '' : 's'} selected` : 'Choose a star rating to get started.'}
          </p>

          <div className="mt-4">
            <Textarea
              rows={5}
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              placeholder="What stood out in this course? What could help future learners?"
              disabled={!course.enrollment.is_enrolled || saving}
            />
          </div>

          {!course.enrollment.is_enrolled ? (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Enroll in the course to leave a rating and review.</p>
          ) : null}

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              {error}
            </div>
          ) : null}

          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              className="rounded-xl bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
              onClick={() => void handleSubmitReview()}
              disabled={!course.enrollment.is_enrolled || rating < 1 || saving}
            >
              {saving ? 'Saving...' : course.current_user_review ? 'Update review' : 'Submit review'}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {course.reviews.length > 0 ? (
            course.reviews.map((review) => (
              <article
                key={review.review_id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    {getReviewInitials(review.student_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                          {review.student_name}
                          {review.is_current_user ? <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">(You)</span> : null}
                        </p>
                        <div className="mt-1 flex items-center gap-1">
                          {renderStars(review.rating, 'text-amber-400', 'text-slate-300 dark:text-slate-700')}
                        </div>
                      </div>
                      <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                        {formatReviewTimestamp(review.updated_at)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {review.review_text || 'Left a rating without additional comments.'}
                    </p>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
              <div className="flex items-center gap-3">
                <MessageSquareText className="h-5 w-5 text-slate-400 dark:text-slate-500" />
                <span>No reviews yet. Be the first learner to rate this course.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

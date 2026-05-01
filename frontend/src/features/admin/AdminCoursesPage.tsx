import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { AdminCourseRecord, AdminCoursesResponse } from './types'

const emptyCoursesResponse: AdminCoursesResponse = {
  courses: [],
}

export function AdminCoursesPage() {
  const { csrfToken } = useAuth()
  const [data, setData] = useState<AdminCoursesResponse>(emptyCoursesResponse)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [difficultyLevel, setDifficultyLevel] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('0')
  const [status, setStatus] = useState('draft')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const selectedCourse = useMemo(
    () => data.courses.find((course) => course.course_id === selectedCourseId) ?? null,
    [data.courses, selectedCourseId],
  )

  useEffect(() => {
    let active = true

    async function loadCourses() {
      try {
        const response = await apiRequest<AdminCoursesResponse>('/admin/courses')
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load courses.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadCourses()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!selectedCourse) {
      setTitle('')
      setDescription('')
      setCategory('')
      setDifficultyLevel('')
      setEstimatedHours('0')
      setStatus('draft')
      return
    }

    setTitle(selectedCourse.title)
    setDescription(selectedCourse.description)
    setCategory(selectedCourse.category)
    setDifficultyLevel(selectedCourse.difficulty_level)
    setEstimatedHours(String(selectedCourse.estimated_hours))
    setStatus(selectedCourse.status)
  }, [selectedCourse])

  async function refreshCourses() {
    const response = await apiRequest<AdminCoursesResponse>('/admin/courses')
    setData(response)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const body = {
        title,
        description,
        category,
        difficulty_level: difficultyLevel,
        estimated_hours: Number(estimatedHours),
        status,
      }

      if (selectedCourse) {
        await apiRequest<AdminCourseRecord>(`/admin/courses/${selectedCourse.course_id}`, {
          method: 'PUT',
          body,
          csrfToken,
        })
        setSuccess('Course updated successfully.')
      } else {
        await apiRequest<AdminCourseRecord>('/admin/courses', {
          method: 'POST',
          body,
          csrfToken,
        })
        setSuccess('Course created successfully.')
      }

      await refreshCourses()
      if (!selectedCourse) {
        setSelectedCourseId(null)
      }
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to save course.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate(courseId: number) {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await apiRequest<AdminCourseRecord>(`/admin/courses/${courseId}`, {
        method: 'DELETE',
        csrfToken,
      })
      await refreshCourses()
      if (selectedCourseId === courseId) {
        setSelectedCourseId(null)
      }
      setSuccess('Course retired successfully.')
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to retire course.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <section className="page"><div className="card">Loading courses…</div></section>
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Admin courses</p>
          <h1>Course management</h1>
          <p className="lead">Create, update, and deactivate shared course records used across learning flows.</p>
        </div>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}
      {success ? <div className="card form-success">{success}</div> : null}

      <div className="page-split">
        <div className="card stack-card">
          <h2>{selectedCourse ? 'Edit course' : 'Create course'}</h2>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              <span>Title</span>
              <input value={title} onChange={(event) => setTitle(event.target.value)} required />
            </label>
            <label>
              <span>Description</span>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} />
            </label>
            <label>
              <span>Category</span>
              <input value={category} onChange={(event) => setCategory(event.target.value)} required />
            </label>
            <label>
              <span>Difficulty level</span>
              <input value={difficultyLevel} onChange={(event) => setDifficultyLevel(event.target.value)} />
            </label>
            <label>
              <span>Estimated hours</span>
              <input
                type="number"
                min={0}
                value={estimatedHours}
                onChange={(event) => setEstimatedHours(event.target.value)}
                required
              />
            </label>
            <label>
              <span>Status</span>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>
            <div className="actions">
              <button className="primary-button inline-button" type="submit" disabled={saving}>
                {saving ? 'Saving…' : selectedCourse ? 'Update course' : 'Create course'}
              </button>
              {selectedCourse ? (
                <button
                  className="secondary-button inline-button"
                  type="button"
                  onClick={() => setSelectedCourseId(null)}
                  disabled={saving}
                >
                  New course
                </button>
              ) : null}
            </div>
          </form>
        </div>

        <div className="card stack-card">
          <h2>Courses</h2>
          <div className="stack-list">
            {data.courses.map((course) => (
              <article key={course.course_id} className="skill-card">
                <div className="skill-card-header">
                  <div>
                    <h3>{course.title}</h3>
                    <p className="muted">
                      {course.category} {course.difficulty_level ? `· ${course.difficulty_level}` : ''} · {course.estimated_hours}h
                    </p>
                  </div>
                  <span className={`status-pill ${course.status === 'active' ? 'status-success' : 'status-muted'}`}>
                    {course.status}
                  </span>
                </div>
                <p className="muted">{course.description || 'No description yet.'}</p>
                <p className="muted">{course.lesson_count} lessons · {course.learning_record_count} linked learning records</p>
                <div className="actions">
                  <button className="secondary-button inline-button" type="button" onClick={() => setSelectedCourseId(course.course_id)}>
                    Edit
                  </button>
                  <Link className="secondary-button inline-button" to={`/admin/courses/${course.course_id}/lessons`}>
                    Lessons
                  </Link>
                  {course.status !== 'inactive' ? (
                    <button
                      className="danger-button inline-button"
                      type="button"
                      onClick={() => void handleDeactivate(course.course_id)}
                      disabled={saving}
                    >
                      Retire
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
            {data.courses.length === 0 ? <p className="muted">No courses yet.</p> : null}
          </div>
        </div>
      </div>
    </section>
  )
}

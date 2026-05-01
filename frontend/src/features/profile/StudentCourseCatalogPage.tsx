import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { ApiError, apiRequest } from '../../lib/api'
import type { CourseCatalogResponse } from './types'

const emptyCatalog: CourseCatalogResponse = {
  result_count: 0,
  courses: [],
}

export function StudentCourseCatalogPage() {
  const [data, setData] = useState<CourseCatalogResponse>(emptyCatalog)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadCourses() {
      try {
        const response = await apiRequest<CourseCatalogResponse>('/student/courses')
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load course catalog.')
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

  if (loading) {
    return <section className="page"><div className="card">Loading course catalog…</div></section>
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Student courses</p>
          <h1>Course catalog</h1>
          <p className="lead">Browse active learning content and open any course for more detail before later enrollment or lesson steps.</p>
        </div>
        <div className="card compact-card">
          <strong>Catalog size</strong>
          <p className="muted">{data.result_count} available courses</p>
        </div>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}

      <div className="card stack-card">
        <h2>Available courses</h2>
        {data.courses.length === 0 ? <p className="muted">No active courses are available yet.</p> : null}
        <div className="stack-list">
          {data.courses.map((course) => (
            <article key={course.course_id} className="skill-card">
              <div className="skill-card-header">
                <div>
                  <h3>{course.title}</h3>
                  <p className="muted">
                    {course.category}
                    {course.difficulty_level ? ` · ${course.difficulty_level}` : ''}
                    {course.estimated_hours > 0 ? ` · ${course.estimated_hours}h` : ''}
                    {course.lesson_count > 0 ? ` · ${course.lesson_count} lessons` : ''}
                  </p>
                </div>
                <span className={`status-pill ${course.is_enrolled ? 'status-success' : 'status-muted'}`}>
                  {course.is_enrolled ? course.enrollment_status?.replace('_', ' ') ?? 'enrolled' : 'available'}
                </span>
              </div>
              <p>{course.description || 'No course description yet.'}</p>
              {course.readiness_cues.length > 0 ? (
                <ul className="feature-list">
                  {course.readiness_cues.map((cue) => (
                    <li key={cue}>{cue}</li>
                  ))}
                </ul>
              ) : null}
              {course.progress_percent !== null ? <p className="muted">Progress: {course.progress_percent}%</p> : null}
              <div className="actions">
                <Link className="secondary-button inline-button" to={`/student/courses/${course.course_id}`}>
                  View details
                </Link>
                <Link className="primary-button inline-button" to={course.next_step_href}>
                  {course.next_step_label}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

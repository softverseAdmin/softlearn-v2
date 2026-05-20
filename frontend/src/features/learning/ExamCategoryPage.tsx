import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { LoadingState } from '@/components/LoadingIndicator'
import { ApiError, apiRequest } from '../../lib/api'
import type { ExamCategory, Exam } from './types'

interface CategoryWithExams extends ExamCategory {
  exams?: Exam[]
  exam_count?: number
}

export function ExamCategoryPage() {
  const [categories, setCategories] = useState<CategoryWithExams[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadCategories() {
      try {
        const response = await apiRequest<{ categories: CategoryWithExams[] }>('/exam-categories/')
        if (active) {
          setCategories(response.categories)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load categories.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadCategories()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <section className="page">
        <div className="card">
          <LoadingState title="Loading categories" className="min-h-40" />
        </div>
      </section>
    )
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Exam preparation</p>
          <h1>Exam categories</h1>
          <p className="lead">Choose an exam category to begin preparation with practice questions and mock exams.</p>
        </div>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}

      {categories.length === 0 ? (
        <div className="card">
          <p className="muted">No exam categories available yet.</p>
        </div>
      ) : (
        <div className="card-grid">
          {categories.map((category) => (
            <article key={category.id} className="card info-card">
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                📚
              </div>
              <h2>{category.name}</h2>
              {category.description ? (
                <p className="muted">{category.description}</p>
              ) : null}
              <p className="muted">Exam count: {category.exam_count || 0}</p>
              <Link
                className="primary-button inline-button"
                to={`/learning/practice/${category.id}`}
                style={{ marginTop: '1rem' }}
              >
                Start practice
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

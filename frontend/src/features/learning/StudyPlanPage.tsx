import { useEffect, useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { StudyPlan, StudyPlanItem } from './types'
import { LoadingState } from '@/components/LoadingIndicator'

interface StudyPlanResponse {
  plan: StudyPlan
  items: StudyPlanItem[]
}

export function StudyPlanPage() {
  const { csrfToken } = useAuth()
  const [plan, setPlan] = useState<StudyPlan | null>(null)
  const [items, setItems] = useState<StudyPlanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadStudyPlan() {
      try {
        const response = await apiRequest<StudyPlanResponse>('/student/study-plan')
        if (active) {
          setPlan(response.plan)
          setItems(response.items)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load study plan.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadStudyPlan()
    return () => {
      active = false
    }
  }, [])

  async function handleCompleteItem(itemId: number) {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await apiRequest(`/student/study-plan-items/${itemId}/complete/`, {
        method: 'PUT',
        body: {},
        csrfToken,
      })
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                completed: true,
                completion_date: new Date().toISOString().split('T')[0],
              }
            : item
        )
      )
      setSuccess('Item marked as complete!')
    } catch (submitError) {
      setError(submitError instanceof ApiError ? submitError.message : 'Unable to update item.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <section className="page">
        <div className="card">
          <LoadingState title="Loading study plan" className="min-h-40" />
        </div>
      </section>
    )
  }

  if (!plan || items.length === 0) {
    return (
      <section className="page">
        <div className="page-header">
          <div>
            <p className="eyebrow">Study plan</p>
            <h1>Your study plan</h1>
            <p className="lead">Follow this personalized study plan to prepare for your exam.</p>
          </div>
        </div>
        <div className="card">
          <p className="muted">No study plan available yet. Start by taking a practice question or mock exam.</p>
        </div>
      </section>
    )
  }

  const completedCount = items.filter((item) => item.completed).length
  const completionPercent = items.length > 0 ? (completedCount / items.length) * 100 : 0

  const itemTypeLabels: Record<string, string> = {
    lesson: '📚 Course Lesson',
    practice: '❓ Practice Questions',
    mock: '🎯 Mock Exam',
    reading: '📖 Reading Material',
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Study plan</p>
          <h1>Your study plan for {plan.exam_title}</h1>
          <p className="lead">Follow this personalized study plan to prepare for your exam.</p>
        </div>
        <div className="card compact-card">
          <strong>Progress</strong>
          <p className="muted">{completedCount} of {items.length} completed</p>
        </div>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}
      {success ? <div className="card" style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', color: '#16a34a' }}>{success}</div> : null}

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ width: '100%', height: '12px', backgroundColor: '#e5e7eb', borderRadius: '6px' }}>
          <div
            style={{
              width: `${completionPercent}%`,
              height: '100%',
              backgroundColor: '#6366f1',
              borderRadius: '6px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.875rem', color: '#6b7280' }}>
          {completedCount} of {items.length} items completed ({Math.round(completionPercent)}%)
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {items.map((item) => (
          <div
            key={item.id}
            className="card"
            style={{
              opacity: item.completed ? 0.7 : 1,
              borderLeft: `4px solid ${item.completed ? '#16a34a' : '#6366f1'}`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => !item.completed && void handleCompleteItem(item.id)}
                    disabled={item.completed || saving}
                    style={{ cursor: 'pointer' }}
                  />
                  <strong>{itemTypeLabels[item.item_type] || item.item_type}</strong>
                  {item.completed && (
                    <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓ Completed</span>
                  )}
                </div>
                <p className="muted" style={{ margin: '0.25rem 0' }}>
                  Order: #{item.order}
                </p>
                {item.completion_date ? (
                  <p className="muted" style={{ margin: '0.25rem 0' }}>
                    Completed: {new Date(item.completion_date).toLocaleDateString()}
                  </p>
                ) : null}
              </div>
              {!item.completed && (
                <button
                  className="secondary-button"
                  onClick={() => void handleCompleteItem(item.id)}
                  disabled={saving}
                  style={{ marginLeft: '1rem' }}
                >
                  {saving ? 'Marking…' : 'Mark as done'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {completionPercent === 100 && (
        <div
          className="card"
          style={{
            marginTop: '2rem',
            backgroundColor: '#f0fdf4',
            border: '2px solid #86efac',
            textAlign: 'center',
            padding: '2rem',
          }}
        >
          <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: '#16a34a' }}>
            🎉 Study plan completed!
          </p>
          <p className="muted">You've completed all recommended study items. Take a full mock exam to assess your readiness.</p>
        </div>
      )}
    </section>
  )
}

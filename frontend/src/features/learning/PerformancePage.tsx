import { useEffect, useState } from 'react'
import { ApiError, apiRequest } from '../../lib/api'
import type { StudentPerformanceMetric } from './types'

interface PerformanceResponse {
  metrics: StudentPerformanceMetric[]
}

interface ExamPerformance {
  exam_id: number
  exam_title: string
  category: string
  metrics: Record<string, number>
  trend: Record<string, 'up' | 'stable' | 'down'>
}

export function PerformancePage() {
  const [metrics, setMetrics] = useState<StudentPerformanceMetric[]>([])
  const [exams, setExams] = useState<ExamPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadPerformance() {
      try {
        const response = await apiRequest<PerformanceResponse>('/student/performance/')
        if (active) {
          setMetrics(response.metrics)
          
          // Group metrics by exam
          const examMap = new Map<number, ExamPerformance>()
          response.metrics.forEach((metric) => {
            if (!examMap.has(metric.exam_id)) {
              examMap.set(metric.exam_id, {
                exam_id: metric.exam_id,
                exam_title: '',
                category: '',
                metrics: {},
                trend: {},
              })
            }
            const exam = examMap.get(metric.exam_id)!
            exam.metrics[metric.metric_type] = metric.value
            if (metric.trend) {
              exam.trend[metric.metric_type] = metric.trend
            }
          })
          setExams(Array.from(examMap.values()))
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load performance data.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadPerformance()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return (
      <section className="page">
        <div className="card">Loading performance metrics…</div>
      </section>
    )
  }

  const metricLabels: Record<string, string> = {
    exam_attempts: 'Total Exam Attempts',
    average_score: 'Average Score',
    best_score: 'Best Score',
    improvement: 'Score Improvement',
    practice_questions: 'Practice Questions Done',
    mock_exams: 'Mock Exams Done',
    time_spent: 'Hours Spent Studying',
  }

  const trendEmoji: Record<'up' | 'stable' | 'down', string> = {
    up: '📈',
    stable: '➡️',
    down: '📉',
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Performance dashboard</p>
          <h1>Your learning metrics</h1>
          <p className="lead">Track your progress across exams with detailed performance analytics.</p>
        </div>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}

      {metrics.length === 0 ? (
        <div className="card">
          <p className="muted">No performance data available yet. Complete some practice questions and mock exams to see your metrics.</p>
        </div>
      ) : (
        <>
          {/* Overall summary */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h2>Overall Performance</h2>
            <div className="card-grid" style={{ marginTop: '1rem' }}>
              {exams.map((exam) => {
                const avgScore = exam.metrics['average_score'] || 0
                const practiceCount = exam.metrics['practice_questions'] || 0
                const mockCount = exam.metrics['mock_exams'] || 0

                return (
                  <div key={exam.exam_id} className="card info-card">
                    <h3 style={{ margin: '0 0 1rem 0' }}>Latest metrics</h3>
                    <div style={{ marginBottom: '1rem' }}>
                      <p className="muted" style={{ margin: '0.25rem 0' }}>Average score: <strong>{avgScore.toFixed(1)}%</strong></p>
                      <p className="muted" style={{ margin: '0.25rem 0' }}>Practice questions: <strong>{practiceCount}</strong></p>
                      <p className="muted" style={{ margin: '0.25rem 0' }}>Mock exams: <strong>{mockCount}</strong></p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Detailed metrics per exam */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {exams.map((exam) => (
              <div key={exam.exam_id} className="card">
                <h2>Exam Performance Metrics</h2>
                <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.875rem',
                  }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 'bold' }}>Metric</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>Value</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 'bold' }}>Trend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(exam.metrics).map(([metricType, value]) => {
                        const trend = exam.trend[metricType]
                        return (
                          <tr key={metricType} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '0.75rem' }}>{metricLabels[metricType] || metricType}</td>
                            <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 'bold' }}>
                              {typeof value === 'number' && metricType.includes('score')
                                ? `${value.toFixed(1)}%`
                                : Math.round(value)}
                            </td>
                            <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                              {trend ? trendEmoji[trend] : '—'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="card" style={{ marginTop: '2rem', backgroundColor: '#fef3c7', border: '1px solid #fcd34d' }}>
            <h2 style={{ margin: '0 0 1rem 0' }}>💡 Recommendations</h2>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              {exams.some((exam) => exam.metrics['practice_questions'] < 10) && (
                <li style={{ marginBottom: '0.5rem' }}>
                  Increase practice question attempts to strengthen your knowledge in weak areas.
                </li>
              )}
              {exams.some((exam) => exam.metrics['mock_exams'] < 3) && (
                <li style={{ marginBottom: '0.5rem' }}>
                  Take more mock exams to get familiar with the actual test format and timing.
                </li>
              )}
              {exams.some((exam) => exam.metrics['average_score'] < 70) && (
                <li style={{ marginBottom: '0.5rem' }}>
                  Focus on topics where you're scoring below 70%. Review explanations of incorrect answers.
                </li>
              )}
              {exams.some((exam) => exam.trend['average_score'] === 'up') && (
                <li style={{ marginBottom: '0.5rem' }}>
                  Great progress! Keep practicing to maintain your upward trend.
                </li>
              )}
            </ul>
          </div>
        </>
      )}
    </section>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'
import type { NotificationItem, NotificationsResponse } from './types'

export function NotificationsPage() {
  const { csrfToken, user } = useAuth()
  const [data, setData] = useState<NotificationsResponse>({ unread_count: 0, notifications: [] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | 'all' | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadNotifications() {
      try {
        const response = await apiRequest<NotificationsResponse>('/notifications')
        if (active) {
          setData(response)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof ApiError ? loadError.message : 'Unable to load notifications.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadNotifications()

    return () => {
      active = false
    }
  }, [])

  async function handleMarkRead(notificationId: number) {
    setSaving(notificationId)
    setError(null)

    try {
      const updated = await apiRequest<NotificationItem>(`/notifications/${notificationId}/read`, {
        method: 'POST',
        body: {},
        csrfToken,
      })
      setData((current) => ({
        unread_count: Math.max(
          0,
          current.notifications.some((item) => item.id === notificationId && !item.is_read)
            ? current.unread_count - 1
            : current.unread_count,
        ),
        notifications: current.notifications.map((item) => (item.id === notificationId ? updated : item)),
      }))
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to update notification.')
    } finally {
      setSaving(null)
    }
  }

  async function handleMarkAllRead() {
    setSaving('all')
    setError(null)

    try {
      const response = await apiRequest<NotificationsResponse>('/notifications/read-all', {
        method: 'POST',
        body: {},
        csrfToken,
      })
      setData(response)
    } catch (saveError) {
      setError(saveError instanceof ApiError ? saveError.message : 'Unable to update notifications.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <section className="page">
      <div className="page-header">
        <div>
          <p className="eyebrow">{user?.role} notifications</p>
          <h1>Notifications</h1>
          <p className="lead">Review interview and exam updates without exposing protected details outside their secure views.</p>
        </div>
        <div className="card compact-card">
          <strong>Unread</strong>
          <p className="metric">{data.unread_count}</p>
        </div>
      </div>

      {error ? <div className="card form-error">{error}</div> : null}

      <div className="card stack-card">
        <div className="actions">
          <button
            className="secondary-button inline-button"
            type="button"
            onClick={() => void handleMarkAllRead()}
            disabled={saving !== null || data.unread_count === 0}
          >
            {saving === 'all' ? 'Saving…' : 'Mark all as read'}
          </button>
        </div>
        {loading ? <p className="muted">Loading notifications…</p> : null}
        {!loading && data.notifications.length === 0 ? <p className="muted">No notifications yet.</p> : null}
        {!loading ? (
          <div className="stack-list">
            {data.notifications.map((notification) => (
              <article key={notification.id} className="skill-card">
                <div className="skill-card-header">
                  <div>
                    <h3>{notification.title}</h3>
                    <p className="muted">{notification.message}</p>
                  </div>
                  <span className={`status-pill ${notification.is_read ? 'status-muted' : 'status-success'}`}>
                    {notification.is_read ? 'Read' : 'Unread'}
                  </span>
                </div>
                <p className="muted">{new Date(notification.created_at).toLocaleString()}</p>
                {notification.actor_name ? (
                  <p className="muted">
                    Triggered by {notification.actor_name} ({notification.actor_role})
                  </p>
                ) : null}
                <div className="actions">
                  {notification.link ? (
                    <Link className="secondary-button inline-button" to={notification.link}>
                      Open
                    </Link>
                  ) : null}
                  {!notification.is_read ? (
                    <button
                      className="primary-button inline-button"
                      type="button"
                      onClick={() => void handleMarkRead(notification.id)}
                      disabled={saving !== null}
                    >
                      {saving === notification.id ? 'Saving…' : 'Mark as read'}
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

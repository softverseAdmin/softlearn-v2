import { useEffect, useState } from 'react'
import { apiRequest, ApiError } from '../../lib/api'
import { ConfirmationDialog } from '../../components/ConfirmationDialog'

interface ScheduledTask {
  id: number
  task_type: string
  task_label: string
  schedule: string
  is_active: boolean
  last_run?: string
  next_run?: string
  last_result: string
}

export function ScheduledTasksPage() {
  const [tasks, setTasks] = useState<ScheduledTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [runningTaskId, setRunningTaskId] = useState<number | null>(null)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    taskId: 0,
    taskLabel: '',
  })

  const loadTasks = async () => {
    try {
      setLoading(true)
      const data = await apiRequest<{ tasks: ScheduledTask[] }>('/admin/scheduled-tasks/')
      setTasks(data.tasks)
      setError(null)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load scheduled tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const handleToggleTask = async (taskId: number, currentActive: boolean) => {
    try {
      const payload = { is_active: !currentActive }
      await apiRequest(`/admin/scheduled-tasks/${taskId}/`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      await loadTasks()
      setSuccessMessage(`Task ${!currentActive ? 'activated' : 'deactivated'}`)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update task')
    }
  }

  const handleRunTask = async () => {
    if (confirmDialog.taskId === 0) return

    setRunningTaskId(confirmDialog.taskId)
    try {
      await apiRequest(`/admin/scheduled-tasks/${confirmDialog.taskId}/run-now/`, {
        method: 'POST',
      })
      await loadTasks()
      setSuccessMessage(`Task "${confirmDialog.taskLabel}" executed successfully`)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to execute task')
    } finally {
      setRunningTaskId(null)
      setConfirmDialog({ isOpen: false, taskId: 0, taskLabel: '' })
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never'
    const date = new Date(dateStr)
    return date.toLocaleString()
  }

  if (loading) {
    return <div className="p-6 text-center">Loading scheduled tasks...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Scheduled Tasks</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          ✓ {successMessage}
        </div>
      )}

      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Task</th>
              <th className="px-6 py-3 text-left font-semibold">Schedule</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-left font-semibold">Last Run</th>
              <th className="px-6 py-3 text-left font-semibold">Next Run</th>
              <th className="px-6 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-3">
                  <div className="font-semibold">{task.task_label}</div>
                  <div className="text-sm text-gray-600">{task.task_type}</div>
                </td>
                <td className="px-6 py-3 capitalize">{task.schedule}</td>
                <td className="px-6 py-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      task.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {task.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-3 text-sm">{formatDate(task.last_run)}</td>
                <td className="px-6 py-3 text-sm">{formatDate(task.next_run)}</td>
                <td className="px-6 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleTask(task.id, task.is_active)}
                      className={`px-3 py-1 rounded text-sm ${
                        task.is_active
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {task.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button
                      onClick={() =>
                        setConfirmDialog({
                          isOpen: true,
                          taskId: task.id,
                          taskLabel: task.task_label,
                        })
                      }
                      disabled={runningTaskId === task.id}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 disabled:opacity-50"
                    >
                      {runningTaskId === task.id ? 'Running...' : 'Run Now'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmationDialog
        isOpen={confirmDialog.isOpen}
        title="Run Scheduled Task"
        message={`Execute "${confirmDialog.taskLabel}" now? This may take a few moments.`}
        confirmLabel="Run Now"
        onConfirm={handleRunTask}
        onCancel={() => setConfirmDialog({ isOpen: false, taskId: 0, taskLabel: '' })}
        isLoading={runningTaskId === confirmDialog.taskId}
      />
    </div>
  )
}

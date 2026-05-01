import { useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { apiRequest, ApiError } from '../../lib/api'

interface AuditLog {
  id: number
  admin_user__email: string
  action_type: string
  entity_type: string
  description: string
  created_at: string
}

interface ReportData {
  report_type: string
  date_from?: string
  date_to?: string
  total_actions?: number
  total_accesses?: number
  total_modifications?: number
  action_summary?: { action_type: string; count: number }[]
  entity_summary?: { entity_type: string; count: number }[]
  top_users?: { count: number; 'admin_user__email': string }[]
  logs?: AuditLog[]
  generated_at?: string
  data_exports?: { total: number; last_30_days: number; last_90_days: number; pending: number }
  deletions?: { last_30_days: number; pending: number }
  consent?: { users_with_consent: number; users_without_consent: number }
  audit_trail?: { total_logs: number; logs_30_days: number }
}

export function ReportsPage() {
  const { csrfToken } = useAuth()
  const [activeReport, setActiveReport] = useState<'activity' | 'access' | 'content' | 'compliance'>(
    'activity'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [studentId, setStudentId] = useState('')

  const generateReport = async () => {
    try {
      setLoading(true)
      setError(null)

      let endpoint = '/admin/reports/'
      const params = new URLSearchParams()

      if (activeReport === 'activity') {
        endpoint += 'user-activity/'
        if (dateFrom) params.append('date_from', dateFrom)
        if (dateTo) params.append('date_to', dateTo)
      } else if (activeReport === 'access') {
        endpoint += 'data-access/'
        if (dateFrom) params.append('date_from', dateFrom)
        if (dateTo) params.append('date_to', dateTo)
        if (studentId) params.append('student_id', studentId)
      } else if (activeReport === 'content') {
        endpoint += 'content-modification/'
        if (dateFrom) params.append('date_from', dateFrom)
        if (dateTo) params.append('date_to', dateTo)
      } else if (activeReport === 'compliance') {
        endpoint += 'compliance/'
      }

      const url = params.toString() ? `${endpoint}?${params}` : endpoint
      const data = await apiRequest<ReportData>(url)
      setReportData(data)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const downloadAsCSV = () => {
    if (!reportData) return

    let csv = ''
    if (reportData.report_type === 'user_activity' && reportData.logs) {
      csv = 'Admin User,Action,Entity Type,Description,Date\n'
      reportData.logs.forEach(log => {
        csv += `"${log.admin_user__email}","${log.action_type}","${log.entity_type}","${log.description}","${log.created_at}"\n`
      })
    }

    if (csv) {
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `report-${activeReport}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Reports & Auditing</h1>

      {/* Report Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { id: 'activity', label: '📊 User Activity', icon: '📊' },
          { id: 'access', label: '🔍 Data Access', icon: '🔍' },
          { id: 'content', label: '📝 Content Changes', icon: '📝' },
          { id: 'compliance', label: '✓ Compliance', icon: '✓' },
        ].map(report => (
          <button
            key={report.id}
            onClick={() => {
              setActiveReport(report.id as any)
              setReportData(null)
            }}
            className={`p-4 rounded-lg border-2 transition ${
              activeReport === report.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-400'
            }`}
          >
            <div className="text-2xl mb-1">{report.icon}</div>
            <div className="font-semibold">{report.label}</div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Filters</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {(activeReport !== 'compliance') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={e => setDateFrom(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={e => setDateTo(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </>
          )}

          {activeReport === 'access' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student ID (Optional)</label>
              <input
                type="text"
                value={studentId}
                onChange={e => setStudentId(e.target.value)}
                placeholder="Leave empty for all students"
                className="w-full border rounded px-3 py-2"
              />
            </div>
          )}
        </div>

        <button
          onClick={generateReport}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Generating Report...' : 'Generate Report'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Report Results */}
      {reportData && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Report Results</h2>
            <button
              onClick={downloadAsCSV}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              📥 Download CSV
            </button>
          </div>

          {/* User Activity Report */}
          {reportData.report_type === 'user_activity' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded">
                  <div className="text-3xl font-bold text-blue-600">{reportData.total_actions}</div>
                  <div className="text-gray-600">Total Actions</div>
                </div>
                <div className="bg-blue-50 p-4 rounded">
                  <div className="text-3xl font-bold text-blue-600">
                    {reportData.action_summary?.length || 0}
                  </div>
                  <div className="text-gray-600">Action Types</div>
                </div>
                <div className="bg-blue-50 p-4 rounded">
                  <div className="text-3xl font-bold text-blue-600">
                    {reportData.top_users?.length || 0}
                  </div>
                  <div className="text-gray-600">Admin Users Active</div>
                </div>
              </div>

              {reportData.action_summary && reportData.action_summary.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Actions Breakdown</h3>
                  <div className="space-y-2">
                    {reportData.action_summary.map(item => (
                      <div key={item.action_type} className="flex justify-between items-center">
                        <span className="capitalize">{item.action_type.replace('_', ' ')}</span>
                        <span className="font-bold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reportData.logs && reportData.logs.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Recent Actions (Last 100)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-3 py-2 text-left">Admin User</th>
                          <th className="px-3 py-2 text-left">Action</th>
                          <th className="px-3 py-2 text-left">Entity</th>
                          <th className="px-3 py-2 text-left">Description</th>
                          <th className="px-3 py-2 text-left">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.logs.slice(0, 20).map((log, idx) => (
                          <tr key={idx} className="border-b">
                            <td className="px-3 py-2">{log.admin_user__email}</td>
                            <td className="px-3 py-2 capitalize">{log.action_type}</td>
                            <td className="px-3 py-2 capitalize">{log.entity_type}</td>
                            <td className="px-3 py-2">{log.description}</td>
                            <td className="px-3 py-2">{new Date(log.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Compliance Report */}
          {reportData.report_type === 'compliance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {reportData.data_exports?.total || 0}
                  </div>
                  <div className="text-gray-600">Total Data Exports</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {reportData.data_exports?.pending || 0} pending
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded">
                  <div className="text-2xl font-bold text-yellow-600">
                    {reportData.deletions?.last_30_days || 0}
                  </div>
                  <div className="text-gray-600">Deletions (30 days)</div>
                </div>
                <div className="bg-blue-50 p-4 rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {reportData.consent?.users_with_consent || 0}
                  </div>
                  <div className="text-gray-600">Users with Consent</div>
                </div>
                <div className="bg-purple-50 p-4 rounded">
                  <div className="text-2xl font-bold text-purple-600">
                    {reportData.audit_trail?.logs_30_days || 0}
                  </div>
                  <div className="text-gray-600">Audit Logs (30 days)</div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-semibold mb-2">Compliance Summary</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    ✓ Total GDPR Data Exports: {reportData.data_exports?.total || 0}
                  </li>
                  <li>
                    ✓ Deletion Requests (Last 30 days): {reportData.deletions?.last_30_days || 0}
                  </li>
                  <li>
                    ✓ Users with Consent: {reportData.consent?.users_with_consent || 0}
                  </li>
                  <li>
                    ✓ Total Audit Log Entries: {reportData.audit_trail?.total_logs || 0}
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Generic Report Info */}
          {reportData.date_from && (
            <div className="mt-6 text-xs text-gray-500">
              Report generated for {new Date(reportData.date_from).toLocaleDateString()} to{' '}
              {new Date(reportData.date_to || new Date().toISOString()).toLocaleDateString()}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

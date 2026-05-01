import { useState } from 'react'
import { useAuth } from '../../auth/useAuth'
import { ApiError, apiRequest } from '../../lib/api'

export function BulkOperationsPage() {
  const { csrfToken } = useAuth()
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import')
  const [importing, setImporting] = useState(false)
  const [importSuccess, setImportSuccess] = useState<any>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importType, setImportType] = useState<'users' | 'courses'>('users')
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  const handleDownloadTemplate = async (type: 'users' | 'courses') => {
    try {
      const endpoint = type === 'users' 
        ? '/admin/import/user-template/'
        : '/admin/import/course-template/'
      
      const response = await fetch(`/api${endpoint}`, {
        headers: { 'X-CSRFToken': csrfToken },
      })
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}-template.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setImportError(`Failed to download ${type} template`)
    }
  }

  const handleImportFile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      setImportError('Please select a file')
      return
    }

    setImporting(true)
    setImportError(null)
    setImportSuccess(null)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      
      const endpoint = importType === 'users'
        ? '/admin/import/users/'
        : '/admin/import/courses/'
      
      const response = await fetch(`/api${endpoint}`, {
        method: 'POST',
        headers: { 'X-CSRFToken': csrfToken },
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Import failed')
      }

      setImportSuccess(data)
      setSelectedFile(null)
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  const handleExportData = async (type: 'users' | 'companies' | 'courses') => {
    setExporting(true)
    setExportError(null)

    try {
      const endpoint = `/admin/export/${type}/`
      
      const response = await fetch(`/api${endpoint}`, {
        headers: { 'X-CSRFToken': csrfToken },
      })

      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${type}-export.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Bulk Operations</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('import')}
          className={`px-6 py-2 rounded font-medium ${
            activeTab === 'import'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          📥 Import Data
        </button>
        <button
          onClick={() => setActiveTab('export')}
          className={`px-6 py-2 rounded font-medium ${
            activeTab === 'export'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-800'
          }`}
        >
          📤 Export Data
        </button>
      </div>

      {activeTab === 'import' && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-2xl font-bold mb-6">Import Data from CSV</h2>

          {importError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {importError}
            </div>
          )}

          {importSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
              <h3 className="font-semibold mb-2">Import Complete!</h3>
              <ul className="list-disc list-inside">
                <li>Created: {importSuccess.created}</li>
                <li>Skipped: {importSuccess.skipped}</li>
                <li>Errors: {importSuccess.errors.length}</li>
              </ul>
              {importSuccess.errors.length > 0 && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">View Errors</summary>
                  <ul className="mt-2 list-disc list-inside text-sm">
                    {importSuccess.errors.slice(0, 10).map((err: string, i: number) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          )}

          <div className="mb-6">
            <label className="block font-medium mb-2">Import Type</label>
            <select
              value={importType}
              onChange={e => setImportType(e.target.value as 'users' | 'courses')}
              className="border rounded px-3 py-2"
            >
              <option value="users">Users</option>
              <option value="courses">Courses</option>
            </select>
          </div>

          <div className="mb-6">
            <button
              onClick={() => handleDownloadTemplate(importType)}
              className="text-blue-600 hover:underline"
            >
              📋 Download {importType === 'users' ? 'User' : 'Course'} Import Template
            </button>
            <p className="text-sm text-gray-600 mt-1">
              Use this template to ensure correct CSV format
            </p>
          </div>

          <form onSubmit={handleImportFile}>
            <div className="mb-4">
              <label className="block font-medium mb-2">Select CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                className="border rounded px-3 py-2 w-full"
              />
            </div>

            <button
              type="submit"
              disabled={!selectedFile || importing}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {importing ? 'Uploading...' : 'Upload & Import'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'export' && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-2xl font-bold mb-6">Export Data to CSV</h2>

          {exportError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {exportError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => handleExportData('users')}
              disabled={exporting}
              className="p-4 border rounded hover:bg-blue-50 disabled:opacity-50"
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="font-semibold">Users</div>
              <div className="text-sm text-gray-600">Export all users</div>
            </button>

            <button
              onClick={() => handleExportData('companies')}
              disabled={exporting}
              className="p-4 border rounded hover:bg-blue-50 disabled:opacity-50"
            >
              <div className="text-2xl mb-2">🏢</div>
              <div className="font-semibold">Companies</div>
              <div className="text-sm text-gray-600">Export all companies</div>
            </button>

            <button
              onClick={() => handleExportData('courses')}
              disabled={exporting}
              className="p-4 border rounded hover:bg-blue-50 disabled:opacity-50"
            >
              <div className="text-2xl mb-2">📚</div>
              <div className="font-semibold">Courses</div>
              <div className="text-sm text-gray-600">Export all courses</div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/apiClient';

interface AccessLog {
  id: number;
  access_type: string;
  accessed_by_email: string;
  accessed_by_name: string;
  company_name: string | null;
  reason: string;
  ip_address: string;
  created_at: string;
}

const accessTypeLabels: Record<string, string> = {
  profile: 'Profile View',
  learning_record: 'Learning Records',
  exam_results: 'Exam Results',
  resume: 'Resume',
  all_data: 'Full Data Export',
};

export function DataAccessLogPage() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    fetchAccessLogs();
  }, [filterType]);

  const fetchAccessLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType) {
        params.append('access_type', filterType);
      }
      const response = await apiClient.get<{ logs: AccessLog[] }>(`/v1/student/data-access-log?${params}`);
      setLogs(response.data.logs);
      setError('');
    } catch (err) {
      setError('Failed to load access logs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="p-4">Loading access logs...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Data Access Log</h1>
      <p className="text-gray-600 mb-6">
        View who has accessed your data and when.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by access type
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All access types</option>
            <option value="profile">Profile View</option>
            <option value="learning_record">Learning Records</option>
            <option value="exam_results">Exam Results</option>
            <option value="resume">Resume</option>
            <option value="all_data">Full Data Export</option>
          </select>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No access logs found.</p>
          <p className="text-sm mt-2">Your data access history will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Date & Time</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Access Type</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Accessed By</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">Company</th>
                <th className="px-4 py-3 text-left font-semibold text-gray-900">IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                      {accessTypeLabels[log.access_type] || log.access_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div className="font-medium">{log.accessed_by_name}</div>
                    <div className="text-xs text-gray-500">{log.accessed_by_email}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {log.company_name || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono text-xs">
                    {log.ip_address}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">About This Log</h3>
        <p className="text-sm text-blue-800">
          This log shows all instances when companies or admins accessed your personal data.
          If you see any unauthorized access, please contact us immediately.
        </p>
      </div>
    </div>
  );
}

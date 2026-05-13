import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/apiClient';

interface ExportRequest {
  id: number;
  status: 'pending' | 'processing' | 'ready' | 'expired';
  file_url: string | null;
  requested_at: string;
  expires_at: string;
  is_expired: boolean;
  created_at: string;
  updated_at: string;
}

interface DeletionRequest {
  id: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  reason: string;
  requested_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  ready: 'bg-green-100 text-green-800',
  expired: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export function DataExportPage() {
  const [exportRequests, setExportRequests] = useState<ExportRequest[]>([]);
  const [deletionRequest, setDeletionRequest] = useState<DeletionRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [exportRes, deletionRes] = await Promise.all([
        apiClient.get<{ exports: ExportRequest[] }>('/v1/student/data-export-request'),
        apiClient.get<{ deletion_request: DeletionRequest | null }>('/v1/student/deletion-status'),
      ]);
      
      if (exportRes.data && Array.isArray(exportRes.data.exports)) {
        setExportRequests(exportRes.data.exports);
      }
      
      if (deletionRes.data.deletion_request) {
        setDeletionRequest(deletionRes.data.deletion_request);
      }
      
      setError('');
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestExport = async () => {
    try {
      setExporting(true);
      const response = await apiClient.post<{ export_request: ExportRequest }>('/v1/student/data-export-request', {});
      setExportRequests([response.data.export_request, ...exportRequests]);
      setError('');
    } catch (err) {
      setError('Failed to request export');
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const handleRequestDeletion = async () => {
    try {
      setDeleting(true);
      const response = await apiClient.post<{ deletion_request: DeletionRequest }>('/v1/student/deletion-request', {
        reason: deleteReason,
      });
      setDeletionRequest(response.data.deletion_request);
      setShowDeleteConfirm(false);
      setDeleteReason('');
      setError('');
    } catch (err) {
      setError('Failed to request deletion');
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Data Export & Deletion</h1>
      <p className="text-gray-600 mb-6">
        Download your data or request account deletion in compliance with GDPR and privacy regulations.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Data Export Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Data Export</h2>
        <p className="text-gray-600 mb-4">
          Download all your personal data in JSON/CSV format. Export requests expire after 30 days.
        </p>

        <button
          onClick={handleRequestExport}
          disabled={exporting}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            exporting
              ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {exporting ? 'Requesting...' : 'Request Data Export'}
        </button>

        {exportRequests.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Recent Export Requests</h3>
            {exportRequests.map((request) => (
              <div
                key={request.id}
                className="border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[request.status]
                      }`}
                    >
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Requested {formatDate(request.requested_at)}
                    </span>
                  </div>
                  {request.status === 'ready' && request.file_url && (
                    <p className="text-sm text-gray-600">
                      Download available until {formatDate(request.expires_at)}
                    </p>
                  )}
                  {request.is_expired && (
                    <p className="text-sm text-red-600">This export has expired. Request a new one.</p>
                  )}
                </div>
                {request.status === 'ready' && request.file_url && !request.is_expired && (
                  <a
                    href={request.file_url}
                    download
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Download
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Deletion Section */}
      <div className="border-t pt-8">
        <h2 className="text-2xl font-bold mb-4">Account Deletion</h2>
        <p className="text-gray-600 mb-4">
          Request permanent deletion of your account and all associated data. This action cannot be undone.
        </p>

        {deletionRequest && deletionRequest.status !== 'cancelled' ? (
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  statusColors[deletionRequest.status]
                }`}
              >
                {deletionRequest.status.charAt(0).toUpperCase() + deletionRequest.status.slice(1)}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Requested on {formatDate(deletionRequest.requested_at)}
            </p>
            {deletionRequest.completed_at && (
              <p className="text-sm text-gray-600 mt-2">
                Completed on {formatDate(deletionRequest.completed_at)}
              </p>
            )}
            {deletionRequest.reason && (
              <p className="text-sm text-gray-600 mt-2">
                Reason: {deletionRequest.reason}
              </p>
            )}
          </div>
        ) : (
          <>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-6 py-3 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              Request Account Deletion
            </button>

            {showDeleteConfirm && (
              <div className="mt-6 border border-red-200 bg-red-50 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-4">Confirm Account Deletion</h3>
                <p className="text-sm text-red-800 mb-4">
                  This will permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-red-900 mb-2">
                    Tell us why you're leaving (optional)
                  </label>
                  <textarea
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    placeholder="Your feedback helps us improve..."
                    className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteReason('');
                    }}
                    className="px-4 py-2 rounded-lg font-medium bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestDeletion}
                    disabled={deleting}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      deleting
                        ? 'bg-red-300 text-red-600 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {deleting ? 'Processing...' : 'Confirm Deletion'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Your Rights</h3>
        <p className="text-sm text-blue-800">
          You have the right to access, export, and delete your personal data in accordance with GDPR
          and other privacy regulations. We process your requests within 30 days.
        </p>
      </div>
    </div>
  );
}

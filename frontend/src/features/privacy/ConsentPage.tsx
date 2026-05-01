import { useState, useEffect } from 'react';
import { apiClient } from '../../lib/apiClient';

interface Consent {
  id: number;
  consent_type: string;
  given: boolean;
  given_at: string | null;
  company_id: number | null;
  company_name: string | null;
  created_at: string;
  updated_at: string;
}

export function ConsentPage() {
  const [consents, setConsents] = useState<Record<string, Consent[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const consentDescriptions: Record<string, string> = {
    share_profile_with_company: 'Allow companies to view your profile information including contact details and basic career preferences.',
    share_learning_with_company: 'Allow companies to view your learning progress and completed courses.',
    share_exam_results_with_company: 'Allow companies to view your exam scores and test results.',
    marketing_emails: 'Receive marketing communications and feature announcements from softlearn.',
    research_participation: 'Participate in anonymous research studies to help improve softlearn.',
  };

  useEffect(() => {
    fetchConsents();
  }, []);

  const fetchConsents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/v1/student/consent');
      setConsents(response.data.consents);
      setError('');
    } catch (err) {
      setError('Failed to load consent preferences');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleConsentChange = async (
    consentType: string,
    given: boolean,
    companyId?: number
  ) => {
    try {
      setSaving(true);
      await apiClient.put('/v1/student/consent', {
        consent_type: consentType,
        given,
        company_id: companyId,
      });

      await fetchConsents();
    } catch (err) {
      setError('Failed to update consent preference');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4">Loading consent preferences...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Privacy & Consent Settings</h1>
      <p className="text-gray-600 mb-6">
        Manage your data sharing preferences and consent settings.
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {Object.entries(consents).map(([consentType, typeConsents]) => (
          <div key={consentType} className="border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 mr-4">
                <h3 className="font-semibold text-gray-900">
                  {consentType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {consentDescriptions[consentType]}
                </p>
                {typeConsents.length > 0 && typeConsents[0].company_name && (
                  <p className="text-xs text-gray-500 mt-2">
                    Shared with: {typeConsents[0].company_name}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleConsentChange(
                  consentType,
                  !(typeConsents[0]?.given ?? false),
                  typeConsents[0]?.company_id
                )}
                disabled={saving}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  typeConsents[0]?.given
                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {typeConsents[0]?.given ? 'Allowed' : 'Blocked'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">About Your Data</h3>
        <p className="text-sm text-blue-800">
          Your data is always protected. You can change these preferences at any time.
          Learn more about our privacy practices in our{' '}
          <a href="/privacy" className="underline hover:no-underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}

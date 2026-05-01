import { useEffect, useState } from 'react';
import { Bell, Mail, Clock } from 'lucide-react';

interface NotificationPreferences {
  email_on_application: boolean;
  email_on_interview: boolean;
  email_on_exam_result: boolean;
  email_on_study_plan: boolean;
  email_on_course_completion: boolean;
  email_on_skill_endorsed: boolean;
  app_notifications_enabled: boolean;
  daily_digest: boolean;
  digest_time?: string;
  unsubscribed: boolean;
}

export function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  async function fetchPreferences() {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/notification-preferences', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setPreferences(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
      setError('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  }

  async function savePreferences() {
    if (!preferences) return;

    try {
      setSaving(true);
      setError(null);
      setSaved(false);

      const response = await fetch('/api/v1/notification-preferences/update', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError('Failed to save preferences');
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setError('An error occurred while saving preferences');
    } finally {
      setSaving(false);
    }
  }

  function handleToggle(key: keyof NotificationPreferences) {
    if (preferences) {
      setPreferences({
        ...preferences,
        [key]: !preferences[key],
      });
    }
  }

  function getCsrfToken() {
    const name = 'csrftoken';
    let cookieValue = '';
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === name + '=') {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center text-gray-500">Loading preferences...</div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center text-red-600">
          Failed to load notification preferences
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Bell size={32} />
          Notification Preferences
        </h1>
        <p className="text-gray-600 mt-2">
          Control how and when you receive notifications from SoftLearn
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {saved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
          ✓ Preferences saved successfully
        </div>
      )}

      <div className="space-y-8">
        {/* Email Notifications Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <Mail size={24} className="text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Email Notifications</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.email_on_application}
                onChange={() => handleToggle('email_on_application')}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div className="ml-3">
                <p className="font-medium text-gray-900">Application Updates</p>
                <p className="text-sm text-gray-600">
                  Receive emails when your application status changes
                </p>
              </div>
            </label>

            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.email_on_interview}
                onChange={() => handleToggle('email_on_interview')}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div className="ml-3">
                <p className="font-medium text-gray-900">Interview Updates</p>
                <p className="text-sm text-gray-600">
                  Get notified when interviews are scheduled or confirmed
                </p>
              </div>
            </label>

            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.email_on_exam_result}
                onChange={() => handleToggle('email_on_exam_result')}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div className="ml-3">
                <p className="font-medium text-gray-900">Exam Results</p>
                <p className="text-sm text-gray-600">
                  Be notified when exam results are available
                </p>
              </div>
            </label>

            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.email_on_study_plan}
                onChange={() => handleToggle('email_on_study_plan')}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div className="ml-3">
                <p className="font-medium text-gray-900">Study Plan Ready</p>
                <p className="text-sm text-gray-600">
                  Get notified when your personalized study plan is ready
                </p>
              </div>
            </label>

            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.email_on_course_completion}
                onChange={() => handleToggle('email_on_course_completion')}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div className="ml-3">
                <p className="font-medium text-gray-900">Course Completion</p>
                <p className="text-sm text-gray-600">
                  Celebrate your course completion with a notification
                </p>
              </div>
            </label>

            <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.email_on_skill_endorsed}
                onChange={() => handleToggle('email_on_skill_endorsed')}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <div className="ml-3">
                <p className="font-medium text-gray-900">Skill Endorsements</p>
                <p className="text-sm text-gray-600">
                  Receive notifications when your skills are endorsed
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* In-App Notifications Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell size={24} className="text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">In-App Notifications</h2>
          </div>

          <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.app_notifications_enabled}
              onChange={() => handleToggle('app_notifications_enabled')}
              className="w-4 h-4 text-green-600 rounded"
            />
            <div className="ml-3">
              <p className="font-medium text-gray-900">Enable In-App Notifications</p>
              <p className="text-sm text-gray-600">
                See notifications within the SoftLearn application
              </p>
            </div>
          </label>
        </div>

        {/* Digest Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <Clock size={24} className="text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Notification Digest</h2>
          </div>

          <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.daily_digest}
              onChange={() => handleToggle('daily_digest')}
              className="w-4 h-4 text-purple-600 rounded"
            />
            <div className="ml-3">
              <p className="font-medium text-gray-900">Enable Daily Digest</p>
              <p className="text-sm text-gray-600">
                Receive a daily summary of your notifications at a set time
              </p>
            </div>
          </label>

          {preferences.daily_digest && (
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <label className="block">
                <p className="text-sm font-medium text-gray-900 mb-2">Digest Time</p>
                <input
                  type="time"
                  value={preferences.digest_time || '09:00'}
                  onChange={(e) =>
                    setPreferences({
                      ...preferences,
                      digest_time: e.target.value,
                    })
                  }
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-600 mt-1">
                  Daily digest will be sent at this time
                </p>
              </label>
            </div>
          )}
        </div>

        {/* Unsubscribe Section */}
        <div className="bg-white rounded-lg shadow p-6 border border-red-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Settings</h2>

          <label className="flex items-center p-3 border border-red-200 rounded-lg hover:bg-red-50 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.unsubscribed}
              onChange={() => handleToggle('unsubscribed')}
              className="w-4 h-4 text-red-600 rounded"
            />
            <div className="ml-3">
              <p className="font-medium text-red-900">Unsubscribe from all notifications</p>
              <p className="text-sm text-red-700">
                You won't receive any notifications if you unsubscribe
              </p>
            </div>
          </label>
        </div>

        {/* Save Button */}
        <div className="flex gap-4">
          <button
            onClick={savePreferences}
            disabled={saving}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
}

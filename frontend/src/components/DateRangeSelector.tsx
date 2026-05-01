import { useState } from 'react'

export interface DateRange {
  start: Date
  end: Date
}

export type DateRangePreset = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'last90days' | 'custom'

/**
 * DateRangeSelector component for selecting date ranges
 */
export function DateRangeSelector({
  onRangeChange,
  initialRange,
}: {
  onRangeChange: (range: DateRange) => void
  initialRange?: DateRange
}) {
  const [preset, setPreset] = useState<DateRangePreset>('last7days')
  const [customStart, setCustomStart] = useState(initialRange?.start.toISOString().split('T')[0] || '')
  const [customEnd, setCustomEnd] = useState(initialRange?.end.toISOString().split('T')[0] || '')

  const getDateRange = (selectedPreset: DateRangePreset): DateRange => {
    const end = new Date()
    const start = new Date()

    switch (selectedPreset) {
      case 'today':
        start.setHours(0, 0, 0, 0)
        end.setHours(23, 59, 59, 999)
        break
      case 'yesterday':
        start.setDate(start.getDate() - 1)
        start.setHours(0, 0, 0, 0)
        end.setDate(end.getDate() - 1)
        end.setHours(23, 59, 59, 999)
        break
      case 'last7days':
        start.setDate(start.getDate() - 7)
        break
      case 'last30days':
        start.setDate(start.getDate() - 30)
        break
      case 'last90days':
        start.setDate(start.getDate() - 90)
        break
      case 'custom':
        return {
          start: new Date(customStart),
          end: new Date(customEnd),
        }
    }

    return { start, end }
  }

  const handlePresetChange = (newPreset: DateRangePreset) => {
    setPreset(newPreset)
    if (newPreset !== 'custom') {
      onRangeChange(getDateRange(newPreset))
    }
  }

  const handleCustomRangeChange = () => {
    if (customStart && customEnd) {
      const range: DateRange = {
        start: new Date(customStart),
        end: new Date(customEnd),
      }
      onRangeChange(range)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
      {/* Preset Buttons */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {(['today', 'yesterday', 'last7days', 'last30days', 'last90days', 'custom'] as const).map(
          (p) => (
            <button
              key={p}
              onClick={() => handlePresetChange(p)}
              className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                preset === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {p === 'today'
                ? 'Today'
                : p === 'yesterday'
                  ? 'Yesterday'
                  : p === 'last7days'
                    ? '7 days'
                    : p === 'last30days'
                      ? '30 days'
                      : p === 'last90days'
                        ? '90 days'
                        : 'Custom'}
            </button>
          )
        )}
      </div>

      {/* Custom Date Range */}
      {preset === 'custom' && (
        <div className="pt-2 border-t border-gray-200 dark:border-gray-700 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <button
            onClick={handleCustomRangeChange}
            disabled={!customStart || !customEnd}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium transition-colors"
          >
            Apply
          </button>
        </div>
      )}

      {/* Date Range Display */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {preset === 'custom'
          ? `${customStart} to ${customEnd}`
          : `${getDateRange(preset).start.toLocaleDateString()} - ${getDateRange(preset).end.toLocaleDateString()}`}
      </div>
    </div>
  )
}

export default DateRangeSelector

import { useState } from 'react'

export interface FilterPreset {
  name: string
  filters: Record<string, any>
}

export interface AdvancedFilterProps {
  fields: any[]
  onApplyFilters: (filters: Record<string, any>) => void
  onClearFilters: () => void
  resultCount?: number
  presets?: FilterPreset[]
  onSavePreset?: (preset: FilterPreset) => void
  onLoadPreset?: (preset: FilterPreset) => void
}

/**
 * AdvancedFilter component with multi-select, presets, and numeric ranges
 */
export function AdvancedFilter({
  fields,
  onApplyFilters,
  onClearFilters,
  resultCount,
  presets = [],
  onSavePreset,
  onLoadPreset,
}: AdvancedFilterProps) {
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [presetName, setPresetName] = useState('')
  const [showSavePreset, setShowSavePreset] = useState(false)

  const activeFilterCount = Object.values(filters).filter(v => v).length

  const handleApply = () => {
    onApplyFilters(filters)
  }

  const handleClear = () => {
    setFilters({})
    onClearFilters()
  }

  const handleSavePreset = () => {
    if (presetName.trim() && onSavePreset) {
      onSavePreset({ name: presetName, filters })
      setPresetName('')
      setShowSavePreset(false)
    }
  }

  const handleLoadPreset = (preset: FilterPreset) => {
    setFilters(preset.filters)
    onLoadPreset?.(preset)
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
      {/* Filter Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {field.label}
            </label>
            {field.type === 'multi-select' ? (
              <div className="space-y-1">
                {field.options?.map((opt: any) => (
                  <label key={opt.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters[field.name]?.includes(opt.value) || false}
                      onChange={(e) => {
                        const current = filters[field.name] || []
                        if (e.target.checked) {
                          setFilters({ ...filters, [field.name]: [...current, opt.value] })
                        } else {
                          setFilters({
                            ...filters,
                            [field.name]: current.filter((v: any) => v !== opt.value),
                          })
                        }
                      }}
                      className="rounded w-4 h-4"
                    />
                    <span className="ml-2 text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            ) : field.type === 'range' ? (
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters[`${field.name}_min`] || ''}
                  onChange={(e) => setFilters({ ...filters, [`${field.name}_min`]: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters[`${field.name}_max`] || ''}
                  onChange={(e) => setFilters({ ...filters, [`${field.name}_max`]: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>
            ) : (
              <input
                type="text"
                placeholder={`Search ${field.label.toLowerCase()}...`}
                value={filters[field.name] || ''}
                onChange={(e) => setFilters({ ...filters, [field.name]: e.target.value })}
                className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            )}
          </div>
        ))}
      </div>

      {/* Presets */}
      {presets.length > 0 && (
        <div>
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Saved Presets</div>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.name}
                onClick={() => handleLoadPreset(preset)}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                {preset.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 items-center justify-between flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Apply Filters
          </button>
          <button
            onClick={handleClear}
            disabled={activeFilterCount === 0}
            className="px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            Clear
          </button>
          {onSavePreset && (
            <button
              onClick={() => setShowSavePreset(!showSavePreset)}
              className="px-4 py-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {showSavePreset ? '✕' : 'Save'} Preset
            </button>
          )}
        </div>
        {activeFilterCount > 0 && (
          <span className="px-3 py-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
          </span>
        )}
      </div>

      {/* Save Preset Form */}
      {showSavePreset && (
        <div className="flex gap-2 pt-4 border-t dark:border-gray-700">
          <input
            type="text"
            placeholder="Preset name..."
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            onClick={handleSavePreset}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save
          </button>
        </div>
      )}

      {/* Result Count */}
      {resultCount !== undefined && (
        <div className="text-sm text-gray-600 dark:text-gray-400 pt-2 border-t dark:border-gray-700">
          {resultCount} result{resultCount !== 1 ? 's' : ''} found
        </div>
      )}
    </div>
  )
}

export default AdvancedFilter

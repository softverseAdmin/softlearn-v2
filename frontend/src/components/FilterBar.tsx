import { useState } from 'react'

export interface FilterOption {
  label: string
  value: string
}

export interface FilterField {
  name: string
  label: string
  type: 'select' | 'text' | 'date-range'
  options?: FilterOption[]
}

export interface FilterBarProps {
  fields: FilterField[]
  onApplyFilters: (filters: Record<string, any>) => void
  onClearFilters: () => void
  resultCount?: number
}

export function FilterBar({
  fields,
  onApplyFilters,
  onClearFilters,
  resultCount,
}: FilterBarProps) {
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const handleFilterChange = (name: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [name]: value || undefined,
    }))
  }

  const handleApply = () => {
    const allFilters = { ...filters }
    if (dateFrom) allFilters.date_from = dateFrom
    if (dateTo) allFilters.date_to = dateTo
    onApplyFilters(allFilters)
  }

  const handleClear = () => {
    setFilters({})
    setDateFrom('')
    setDateTo('')
    onClearFilters()
  }

  return (
    <div className="bg-gray-50 border rounded-lg p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {fields.map(field => {
          if (field.type === 'select') {
            return (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                <select
                  value={filters[field.name] || ''}
                  onChange={e => handleFilterChange(field.name, e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">All</option>
                  {field.options?.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )
          }

          if (field.type === 'text') {
            return (
              <div key={field.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                <input
                  type="text"
                  placeholder={`Search ${field.label.toLowerCase()}...`}
                  value={filters[field.name] || ''}
                  onChange={e => handleFilterChange(field.name, e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            )
          }

          if (field.type === 'date-range') {
            return (
              <div key={field.name} className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="From"
                  />
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="flex-1 border rounded px-3 py-2"
                    placeholder="To"
                  />
                </div>
              </div>
            )
          }

          return null
        })}
      </div>

      <div className="flex gap-2 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Apply Filters
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Clear Filters
          </button>
        </div>
        {resultCount !== undefined && (
          <span className="text-sm text-gray-600">
            {resultCount} result{resultCount !== 1 ? 's' : ''} found
          </span>
        )}
      </div>
    </div>
  )
}

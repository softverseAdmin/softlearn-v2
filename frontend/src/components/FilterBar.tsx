import { useState } from 'react'
import { generateId } from '../lib/accessibility'
import { useScreenReaderAnnouncement } from '../hooks/useAccessibility'

export interface FilterOption {
  label: string
  value: string
}

export interface FilterField {
  name: string
  label: string
  type: 'select' | 'text' | 'date-range'
  options?: FilterOption[]
  description?: string
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
  const { announce } = useScreenReaderAnnouncement()
  const filterCountId = generateId('filter-count')

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
    announce(`Filters applied. ${resultCount || 'Results'} found`)
  }

  const handleClear = () => {
    setFilters({})
    setDateFrom('')
    setDateTo('')
    onClearFilters()
    announce('Filters cleared')
  }

  const activeFilterCount = Object.values(filters).filter(v => v).length + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0)

  return (
    <div 
      className="bg-gray-50 border rounded-lg p-4 mb-4"
      role="search"
      aria-label="Filter options"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {fields.map(field => {
          const fieldId = generateId(`filter-${field.name}`)
          const descriptionId = field.description ? generateId(`desc-${field.name}`) : undefined

          if (field.type === 'select') {
            return (
              <div key={field.name}>
                <label 
                  htmlFor={fieldId}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {field.label}
                </label>
                <select
                  id={fieldId}
                  value={filters[field.name] || ''}
                  onChange={e => handleFilterChange(field.name, e.target.value)}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={field.label}
                  aria-describedby={descriptionId}
                >
                  <option value="">All</option>
                  {field.options?.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {field.description && (
                  <p id={descriptionId} className="text-xs text-gray-500 mt-1">
                    {field.description}
                  </p>
                )}
              </div>
            )
          }

          if (field.type === 'text') {
            return (
              <div key={field.name}>
                <label 
                  htmlFor={fieldId}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {field.label}
                </label>
                <input
                  id={fieldId}
                  type="text"
                  placeholder={`Search ${field.label.toLowerCase()}...`}
                  value={filters[field.name] || ''}
                  onChange={e => handleFilterChange(field.name, e.target.value)}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={field.label}
                  aria-describedby={descriptionId}
                />
                {field.description && (
                  <p id={descriptionId} className="text-xs text-gray-500 mt-1">
                    {field.description}
                  </p>
                )}
              </div>
            )
          }

          if (field.type === 'date-range') {
            const dateFromId = generateId(`from-${field.name}`)
            const dateToId = generateId(`to-${field.name}`)
            return (
              <div key={field.name} className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label htmlFor={dateFromId} className="sr-only">
                      {field.label} start date
                    </label>
                    <input
                      id={dateFromId}
                      type="date"
                      value={dateFrom}
                      onChange={e => setDateFrom(e.target.value)}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`${field.label} from`}
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor={dateToId} className="sr-only">
                      {field.label} end date
                    </label>
                    <input
                      id={dateToId}
                      type="date"
                      value={dateTo}
                      onChange={e => setDateTo(e.target.value)}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`${field.label} to`}
                    />
                  </div>
                </div>
              </div>
            )
          }

          return null
        })}
      </div>

      <div className="flex gap-2 items-center justify-between flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={handleApply}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Apply filters"
          >
            Apply Filters
          </button>
          <button
            onClick={handleClear}
            disabled={activeFilterCount === 0}
            className="px-4 py-2 border rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Clear all filters"
          >
            Clear Filters
          </button>
          {activeFilterCount > 0 && (
            <span 
              className="px-3 py-2 bg-blue-100 text-blue-800 rounded text-sm font-medium"
              role="status"
              aria-live="polite"
            >
              {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
            </span>
          )}
        </div>
        {resultCount !== undefined && (
          <span 
            id={filterCountId}
            className="text-sm text-gray-600"
            role="status"
            aria-live="polite"
            aria-label={`${resultCount} result${resultCount !== 1 ? 's' : ''} found`}
          >
            {resultCount} result{resultCount !== 1 ? 's' : ''} found
          </span>
        )}
      </div>
    </div>
  )
}

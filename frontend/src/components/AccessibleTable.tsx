import React, { type ReactNode } from 'react'

export interface AccessibleTableColumn {
  key: string
  label: string
  sortable?: boolean
  align?: 'left' | 'center' | 'right'
}

export interface AccessibleTableRow {
  [key: string]: any
}

export interface AccessibleTableProps {
  columns: AccessibleTableColumn[]
  data: AccessibleTableRow[]
  caption: string
  onSort?: (columnKey: string) => void
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  renderCell?: (column: AccessibleTableColumn, row: AccessibleTableRow) => ReactNode
  onRowClick?: (row: AccessibleTableRow) => void
  selectable?: boolean
  onSelectionChange?: (selectedRows: AccessibleTableRow[]) => void
}

export function AccessibleTable({
  columns,
  data,
  caption,
  onSort,
  sortColumn,
  sortDirection = 'asc',
  renderCell,
  onRowClick,
  selectable = false,
  onSelectionChange,
}: AccessibleTableProps) {
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set())

  const handleRowSelection = (index: number) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedRows(newSelected)
    const selected = data.filter((_, i) => newSelected.has(i))
    onSelectionChange?.(selected)
  }

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set())
      onSelectionChange?.([])
    } else {
      const newSelected = new Set(data.map((_, i) => i))
      setSelectedRows(newSelected)
      onSelectionChange?.(data)
    }
  }

  const handleColumnSort = (columnKey: string) => {
    if (onSort) {
      onSort(columnKey)
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-gray-100">
          <tr>
            {selectable && (
              <th className="border border-gray-300 px-4 py-2 text-left w-12">
                <input
                  type="checkbox"
                  checked={selectedRows.size === data.length && data.length > 0}
                  onChange={handleSelectAll}
                  aria-label="Select all rows"
                  className="w-4 h-4"
                />
              </th>
            )}
            {columns.map(column => (
              <th
                key={column.key}
                className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-700"
                scope="col"
                style={{ textAlign: column.align || 'left' }}
              >
                {column.sortable ? (
                  <button
                    onClick={() => handleColumnSort(column.key)}
                    className="flex items-center gap-2 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-sort={
                      sortColumn === column.key
                        ? sortDirection === 'asc'
                          ? 'ascending'
                          : 'descending'
                        : 'none'
                    }
                  >
                    {column.label}
                    {sortColumn === column.key && (
                      <span aria-hidden="true">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="border border-gray-300 px-4 py-8 text-center text-gray-500"
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 focus-within:bg-blue-50"
                onClick={() => onRowClick?.(row)}
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={(e) => {
                  if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault()
                    onRowClick(row)
                  }
                }}
              >
                {selectable && (
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(rowIndex)}
                      onChange={() => handleRowSelection(rowIndex)}
                      aria-label={`Select row ${rowIndex + 1}`}
                      className="w-4 h-4"
                    />
                  </td>
                )}
                {columns.map(column => (
                  <td
                    key={column.key}
                    className="border border-gray-300 px-4 py-2"
                    style={{ textAlign: column.align || 'left' }}
                  >
                    {renderCell ? renderCell(column, row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export default AccessibleTable

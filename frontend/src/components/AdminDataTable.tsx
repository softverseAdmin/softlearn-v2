import { useMemo, useState } from 'react'

export interface DataTableColumn {
  key: string
  label: string
  sortable?: boolean
  render?: (value: any, row: any) => React.ReactNode
  width?: string
}

export interface DataTableProps {
  columns: DataTableColumn[]
  data: any[]
  onRowClick?: (row: any) => void
  onRowSelect?: (selectedIds: any[]) => void
  selectable?: boolean
  sortable?: boolean
  paginated?: boolean
  pageSize?: number
}

export function AdminDataTable({
  columns,
  data,
  onRowClick,
  onRowSelect,
  selectable = false,
  sortable = true,
  paginated = true,
  pageSize = 25,
}: DataTableProps) {
  const [sortField, setSortField] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [selectedRows, setSelectedRows] = useState<Set<any>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortField || !sortable) return data
    return [...data].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [data, sortField, sortDir, sortable])

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!paginated) return sortedData
    const start = (currentPage - 1) * pageSize
    return sortedData.slice(start, start + pageSize)
  }, [sortedData, currentPage, pageSize, paginated])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = (field: string) => {
    if (!sortable) return
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
    setCurrentPage(1)
  }

  const handleSelectRow = (id: any) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedRows(newSelected)
    if (onRowSelect) {
      onRowSelect(Array.from(newSelected))
    }
  }

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length && selectedRows.size > 0) {
      setSelectedRows(new Set())
      if (onRowSelect) onRowSelect([])
    } else {
      const allIds = new Set(paginatedData.map(row => row.id || row[columns[0]?.key]))
      setSelectedRows(allIds)
      if (onRowSelect) onRowSelect(Array.from(allIds))
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-100 border-b">
          <tr>
            {selectable && (
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={selectedRows.size > 0 && selectedRows.size === paginatedData.length}
                />
              </th>
            )}
            {columns.map(col => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left ${col.sortable !== false && sortable ? 'cursor-pointer hover:bg-gray-200' : ''}`}
                style={{ width: col.width }}
                onClick={() => col.sortable !== false && sortable && handleSort(col.key)}
              >
                <div className="flex items-center gap-2">
                  {col.label}
                  {sortable && col.sortable !== false && sortField === col.key && (
                    <span>{sortDir === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-3 text-center text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            paginatedData.map((row, idx) => {
              const rowId = row.id || row[columns[0]?.key]
              return (
                <tr
                  key={idx}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {selectable && (
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(rowId)}
                        onChange={() => handleSelectRow(rowId)}
                      />
                    </td>
                  )}
                  {columns.map(col => (
                    <td key={col.key} className="px-4 py-3">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              )
            })
          )}
        </tbody>
      </table>

      {paginated && totalPages > 1 && (
        <div className="flex gap-2 justify-center py-4">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            First
          </button>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-1">Page {currentPage} of {totalPages}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Last
          </button>
        </div>
      )}
    </div>
  )
}

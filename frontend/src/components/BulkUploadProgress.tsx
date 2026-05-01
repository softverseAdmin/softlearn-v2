import { useState } from 'react'

export interface BulkUploadProgressProps {
  totalItems: number
  processedItems: number
  successItems: number
  errorItems: number
  isProcessing: boolean
  onCancel?: () => void
  onPause?: () => void
  onResume?: () => void
  isPaused?: boolean
  errors?: Array<{ row: number; message: string }>
}

/**
 * BulkUploadProgress component with real-time progress tracking
 */
export function BulkUploadProgress({
  totalItems,
  processedItems,
  successItems,
  errorItems,
  isProcessing,
  onCancel,
  onPause,
  onResume,
  isPaused = false,
  errors = [],
}: BulkUploadProgressProps) {
  const [showErrors, setShowErrors] = useState(false)
  const percentage = totalItems > 0 ? Math.round((processedItems / totalItems) * 100) : 0

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
      {/* Progress Header */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isProcessing ? 'Processing Upload...' : 'Upload Complete'}
          </h3>
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{percentage}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Upload progress: ${percentage}%`}
          />
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{processedItems}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Processed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{successItems}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Success</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{errorItems}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Errors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalItems}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 justify-center flex-wrap">
        {isProcessing && (
          <>
            {onPause && (
              <button
                onClick={onPause}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            )}
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Cancel
              </button>
            )}
          </>
        )}
      </div>

      {/* Error Section */}
      {errorItems > 0 && (
        <div className="border-t dark:border-gray-700 pt-4">
          <button
            onClick={() => setShowErrors(!showErrors)}
            className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium hover:underline"
          >
            <span>{showErrors ? '▾' : '▸'}</span>
            {errorItems} error{errorItems !== 1 ? 's' : ''} in upload
          </button>

          {showErrors && (
            <div className="mt-4 max-h-48 overflow-y-auto bg-red-50 dark:bg-red-900/20 rounded p-3 space-y-2">
              {errors.map((error, idx) => (
                <div key={idx} className="text-sm text-red-700 dark:text-red-300">
                  <strong>Row {error.row}:</strong> {error.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status Message */}
      {isPaused && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3 text-yellow-800 dark:text-yellow-200 text-sm">
          Upload paused. Click Resume to continue.
        </div>
      )}
    </div>
  )
}

/**
 * BulkUploadDropZone component for drag-and-drop file upload
 */
export function BulkUploadDropZone({
  onFileSelected,
  accept = '.csv',
}: {
  onFileSelected: (file: File) => void
  accept?: string
}) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      onFileSelected(files[0])
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onFileSelected(e.target.files[0])
    }
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50'
      }`}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        id="bulk-upload-input"
        aria-label="Upload CSV file"
      />

      <label
        htmlFor="bulk-upload-input"
        className="cursor-pointer block"
      >
        <div className="text-4xl mb-2">📁</div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
          Drag and drop your file
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          or click to browse
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Supports {accept} files
        </p>
      </label>
    </div>
  )
}

export default BulkUploadProgress

import { useFocusTrap } from '../hooks/useAccessibility'

export interface ConfirmationDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  isDangerous?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationDialogProps) {
  const dialogRef = useFocusTrap(isOpen)

  if (!isOpen) return null

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onCancel}
      role="presentation"
    >
      <div 
        ref={dialogRef}
        className="bg-white rounded-lg p-6 max-w-md w-full mx-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <h2 
          id="dialog-title"
          className="text-xl font-semibold mb-3"
        >
          {title}
        </h2>
        <p 
          id="dialog-description"
          className="text-gray-600 mb-6"
        >
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label={`${cancelLabel} button`}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded text-white ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                : 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400'
            } disabled:opacity-50 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isDangerous ? 'focus:ring-red-500' : 'focus:ring-blue-500'
            }`}
            aria-label={`${confirmLabel} button`}
            aria-busy={isLoading}
          >
            {isLoading && <span className="animate-spin" aria-hidden="true">⌛</span>}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

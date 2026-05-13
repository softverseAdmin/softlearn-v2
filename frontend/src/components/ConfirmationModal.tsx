import { useState, type ReactNode } from 'react'
import { useFocusTrap } from '../hooks/useAccessibility'

export interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  message: string | ReactNode
  confirmText?: string
  cancelText?: string
  isDangerous?: boolean
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

/**
 * ConfirmationModal component for destructive actions
 */
export function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationModalProps) {
  const focusTrapRef = useFocusTrap(isOpen)

  if (!isOpen) return null

  const handleEscape = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      onCancel()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      onKeyDown={handleEscape}
      ref={focusTrapRef}
    >
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-sm mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2
            id="modal-title"
            className="text-xl font-bold text-gray-900 dark:text-white"
          >
            {title}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p id="modal-description" className="text-gray-700 dark:text-gray-300">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-white font-medium transition-colors disabled:opacity-50 ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span>
                {confirmText}
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * useConfirmationModal hook for managing modal state
 */
export function useConfirmationModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<Omit<ConfirmationModalProps, 'isOpen' | 'onConfirm' | 'onCancel'>>({
    title: '',
    message: '',
  })
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const confirm = async (
    action: () => void | Promise<void>,
    modalConfig: Omit<ConfirmationModalProps, 'isOpen' | 'onConfirm' | 'onCancel' | 'isLoading'>
  ) => {
    setConfig(modalConfig)
    setPendingAction(() => action)
    setIsOpen(true)
  }

  const handleConfirm = async () => {
    if (!pendingAction) return

    setIsLoading(true)
    try {
      await pendingAction()
      setIsOpen(false)
      setPendingAction(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsOpen(false)
    setPendingAction(null)
  }

  return {
    confirm,
    ConfirmationModal: (
      <ConfirmationModal
        {...config}
        isOpen={isOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    ),
  }
}

export default ConfirmationModal

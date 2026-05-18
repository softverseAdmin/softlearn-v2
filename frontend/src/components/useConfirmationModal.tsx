import { useState } from 'react'

import { ConfirmationModal } from './ConfirmationModal'
import type { ConfirmationModalProps } from './ConfirmationModal.types'

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

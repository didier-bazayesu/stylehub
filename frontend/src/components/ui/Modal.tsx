import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useScrollLock } from '@/hooks'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
  className?: string
  /** Prevent closing by clicking backdrop */
  disableBackdropClose?: boolean
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  children,
  className,
  disableBackdropClose = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useScrollLock(isOpen)

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Trap focus inside modal
  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={disableBackdropClose ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={cn(
          'relative w-full rounded-2xl border border-gray-100 bg-white shadow-xl',
          'dark:border-gray-800 dark:bg-gray-900',
          'focus:outline-none',
          'animate-in fade-in zoom-in-95 duration-150',
          sizeClasses[size],
          className,
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            {title && (
              <h2
                id="modal-title"
                className="text-base font-semibold text-gray-900 dark:text-white"
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                id="modal-description"
                className="mt-0.5 text-sm text-gray-500 dark:text-gray-400"
              >
                {description}
              </p>
            )}
          </div>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Body */}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ─── Confirm dialog ───────────────────────────────────────────────────────────

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  isLoading?: boolean
  /** Optional content rendered above the action buttons (e.g. a reason textarea) */
  children?: React.ReactNode
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isLoading = false,
  children,
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} description={description} size="sm" disableBackdropClose={isLoading}>
      {children && <div className="mb-4">{children}</div>}
      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="h-9 rounded-lg border border-gray-200 px-4 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          {cancelLabel}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={cn(
            'h-9 rounded-lg px-4 text-sm font-medium text-white disabled:opacity-50',
            variant === 'danger'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100',
          )}
        >
          {isLoading ? 'Loading…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

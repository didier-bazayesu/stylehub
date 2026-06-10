/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, ErrorInfo } from 'react';
import { useUIStore } from '../../../store/useUIStore';
import { Toast as ToastUnit, Dialog, Button } from '../../ui';

// ==========================================
// 1. GLOBAL TOAST MANAGER
// ==========================================
export const Toast: React.FC = () => {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full animate-fade-in-up" id="global-toasts">
      {toasts.map((toast) => (
        <ToastUnit
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// ==========================================
// 2. ERROR BOUNDARY
// ==========================================
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: ErrorBoundaryProps;
  declare state: ErrorBoundaryState;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ERROR BOUNDARY CATCHED]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-neutral-25 text-center">
          <div className="font-mono text-xs text-rose-500 mb-2 font-bold animate-pulse">● CODE CRASH GUARDED</div>
          <h1 className="text-xl font-bold text-neutral-800 mb-2">Something went wrong in your visual view</h1>
          <p className="text-xs text-neutral-500 max-w-sm mb-6 leading-relaxed">
            {this.state.error?.message || 'A critical rendering error has occurred.'}
          </p>
          <Button onClick={() => window.location.reload()}>Refresh Webpage</Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// ==========================================
// 3. ALERT DIALOG
// ==========================================
export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  isDestructive = false,
}) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4" id="alert-dialog-contents">
        <p className="text-xs leading-relaxed text-neutral-600">{description}</p>
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100">
          <Button size="sm" variant="outline" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            size="sm"
            variant={isDestructive ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};

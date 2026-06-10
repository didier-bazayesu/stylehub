/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { Loader2 } from 'lucide-react';

// ==========================================
// 1. BUTTON
// ==========================================
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-98 duration-100',
          {
            'bg-neutral-900 hover:bg-neutral-800 text-white focus:ring-neutral-950': variant === 'primary',
            'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 focus:ring-neutral-200': variant === 'secondary',
            'border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-800 focus:ring-neutral-950': variant === 'outline',
            'hover:bg-neutral-50 text-neutral-700': variant === 'ghost',
            'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500': variant === 'danger',
            'bg-emerald-600 hover:bg-emerald-500 text-white focus:ring-emerald-500': variant === 'success',
          },
          {
            'px-3 py-1.5 text-xs': size === 'sm',
            'px-4 py-2 text-sm': size === 'md',
            'px-5 py-2.5 text-md': size === 'lg',
            'w-10 h-10 p-0': size === 'icon',
          },
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

// ==========================================
// 2. BADGE
// ==========================================
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'error' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', children, ...props }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors',
        {
          'bg-neutral-900 text-white border-transparent': variant === 'default',
          'bg-neutral-100 text-neutral-800 border-transparent': variant === 'secondary',
          'text-neutral-800 border-neutral-200 bg-transparent': variant === 'outline',
          'bg-emerald-50 text-emerald-700 border-emerald-200': variant === 'success',
          'bg-amber-50 text-amber-700 border-amber-200': variant === 'warning',
          'bg-rose-50 text-rose-700 border-rose-200': variant === 'error',
          'bg-blue-50 text-blue-700 border-blue-200': variant === 'info',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

// ==========================================
// 3. INPUT
// ==========================================
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = 'text', wrapperClassName, id, ...props }, ref) => {
    return (
      <div className={cn('flex flex-col gap-1.5 w-full', wrapperClassName)}>
        {label && (
          <label htmlFor={id} className="text-xs font-medium text-neutral-600">
            {label}
          </label>
        )}
        <input
          id={id}
          type={type}
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent disabled:opacity-50 disabled:pointer-events-none transition-shadow',
            error && 'border-rose-500 focus:ring-rose-500',
            className
          )}
          {...props}
        />
        {error && <span id={`${id}-error`} className="text-xs text-rose-500">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';

// ==========================================
// 4. LOADING
// ==========================================
export const Loading: React.FC<{ size?: 'sm' | 'md' | 'lg'; text?: string }> = ({ size = 'md', text = 'Loading style selection...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center" id="loading-spinner">
      <Loader2
        className={cn('animate-spin text-neutral-800', {
          'w-6 h-6': size === 'sm',
          'w-10 h-10': size === 'md',
          'w-16 h-16': size === 'lg',
        })}
      />
      {text && <p className="mt-4 text-sm text-neutral-500 font-mono">{text}</p>}
    </div>
  );
};

// ==========================================
// 5. EMPTY STATE
// ==========================================
export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, actionLabel, onAction, icon }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 border border-dashed border-neutral-200 rounded-2xl bg-neutral-25 text-center shadow-xs" id="empty-state">
      {icon ? (
        <div className="text-neutral-400 mb-4">{icon}</div>
      ) : (
        <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 mb-4 font-mono text-xl">ø</div>
      )}
      <h3 className="text-md font-semibold text-neutral-800 mb-1">{title}</h3>
      <p className="text-xs text-neutral-500 max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

// ==========================================
// 6. AVATAR
// ==========================================
export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({ className, src, fallback, size = 'sm', ...props }) => {
  const [hasError, setHasError] = React.useState(false);
  const initials = fallback.slice(0, 2).toUpperCase();

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-20 h-20 text-lg',
  };

  return (
    <div
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full border border-neutral-150 select-none bg-neutral-100 items-center justify-center font-semibold text-neutral-700',
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={fallback}
          onError={() => setHasError(true)}
          className="aspect-square h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

// ==========================================
// 7. CARD
// ==========================================
export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('rounded-xl border border-neutral-150 bg-white shadow-xs overflow-hidden', className)} {...props} />
);

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('p-5 border-b border-neutral-100 flex flex-col gap-1', className)} {...props} />
);

export const CardBody: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('p-5', className)} {...props} />
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('px-5 py-4 border-t border-neutral-100 bg-neutral-25 flex items-center justify-end', className)} {...props} />
);

// ==========================================
// 8. DIALOG (Simple inline modal wrapper)
// ==========================================
export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in" id="dialog-overlay">
      <div className="relative w-full max-w-md bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden animate-scale-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-150">
          <h2 className="font-semibold text-neutral-800">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-neutral-100 text-neutral-500 text-xs">✕</button>
        </div>
        <div className="p-5 max-h-[75vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// ==========================================
// 9. DROPDOWN (Generic Select-Trigger Panel)
// ==========================================
export interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
}

export const Dropdown: React.FC<DropdownProps> = ({ trigger, children, align = 'right' }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <div ref={containerRef} className="relative inline-block text-left" id="dropdown-container">
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">{trigger}</div>
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className={cn(
            'absolute z-40 mt-1.5 w-48 rounded-lg border border-neutral-150 bg-white py-1.5 shadow-md flex flex-col focus:outline-none animate-fade-in-down',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
};

// ==========================================
// 10. SELECT
// ==========================================
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string | number }[];
  wrapperClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, wrapperClassName, id, ...props }, ref) => {
    return (
      <div className={cn('flex flex-col gap-1.5 w-full', wrapperClassName)}>
        {label && (
          <label htmlFor={id} className="text-xs font-medium text-neutral-600">
            {label}
          </label>
        )}
        <select
          id={id}
          ref={ref}
          className={cn(
            'flex h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent disabled:opacity-50 disabled:pointer-events-none transition-shadow',
            error && 'border-rose-500 focus:ring-rose-500',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span id={`${id}-error`} className="text-xs text-rose-500">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';

// ==========================================
// 11. TABLE
// ==========================================
export const Table: React.FC<React.HTMLAttributes<HTMLTableElement>> = ({ className, ...props }) => (
  <div className="w-full overflow-x-auto rounded-lg border border-neutral-150" id="table-wrapper">
    <table className={cn('w-full border-collapse text-left text-sm', className)} {...props} />
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <thead className={cn('bg-neutral-50 text-xs font-semibold text-neutral-600 border-b border-neutral-150', className)} {...props} />
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ className, ...props }) => (
  <tbody className={cn('divide-y divide-neutral-100 bg-white', className)} {...props} />
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ className, ...props }) => (
  <tr className={cn('transition-colors hover:bg-neutral-25', className)} {...props} />
);

export const TableHead: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <th className={cn('p-4 font-medium select-none', className)} {...props} />
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ className, ...props }) => (
  <td className={cn('p-4 align-middle text-neutral-700', className)} {...props} />
);

// ==========================================
// 12. TABS
// ==========================================
export interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn('flex border-b border-neutral-200 gap-6 overflow-x-auto scrollbar-none', className)} id="tabs-container">
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 py-3 text-sm font-semibold border-b-2 border-transparent transition-all whitespace-nowrap cursor-pointer',
              active ? 'border-neutral-900 text-neutral-900' : 'text-neutral-400 hover:text-neutral-600'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

// ==========================================
// 13. TOAST (Handled globally by Zustand)
// ==========================================
export const Toast: React.FC<{ id: string; message: string; type: string; onClose: () => void }> = ({
  message,
  type,
  onClose,
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm max-w-sm w-full animate-fade-in-up bg-white',
        {
          'bg-emerald-50 border-emerald-100 text-emerald-800': type === 'success',
          'bg-rose-50 border-rose-100 text-rose-800': type === 'error',
          'bg-neutral-900 border-neutral-900 text-white': type === 'info' || type === 'warning',
        }
      )}
      id="toast-notification"
    >
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="p-0.5 rounded hover:bg-neutral-100/10 text-xs">✕</button>
    </div>
  );
};

// ==========================================
// 14. TOOLTIP
// ==========================================
export const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  return (
    <div className="relative group inline-block" id="tooltip-container">
      {children}
      <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 px-2.5 py-1 text-[10px] text-white bg-neutral-900 rounded-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xs">
        {text}
      </div>
    </div>
  );
};

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  wrapperClassName?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, wrapperClassName, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {props.required && (
              <span className="ml-0.5 text-red-500" aria-hidden>*</span>
            )}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm',
            'text-gray-900 placeholder:text-gray-400',
            'transition-colors duration-150 resize-y min-h-[80px]',
            'focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900',
            'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60',
            'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100',
            'dark:focus:border-gray-400 dark:focus:ring-gray-400',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className,
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {error && (
          <p className="text-xs text-red-500" role="alert">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>
        )}
      </div>
    )
  },
)

Textarea.displayName = 'Textarea'

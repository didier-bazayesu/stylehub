import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftAddon?: React.ReactNode
  rightAddon?: React.ReactNode
  wrapperClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftAddon,
      rightAddon,
      wrapperClassName,
      className,
      id,
      ...props
    },
    ref,
  ) => {
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
        <div className="relative flex">
          {leftAddon && (
            <div className="flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800">
              {leftAddon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'h-10 w-full border border-gray-300 bg-white px-3 py-2 text-sm',
              'text-gray-900 placeholder:text-gray-400',
              'transition-colors duration-150',
              'focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900',
              'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60',
              'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100',
              'dark:focus:border-gray-400 dark:focus:ring-gray-400',
              leftAddon ? 'rounded-r-lg' : 'rounded-lg',
              rightAddon ? 'rounded-r-none' : '',
              !leftAddon && !rightAddon && 'rounded-lg',
              error &&
                'border-red-500 focus:border-red-500 focus:ring-red-500 dark:border-red-500',
              className,
            )}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {rightAddon && (
            <div className="flex items-center rounded-r-lg border border-l-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800">
              {rightAddon}
            </div>
          )}
        </div>
        {error && (
          <p id={`${inputId}-error`} className="text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-gray-500 dark:text-gray-400">
            {hint}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

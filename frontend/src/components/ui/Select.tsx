import { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options: SelectOption[]
  placeholder?: string
  wrapperClassName?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, hint, options, placeholder, wrapperClassName, className, id, ...props },
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
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            className={cn(
              'h-10 w-full appearance-none rounded-lg border border-gray-300 bg-white pl-3 pr-9 text-sm',
              'text-gray-900 transition-colors duration-150',
              'focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900',
              'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-60',
              'dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100',
              'dark:focus:border-gray-400 dark:focus:ring-gray-400',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              className,
            )}
            aria-invalid={Boolean(error)}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>{placeholder}</option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
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

Select.displayName = 'Select'

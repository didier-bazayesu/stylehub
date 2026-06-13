import { useState, useEffect, useCallback, useRef } from 'react'

// ─── useDebounce ──────────────────────────────────────────────────────────────

export function useDebounce<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

// ─── usePagination ────────────────────────────────────────────────────────────

interface UsePaginationOptions {
  initialPage?: number
  initialLimit?: number
}

export function usePagination({
  initialPage = 1,
  initialLimit = 20,
}: UsePaginationOptions = {}) {
  const [page, setPage] = useState(initialPage)
  const [limit] = useState(initialLimit)

  const goToPage = useCallback((p: number) => setPage(p), [])
  const nextPage = useCallback(() => setPage((p) => p + 1), [])
  const prevPage = useCallback(() => setPage((p) => Math.max(1, p - 1)), [])
  const reset = useCallback(() => setPage(initialPage), [initialPage])

  return { page, limit, goToPage, nextPage, prevPage, reset }
}

// ─── useDisclosure ────────────────────────────────────────────────────────────

export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial)

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])

  return { isOpen, open, close, toggle }
}

// ─── useFileUpload ────────────────────────────────────────────────────────────

interface UseFileUploadOptions {
  accept?: string[]
  maxSizeBytes?: number
  multiple?: boolean
}

export function useFileUpload({
  accept = ['image/jpeg', 'image/png', 'image/webp'],
  maxSizeBytes = 5 * 1024 * 1024,
  multiple = false,
}: UseFileUploadOptions = {}) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const validate = useCallback(
    (fileList: File[]): string | null => {
      for (const file of fileList) {
        if (!accept.includes(file.type)) {
          return `Unsupported file type: ${file.type}. Accepted: ${accept.join(', ')}`
        }
        if (file.size > maxSizeBytes) {
          return `File too large. Max size: ${Math.round(maxSizeBytes / 1024 / 1024)}MB`
        }
      }
      return null
    },
    [accept, maxSizeBytes],
  )

  const handleFiles = useCallback(
  (fileList: File[]) => {
    const validationError = validate(fileList)
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)
    const incoming = multiple ? fileList : [fileList[0]]
    
   setFiles((prev) => {
  const merged = multiple ? [...prev, ...incoming] : incoming
  return merged.slice(0, 5)  // ← max 5
})
   setPreviews((prev) => {
  const newPreviews = incoming.map((f) => URL.createObjectURL(f))
  const merged = multiple ? [...prev, ...newPreviews] : newPreviews
  return merged.slice(0, 5)
})
  },
  [validate, multiple],
)


  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = Array.from(e.target.files ?? [])
      if (fileList.length) handleFiles(fileList)
    },
    [handleFiles],
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const fileList = Array.from(e.dataTransfer.files)
      if (fileList.length) handleFiles(fileList)
    },
    [handleFiles],
  )

  const clear = useCallback(() => {
    previews.forEach((url) => URL.revokeObjectURL(url))
    setFiles([])
    setPreviews([])
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }, [previews])

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url))
  }, [previews])

  return {
    files,
    previews,
    error,
    inputRef,
    onInputChange,
    onDrop,
    clear,
    openPicker: () => inputRef.current?.click(),
  }
}

// ─── useClipboard ─────────────────────────────────────────────────────────────

export function useClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), resetDelay)
      } catch {
        // Clipboard API may not be available
      }
    },
    [resetDelay],
  )

  return { copied, copy }
}

// ─── useMediaQuery ────────────────────────────────────────────────────────────

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mq = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [query])

  return matches
}

export const useIsMobile = () => useMediaQuery('(max-width: 767px)')
export const useIsTablet = () => useMediaQuery('(max-width: 1023px)')

// ─── useOutsideClick ──────────────────────────────────────────────────────────

export function useOutsideClick<T extends HTMLElement>(
  callback: () => void,
): React.RefObject<T> {
  const ref = useRef<T>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [callback])

  return ref
}

// ─── useLocalStorage ─────────────────────────────────────────────────────────

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch {
        // Silently fail
      }
    },
    [key, storedValue],
  )

  return [storedValue, setValue]
}

// ─── useScrollLock ────────────────────────────────────────────────────────────

export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (locked) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [locked])
}

// ─── useIntersectionObserver ──────────────────────────────────────────────────

export function useIntersectionObserver(
  options: IntersectionObserverInit = {},
) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    observer.observe(el)
    return () => observer.disconnect()
  }, [options])

  return { ref, isIntersecting }
}

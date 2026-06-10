/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';

// --- useDebounce ---
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// --- usePagination ---
export interface UsePaginationProps {
  totalItems: number;
  initialPage?: number;
  initialLimit?: number;
}

export function usePagination({ totalItems, initialPage = 1, initialLimit = 10 }: UsePaginationProps) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  const nextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1));
  }, []);

  const goToPage = useCallback((p: number) => {
    const pageNum = Math.max(1, Math.min(p, totalPages));
    setPage(pageNum);
  }, [totalPages]);

  return {
    page,
    limit,
    totalPages,
    setPage,
    setLimit,
    nextPage,
    prevPage,
    goToPage,
  };
}

// --- useFileUpload ---
export interface FileUploadState {
  progress: number;
  isDragging: boolean;
  uploadedUrl: string | null;
  error: string | null;
}

export function useFileUpload() {
  const [state, setState] = useState<FileUploadState>({
    progress: 0,
    isDragging: false,
    uploadedUrl: null,
    error: null,
  });

  const uploadFile = useCallback(async (file: File): Promise<string> => {
    setState((s) => ({ ...s, progress: 10, error: null }));
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      const err = 'Only image uploads are permitted';
      setState((s) => ({ ...s, error: err, progress: 0 }));
      throw new Error(err);
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB
      const err = 'Image matches over maximum 5MB size limit';
      setState((s) => ({ ...s, error: err, progress: 0 }));
      throw new Error(err);
    }

    try {
      // Simulate direct upload progress
      for (let i = 20; i <= 100; i += 20) {
        await new Promise((r) => setTimeout(r, 100));
        setState((s) => ({ ...s, progress: i }));
      }
      
      // Return a random beautiful fashion image from unsplash depending on file name
      const randomImages = [
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=400&h=600&fit=crop',
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=400&h=600&fit=crop'
      ];
      const url = randomImages[Math.floor(Math.random() * randomImages.length)];
      
      setState({
        progress: 100,
        isDragging: false,
        uploadedUrl: url,
        error: null,
      });
      return url;
    } catch (e: any) {
      setState((s) => ({ ...s, error: e.message, progress: 0 }));
      throw e;
    }
  }, []);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setState((s) => ({ ...s, isDragging: true }));
  }, []);

  const onDragLeave = useCallback(() => {
    setState((s) => ({ ...s, isDragging: false }));
  }, []);

  return {
    ...state,
    uploadFile,
    dragProps: {
      onDragOver,
      onDragLeave,
    },
    resetUpload: () => setState({ progress: 0, isDragging: false, uploadedUrl: null, error: null }),
  };
}

// --- useClipboard ---
export function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }, []);

  return { copied, copy };
}

// --- useMediaQuery ---
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

// --- useLocalStorage ---
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch {}
  }, [key, storedValue]);

  return [storedValue, setValue] as const;
}

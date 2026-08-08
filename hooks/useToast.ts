'use client';

import { useState, useCallback } from 'react';
import type { ToastType, ToastAction } from '@/components/ui/Toast';

export interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  action?: ToastAction;
  duration?: number;
}

interface UseToastReturn {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, 'id'>) => string;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
  success: (message: string, action?: ToastAction) => string;
  error: (message: string, action?: ToastAction) => string;
  warning: (message: string, action?: ToastAction) => string;
  info: (message: string, action?: ToastAction) => string;
}

let toastId = 0;

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const generateId = useCallback(() => {
    toastId += 1;
    return `toast-${toastId}-${Date.now()}`;
  }, []);

  const addToast = useCallback(
    (toast: Omit<ToastData, 'id'>): string => {
      const id = generateId();
      setToasts((prev) => [...prev, { ...toast, id }]);
      return id;
    },
    [generateId]
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback(
    (message: string, action?: ToastAction): string => {
      return addToast({ type: 'success', message, action });
    },
    [addToast]
  );

  const error = useCallback(
    (message: string, action?: ToastAction): string => {
      return addToast({ type: 'error', message, action, duration: 8000 });
    },
    [addToast]
  );

  const warning = useCallback(
    (message: string, action?: ToastAction): string => {
      return addToast({ type: 'warning', message, action, duration: 6000 });
    },
    [addToast]
  );

  const info = useCallback(
    (message: string, action?: ToastAction): string => {
      return addToast({ type: 'info', message, action });
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    dismissToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  };
}

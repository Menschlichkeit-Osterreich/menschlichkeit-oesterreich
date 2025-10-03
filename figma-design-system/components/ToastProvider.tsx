import { Toaster } from './ui/sonner';
import { useEffect } from 'react';

/**
 * Toast Notification Provider
 * Wrapped Sonner mit Custom Styling
 */
export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 4000,
        className: 'font-sans',
        style: {
          background: 'var(--background)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
        },
      }}
      richColors
      closeButton
    />
  );
}

export default ToastProvider;

// Toast Helper Functions
import { toast as sonnerToast } from 'sonner@2.0.3';
export { toast } from 'sonner@2.0.3';

// Custom Toast Presets
export const showToast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, { description });
  },
  
  error: (message: string, description?: string) => {
    sonnerToast.error(message, { description });
  },
  
  info: (message: string, description?: string) => {
    sonnerToast.info(message, { description });
  },
  
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, { description });
  },
  
  loading: (message: string) => {
    return sonnerToast.loading(message);
  },
  
  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, { loading, success, error });
  },
};
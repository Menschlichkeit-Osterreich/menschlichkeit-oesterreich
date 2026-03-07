import React, { useState, useCallback } from 'react';

// Define ApiError locally since it might not be exported
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API Hook Types
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface ApiHook<T> extends ApiState<T> {
  execute: () => Promise<void>;
  reset: () => void;
}

// Generic API Hook
export function useApi<T>(apiCall: () => Promise<T>, executeOnMount = false): ApiHook<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: executeOnMount,
    error: null,
  });

  const execute = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiCall();
      setState({
        data: result,
        loading: false,
        error: null,
      });
    } catch (error) {
      let errorMessage: string;
      if (error instanceof ApiError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Ein unbekannter Fehler ist aufgetreten';
      }

      setState({
        data: null,
        loading: false,
        error: errorMessage,
      });
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  // Execute on mount if requested
  React.useEffect(() => {
    if (executeOnMount) {
      execute();
    }
  }, [execute, executeOnMount]);

  return { ...state, execute, reset };
}

// Mutation Hook (for POST/PUT/DELETE operations)
export function useMutation<TData, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>
): {
  mutate: (variables: TVariables) => Promise<void>;
  data: TData | null;
  loading: boolean;
  error: string | null;
  reset: () => void;
} {
  const [state, setState] = useState<ApiState<TData>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(
    async (variables: TVariables) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await mutationFn(variables);
        setState({
          data: result,
          loading: false,
          error: null,
        });
      } catch (error) {
        let errorMessage: string;
        if (error instanceof ApiError) {
          errorMessage = error.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        } else {
          errorMessage = 'Ein unbekannter Fehler ist aufgetreten';
        }

        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
      }
    },
    [mutationFn]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, []);

  return { mutate, ...state, reset };
}

// Form Hook with validation
export function useForm<T extends Record<string, unknown>>(
  initialValues: T,
  validationRules?: Partial<Record<keyof T, (value: T[keyof T]) => string | null>>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = useCallback(
    (field: keyof T, value: T[keyof T]) => {
      setValues(prev => ({ ...prev, [field]: value }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const setFieldTouched = useCallback((field: keyof T, isTouched = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  const validate = useCallback(() => {
    if (!validationRules) return true;

    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const fieldKey = field as keyof T;
      const validator = validationRules[fieldKey];
      if (validator) {
        const error = validator(values[fieldKey]);
        if (error) {
          newErrors[fieldKey] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationRules]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const getFieldProps = useCallback(
    (field: keyof T) => ({
      value: values[field],
      onChange: (value: T[keyof T]) => setValue(field, value),
      onBlur: () => setFieldTouched(field, true),
      error: touched[field] ? errors[field] : undefined,
    }),
    [values, setValue, setFieldTouched, touched, errors]
  );

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validate,
    reset,
    getFieldProps,
    isValid: Object.keys(errors).length === 0,
    isDirty: Object.keys(touched).length > 0,
  };
}

// Local Storage Hook
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void, () => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  const setStoredValue = useCallback(
    (newValue: T) => {
      try {
        setValue(newValue);
        localStorage.setItem(key, JSON.stringify(newValue));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  const removeValue = useCallback(() => {
    try {
      setValue(defaultValue);
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  return [value, setStoredValue, removeValue];
}

// Debounced Value Hook
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Async Effect Hook
export function useAsyncEffect(
  effect: () => Promise<void> | (() => void),
  deps?: React.DependencyList
): void {
  React.useEffect(() => {
    const cleanup = effect();

    return () => {
      if (cleanup instanceof Promise) {
        cleanup.catch(console.error);
      } else if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, deps);
}

// Previous Value Hook
export function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T | undefined>(undefined);

  React.useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

// Media Query Hook
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(false);

  React.useEffect(() => {
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

// Window Size Hook
export function useWindowSize(): { width: number; height: number } {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  React.useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

// React is already imported at the top

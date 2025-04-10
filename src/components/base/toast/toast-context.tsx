// toast-context.tsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { Toast } from "./toast-type";

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, toast: Partial<Omit<Toast, "id">>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = { ...toast, id };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    return id;
  }, []);

  const updateToast = useCallback(
    (id: string, toast: Partial<Omit<Toast, "id">>) => {
      setToasts((prevToasts) =>
        prevToasts.map((t) => (t.id === id ? { ...t, ...toast } : t))
      );
    },
    []
  );

  const value = {
    toasts,
    addToast,
    removeToast,
    updateToast,
  };

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
};

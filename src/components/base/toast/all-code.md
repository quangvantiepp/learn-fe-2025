```tsx
// types.ts
export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  type: ToastType;
  duration?: number;
  onClose?: () => void;
}

// toast-context.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastType } from './types';

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, toast: Partial<Omit<Toast, 'id'>>) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
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

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = { ...toast, id };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);
    
    return id;
  }, []);

  const updateToast = useCallback((id: string, toast: Partial<Omit<Toast, 'id'>>) => {
    setToasts((prevToasts) =>
      prevToasts.map((t) => (t.id === id ? { ...t, ...toast } : t))
    );
  }, []);

  const value = {
    toasts,
    addToast,
    removeToast,
    updateToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

// toast-item.tsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { Toast, ToastType } from './types';

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const slideIn = keyframes`
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
`;

const ToastContainer = styled.div<{ type: ToastType; closing: boolean }>`
  position: relative;
  display: flex;
  width: 360px;
  padding: 16px;
  margin-bottom: 8px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: ${slideIn} 0.3s ease-out forwards;
  
  ${props => props.closing && `
    animation: ${slideOut} 0.3s ease-in forwards;
  `}
  
  ${props => {
    switch (props.type) {
      case 'success':
        return `
          background-color: #ebfbee;
          border-left: 4px solid #34c759;
        `;
      case 'error':
        return `
          background-color: #feecf0;
          border-left: 4px solid #ff3b30;
        `;
      case 'warning':
        return `
          background-color: #fff9db;
          border-left: 4px solid #ff9500;
        `;
      default:
        return `
          background-color: #e7f5ff;
          border-left: 4px solid #007aff;
        `;
    }
  }}
`;

const ToastContent = styled.div`
  flex: 1;
`;

const ToastTitle = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
`;

const ToastDescription = styled.div`
  font-size: 14px;
  color: #555;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  margin-left: 8px;
  padding: 4px;
  font-size: 16px;
  align-self: flex-start;
  
  &:hover {
    color: #333;
  }
`;

const ProgressBar = styled.div<{ duration: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: rgba(0, 0, 0, 0.1);
  width: 100%;
  
  &::after {
    content: '';
    position: absolute;
    height: 100%;
    left: 0;
    background-color: rgba(0, 0, 0, 0.3);
    width: 100%;
    animation: progress ${props => props.duration}ms linear forwards;
  }
  
  @keyframes progress {
    from {
      width: 100%;
    }
    to {
      width: 0%;
    }
  }
`;

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [closing, setClosing] = useState(false);
  const duration = toast.duration || 5000;

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      onRemove(toast.id);
      toast.onClose?.();
    }, 300);
  }, [toast, onRemove]);

  useEffect(() => {
    if (duration !== Infinity) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  return (
    <ToastContainer type={toast.type} closing={closing}>
      <ToastContent>
        {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
        {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
      </ToastContent>
      <CloseButton onClick={handleClose}>×</CloseButton>
      {duration !== Infinity && <ProgressBar duration={duration} />}
    </ToastContainer>
  );
};

// toast-viewport.tsx
import React from 'react';
import styled from '@emotion/styled';
import { ToastItem } from './toast-item';
import { useToast } from './toast-context';

interface ToastViewportProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

const ViewportContainer = styled.div<{ position: ToastViewportProps['position'] }>`
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  max-height: 100vh;
  padding: 16px;
  gap: 8px;
  pointer-events: none;
  
  & > * {
    pointer-events: auto;
  }
  
  ${props => {
    switch (props.position) {
      case 'top-left':
        return `
          top: 0;
          left: 0;
          align-items: flex-start;
        `;
      case 'top-center':
        return `
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          align-items: center;
        `;
      case 'bottom-left':
        return `
          bottom: 0;
          left: 0;
          align-items: flex-start;
          flex-direction: column-reverse;
        `;
      case 'bottom-right':
        return `
          bottom: 0;
          right: 0;
          align-items: flex-end;
          flex-direction: column-reverse;
        `;
      case 'bottom-center':
        return `
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          align-items: center;
          flex-direction: column-reverse;
        `;
      default:
        return `
          top: 0;
          right: 0;
          align-items: flex-end;
        `;
    }
  }}
`;

export const ToastViewport: React.FC<ToastViewportProps> = ({ position = 'top-right' }) => {
  const { toasts, removeToast } = useToast();

  return (
    <ViewportContainer position={position}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </ViewportContainer>
  );
};

// index.ts - File xuất các component để sử dụng
export * from './types';
export * from './toast-context';
export * from './toast-item';
export * from './toast-viewport';

// usage-example.tsx - Ví dụ cách sử dụng
import React from 'react';
import { ToastProvider, useToast, ToastViewport } from './index';

const ToastButton: React.FC = () => {
  const { addToast } = useToast();

  const showToast = (type: 'info' | 'success' | 'warning' | 'error') => {
    addToast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Toast`,
      description: `This is a ${type} toast message!`,
      type,
      duration: 5000,
      onClose: () => console.log(`${type} toast closed`),
    });
  };

  return (
    <div>
      <button onClick={() => showToast('info')}>Show Info Toast</button>
      <button onClick={() => showToast('success')}>Show Success Toast</button>
      <button onClick={() => showToast('warning')}>Show Warning Toast</button>
      <button onClick={() => showToast('error')}>Show Error Toast</button>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <ToastButton />
      <ToastViewport position="top-right" />
    </ToastProvider>
  );
};

export default App;
```
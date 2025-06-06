// types.ts
export type ToastType = 'info' | 'success' | 'warning' | 'error';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'secondary' | 'destructive';
}

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  type: ToastType;
  duration?: number;
  onClose?: () => void;
  actions?: ToastAction[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  pauseOnHover?: boolean;
}

// toast-context.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastType, ToastAction } from './types';

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, toast: Partial<Omit<Toast, 'id'>>) => void;
  setToastOpen: (id: string, open: boolean) => void;
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
    setToasts((prevToasts) => {
      const toast = prevToasts.find(t => t.id === id);
      if (toast?.onClose) {
        toast.onClose();
      }
      return prevToasts.filter((toast) => toast.id !== id);
    });
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = { 
      ...toast, 
      id, 
      open: toast.open !== undefined ? toast.open : true,
      pauseOnHover: toast.pauseOnHover !== undefined ? toast.pauseOnHover : true
    };
    
    setToasts((prevToasts) => [...prevToasts, newToast]);
    
    return id;
  }, []);

  const updateToast = useCallback((id: string, toast: Partial<Omit<Toast, 'id'>>) => {
    setToasts((prevToasts) =>
      prevToasts.map((t) => (t.id === id ? { ...t, ...toast } : t))
    );
  }, []);

  const setToastOpen = useCallback((id: string, open: boolean) => {
    setToasts(prevToasts => 
      prevToasts.map(toast => {
        if (toast.id === id) {
          toast.onOpenChange?.(open);
          return { ...toast, open };
        }
        return toast;
      })
    );

    if (!open) {
      // Allow time for animation before removing
      setTimeout(() => {
        removeToast(id);
      }, 300);
    }
  }, [removeToast]);

  const value = {
    toasts,
    addToast,
    removeToast,
    updateToast,
    setToastOpen,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
};

// toast-item.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { Toast, ToastType, ToastPosition, ToastAction } from './types';

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
  setOpen: (id: string, open: boolean) => void;
  position: ToastPosition;
}

const getSlideAnimation = (position: ToastPosition) => {
  switch (position) {
    case 'top-left':
      return {
        in: keyframes`
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        `,
        out: keyframes`
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        `
      };
    case 'top-center':
      return {
        in: keyframes`
          from { transform: translateY(-100%); }
          to { transform: translateY(0); }
        `,
        out: keyframes`
          from { transform: translateY(0); }
          to { transform: translateY(-100%); }
        `
      };
    case 'bottom-left':
      return {
        in: keyframes`
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        `,
        out: keyframes`
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        `
      };
    case 'bottom-right':
      return {
        in: keyframes`
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        `,
        out: keyframes`
          from { transform: translateX(0); }
          to { transform: translateX(100%); }
        `
      };
    case 'bottom-center':
      return {
        in: keyframes`
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        `,
        out: keyframes`
          from { transform: translateY(0); }
          to { transform: translateY(100%); }
        `
      };
    default: // top-right
      return {
        in: keyframes`
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        `,
        out: keyframes`
          from { transform: translateX(0); }
          to { transform: translateX(100%); }
        `
      };
  }
};

const ToastContainer = styled.div<{ type: ToastType; closing: boolean; position: ToastPosition; open: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 360px;
  padding: 16px;
  margin-bottom: 8px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: ${props => (props.open ? 1 : 0)};
  animation: ${props => {
    const animations = getSlideAnimation(props.position);
    return props.closing ? animations.out : animations.in;
  }} 0.3s ease-out forwards;

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

const ToastHeader = styled.div`
  display: flex;
  justify-content: space-between;
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

const ProgressBar = styled.div<{ duration: number; isPaused: boolean }>`
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
    animation-play-state: ${props => props.isPaused ? 'paused' : 'running'};
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

const ActionsContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  justify-content: flex-end;
`;

const ActionButton = styled.button<{ variant?: 'default' | 'primary' | 'secondary' | 'destructive' }>`
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
  
  ${props => {
    switch (props.variant) {
      case 'primary':
        return `
          background-color: #007aff;
          color: white;
          border: none;
          &:hover {
            background-color: #0056b3;
          }
        `;
      case 'secondary':
        return `
          background-color: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
          &:hover {
            background-color: #e5e7eb;
          }
        `;
      case 'destructive':
        return `
          background-color: #ef4444;
          color: white;
          border: none;
          &:hover {
            background-color: #dc2626;
          }
        `;
      default:
        return `
          background-color: transparent;
          color: #374151;
          border: 1px solid #d1d5db;
          &:hover {
            background-color: #f3f4f6;
          }
        `;
    }
  }}
`;

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove, setOpen, position }) => {
  const [closing, setClosing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const duration = toast.duration || 5000;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const remainingTimeRef = useRef(duration);
  const startTimeRef = useRef<number | null>(null);

  const handleClose = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setClosing(true);
    setOpen(toast.id, false);
  }, [toast.id, setOpen]);

  const handleMouseEnter = useCallback(() => {
    if (toast.pauseOnHover && timerRef.current && !isPaused) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      
      if (startTimeRef.current) {
        const elapsedTime = Date.now() - startTimeRef.current;
        remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsedTime);
      }
      
      setIsPaused(true);
    }
  }, [toast.pauseOnHover, isPaused]);

  const handleMouseLeave = useCallback(() => {
    if (toast.pauseOnHover && isPaused) {
      setIsPaused(false);
      startTimeRef.current = Date.now();
      
      if (remainingTimeRef.current > 0 && duration !== Infinity) {
        timerRef.current = setTimeout(handleClose, remainingTimeRef.current);
      }
    }
  }, [toast.pauseOnHover, isPaused, duration, handleClose]);

  useEffect(() => {
    if (!toast.open) {
      handleClose();
      return;
    }
    
    // Start timer for auto-dismissal
    if (duration !== Infinity && !isPaused) {
      startTimeRef.current = Date.now();
      remainingTimeRef.current = duration;
      timerRef.current = setTimeout(handleClose, duration);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [duration, handleClose, isPaused, toast.open]);

  return (
    <ToastContainer 
      type={toast.type} 
      closing={closing} 
      position={position}
      open={toast.open !== false}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ToastHeader>
        <ToastContent>
          {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
          {toast.description && <ToastDescription>{toast.description}</ToastDescription>}
        </ToastContent>
        <CloseButton onClick={handleClose}>×</CloseButton>
      </ToastHeader>
      
      {toast.actions && toast.actions.length > 0 && (
        <ActionsContainer>
          {toast.actions.map((action, index) => (
            <ActionButton 
              key={index} 
              variant={action.variant}
              onClick={() => {
                action.onClick();
                if (!isPaused) {
                  handleClose();
                }
              }}
            >
              {action.label}
            </ActionButton>
          ))}
        </ActionsContainer>
      )}
      
      {duration !== Infinity && (
        <ProgressBar duration={duration} isPaused={isPaused} />
      )}
    </ToastContainer>
  );
};

// toast-viewport.tsx
import React from 'react';
import styled from '@emotion/styled';
import { ToastItem } from './toast-item';
import { useToast } from './toast-context';
import { ToastPosition } from './types';

interface ToastViewportProps {
  position?: ToastPosition;
}

const ViewportContainer = styled.div<{ position: ToastPosition }>`
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
  const { toasts, removeToast, setToastOpen } = useToast();

  return (
    <ViewportContainer position={position}>
      {toasts.map((toast) => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onRemove={removeToast} 
          setOpen={setToastOpen}
          position={position}
        />
      ))}
    </ViewportContainer>
  );
};

// index.ts - Export components for use
export * from './types';
export * from './toast-context';
export * from './toast-item';
export * from './toast-viewport';

// usage-example.tsx - Example usage
import React, { useState } from 'react';
import { ToastProvider, useToast, ToastViewport, ToastPosition } from './index';

const ToastControls: React.FC = () => {
  const { addToast } = useToast();
  const [position, setPosition] = useState<ToastPosition>('top-right');

  const showToast = (type: 'info' | 'success' | 'warning' | 'error') => {
    addToast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Toast`,
      description: `This is a ${type} toast message! Position: ${position}`,
      type,
      duration: 5000,
      pauseOnHover: true,
      onClose: () => console.log(`${type} toast closed`),
    });
  };

  const showToastWithActions = (type: 'info' | 'success' | 'warning' | 'error') => {
    addToast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Toast With Actions`,
      description: `This toast has custom action buttons.`,
      type,
      duration: 10000,
      pauseOnHover: true,
      actions: [
        {
          label: 'Dismiss',
          onClick: () => console.log('Dismissed'),
          variant: 'default'
        },
        {
          label: 'Action',
          onClick: () => alert('Action clicked!'),
          variant: 'primary'
        }
      ]
    });
  };

  const showControlledToast = () => {
    const id = addToast({
      title: 'Controlled Toast',
      description: 'This toast can be controlled programmatically',
      type: 'info',
      duration: Infinity,
      open: true,
      onOpenChange: (open) => console.log('Toast open state changed:', open)
    });

    // Close the toast after 8 seconds
    setTimeout(() => {
      const { updateToast } = useToast();
      updateToast(id, { open: false });
    }, 8000);
  };

  return (
    <div style={{ margin: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h3>Toast Position</h3>
        <select 
          value={position} 
          onChange={(e) => setPosition(e.target.value as ToastPosition)}
          style={{ marginBottom: '20px', padding: '8px' }}
        >
          <option value="top-right">Top Right</option>
          <option value="top-left">Top Left</option>
          <option value="top-center">Top Center</option>
          <option value="bottom-right">Bottom Right</option>
          <option value="bottom-left">Bottom Left</option>
          <option value="bottom-center">Bottom Center</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => showToast('info')}>Info Toast</button>
        <button onClick={() => showToast('success')}>Success Toast</button>
        <button onClick={() => showToast('warning')}>Warning Toast</button>
        <button onClick={() => showToast('error')}>Error Toast</button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => showToastWithActions('info')}>Toast With Actions</button>
        <button onClick={showControlledToast}>Controlled Toast</button>
      </div>

      <ToastViewport position={position} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <ToastControls />
    </ToastProvider>
  );
};

export default App;

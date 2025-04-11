// types.ts - Thêm DisplayMode
export type ToastType = 'info' | 'success' | 'warning' | 'error';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
export type ToastDisplayMode = 'default' | 'single' | 'stacked';

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

// toast-context.tsx - Cập nhật context để thêm displayMode
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastType, ToastAction, ToastDisplayMode } from './types';

interface ToastContextValue {
  toasts: Toast[];
  displayMode: ToastDisplayMode;
  setDisplayMode: (mode: ToastDisplayMode) => void;
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
  defaultDisplayMode?: ToastDisplayMode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  defaultDisplayMode = 'default' 
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [displayMode, setDisplayMode] = useState<ToastDisplayMode>(defaultDisplayMode);

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
    
    setToasts((prevToasts) => {
      // Nếu trong chế độ 'single', xóa tất cả toast cũ
      if (displayMode === 'single') {
        return [newToast];
      }
      return [...prevToasts, newToast];
    });
    
    return id;
  }, [displayMode]);

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
    displayMode,
    setDisplayMode,
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

// toast-viewport.tsx - Cập nhật để hỗ trợ display modes
import React from 'react';
import styled from '@emotion/styled';
import { ToastItem } from './toast-item';
import { useToast } from './toast-context';
import { ToastPosition, ToastDisplayMode } from './types';

interface ToastViewportProps {
  position?: ToastPosition;
}

interface ViewportContainerProps {
  position: ToastPosition;
  displayMode: ToastDisplayMode;
}

const ViewportContainer = styled.div<ViewportContainerProps>`
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  max-height: 100vh;
  padding: 16px;
  gap: ${props => props.displayMode === 'stacked' ? '4px' : '8px'};
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
  const { toasts, removeToast, setToastOpen, displayMode } = useToast();

  // Khi ở chế độ stacked, chỉ hiển thị một phần của toast cũ
  const visibleToasts = displayMode === 'single' 
    ? toasts.slice(-1) // Chỉ toast mới nhất
    : toasts;

  return (
    <ViewportContainer position={position} displayMode={displayMode}>
      {visibleToasts.map((toast, index) => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onRemove={removeToast} 
          setOpen={setToastOpen}
          position={position}
          displayMode={displayMode}
          index={index}
          totalToasts={visibleToasts.length}
        />
      ))}
    </ViewportContainer>
  );
};

// toast-item.tsx - Cập nhật để hỗ trợ stacked mode
import React, { useState, useEffect, useCallback, useRef } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { Toast, ToastType, ToastPosition, ToastAction, ToastDisplayMode } from './types';

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
  setOpen: (id: string, open: boolean) => void;
  position: ToastPosition;
  displayMode: ToastDisplayMode;
  index: number;
  totalToasts: number;
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

interface ToastContainerProps {
  type: ToastType; 
  closing: boolean; 
  position: ToastPosition;
  open: boolean;
  displayMode: ToastDisplayMode;
  index: number;
  totalToasts: number;
  isNewest: boolean;
}

const ToastContainer = styled.div<ToastContainerProps>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 360px;
  padding: 16px;
  margin-bottom: ${props => props.displayMode === 'stacked' && !props.isNewest ? '0' : '8px'};
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: ${props => (props.open ? 1 : 0)};
  
  ${props => props.displayMode === 'stacked' && !props.isNewest ? `
    position: absolute;
    z-index: ${1000 - props.index};
    ${getStackedPositioning(props.index, props.totalToasts, props.position)}
    width: 340px;
    height: 20px;
    overflow: hidden;
    padding: 8px 16px;
  ` : ''}
  
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

// Helper để tính toán vị trí cho chế độ stacked
const getStackedPositioning = (index: number, total: number, position: ToastPosition) => {
  const isBottom = position.startsWith('bottom');
  const offset = (index) * 10; // Mỗi toast phía sau lùi 10px
  
  if (isBottom) {
    return `bottom: ${offset}px;`;
  } else {
    return `top: ${offset}px;`;
  }
};

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

// Component mới để hiển thị số lượng toast trong stacked mode
const StackedCounter = styled.div`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 12px;
  font-weight: bold;
  color: #555;
`;

export const ToastItem: React.FC<ToastItemProps> = ({ 
  toast, 
  onRemove, 
  setOpen, 
  position, 
  displayMode,
  index,
  totalToasts
}) => {
  const [closing, setClosing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const duration = toast.duration || 5000;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const remainingTimeRef = useRef(duration);
  const startTimeRef = useRef<number | null>(null);
  const isNewest = index === totalToasts - 1;

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

  // Chỉ toast mới nhất mới tự động đóng (cho chế độ stacked)
  const shouldAutoClose = displayMode !== 'stacked' || isNewest;

  useEffect(() => {
    if (!toast.open) {
      handleClose();
      return;
    }
    
    // Start timer for auto-dismissal (if newest toast in stacked mode or any toast in other modes)
    if (shouldAutoClose && duration !== Infinity && !isPaused) {
      startTimeRef.current = Date.now();
      remainingTimeRef.current = duration;
      timerRef.current = setTimeout(handleClose, duration);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [duration, handleClose, isPaused, toast.open, shouldAutoClose]);

  // Khi ở chế độ stacked và không phải toast mới nhất
  if (displayMode === 'stacked' && !isNewest) {
    return (
      <ToastContainer 
        type={toast.type} 
        closing={closing} 
        position={position}
        open={toast.open !== false}
        displayMode={displayMode}
        index={index}
        totalToasts={totalToasts}
        isNewest={isNewest}
      >
        <ToastContent>
          {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
        </ToastContent>
        {index === 0 && totalToasts > 2 && (
          <StackedCounter>+{totalToasts - 1}</StackedCounter>
        )}
      </ToastContainer>
    );
  }

  return (
    <ToastContainer 
      type={toast.type} 
      closing={closing} 
      position={position}
      open={toast.open !== false}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      displayMode={displayMode}
      index={index}
      totalToasts={totalToasts}
      isNewest={isNewest}
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

// Cập nhật usage-example.tsx để thêm chế độ hiển thị
import React, { useState } from 'react';
import { 
  ToastProvider, 
  useToast, 
  ToastViewport, 
  ToastPosition, 
  ToastDisplayMode 
} from './index';

const ToastControls: React.FC = () => {
  const { addToast, displayMode, setDisplayMode } = useToast();
  const [position, setPosition] = useState<ToastPosition>('top-right');

  const showToast = (type: 'info' | 'success' | 'warning' | 'error') => {
    addToast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Toast`,
      description: `This is a ${type} toast message! Position: ${position}, Mode: ${displayMode}`,
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
        <h3>Toast Options</h3>
        <div style={{ display: 'flex', gap: '20px' }}>
          <div>
            <label htmlFor="position-select">Position: </label>
            <select 
              id="position-select"
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
          
          <div>
            <label htmlFor="display-mode-select">Display Mode: </label>
            <select
              id="display-mode-select"
              value={displayMode}
              onChange={(e) => setDisplayMode(e.target.value as ToastDisplayMode)}
              style={{ marginBottom: '20px', padding: '8px' }}
            >
              <option value="default">Default (Show All)</option>
              <option value="single">Single (Only Newest)</option>
              <option value="stacked">Stacked</option>
            </select>
          </div>
        </div>
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
    <ToastProvider defaultDisplayMode="default">
      <ToastControls />
    </ToastProvider>
  );
};

export default App;

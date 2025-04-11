// types.ts - Loại bỏ chế độ stacked
export type ToastType = 'info' | 'success' | 'warning' | 'error';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
export type ToastDisplayMode = 'default' | 'single';

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
  // Thêm trạng thái cho việc đóng mượt mà
  removing?: boolean;
}

// toast-context.tsx - Cập nhật context
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastType, ToastAction, ToastDisplayMode } from './types';

interface ToastContextValue {
  toasts: Toast[];
  displayMode: ToastDisplayMode;
  setDisplayMode: (mode: ToastDisplayMode) => void;
  addToast: (toast: Omit<Toast, 'id' | 'removing'>) => string;
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

  // Cải thiện quá trình xóa toast để đảm bảo animation mượt mà
  const removeToast = useCallback((id: string) => {
    // Đánh dấu toast đang được xóa trước
    setToasts((prevToasts) => {
      return prevToasts.map(toast => 
        toast.id === id ? { ...toast, removing: true } : toast
      );
    });

    // Sau khi animation kết thúc, thực sự xóa toast khỏi state
    setTimeout(() => {
      setToasts((prevToasts) => {
        const toast = prevToasts.find(t => t.id === id);
        if (toast?.onClose) {
          toast.onClose();
        }
        return prevToasts.filter((toast) => toast.id !== id);
      });
    }, 300); // Đảm bảo thời gian này phải khớp với thời gian animation
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id' | 'removing'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = { 
      ...toast, 
      id, 
      open: toast.open !== undefined ? toast.open : true,
      pauseOnHover: toast.pauseOnHover !== undefined ? toast.pauseOnHover : true,
      removing: false
    };
    
    setToasts((prevToasts) => {
      // Nếu trong chế độ 'single', xóa tất cả toast cũ
      if (displayMode === 'single') {
        // Đánh dấu tất cả toast hiện tại là đang xóa
        const markedToasts = prevToasts.map(t => ({ ...t, removing: true }));
        
        // Sau khi animation hoàn tất, thực sự xóa các toast cũ
        setTimeout(() => {
          setToasts([newToast]);
        }, 300);
        
        return [...markedToasts, newToast];
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
      removeToast(id);
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

// toast-viewport.tsx - Cập nhật viewport
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
  const { toasts, removeToast, setToastOpen, displayMode } = useToast();

  return (
    <ViewportContainer position={position} displayMode={displayMode}>
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

// toast-item.tsx - Cập nhật toast item
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
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        `,
        out: keyframes`
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-100%); opacity: 0; }
        `
      };
    case 'top-center':
      return {
        in: keyframes`
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        `,
        out: keyframes`
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-100%); opacity: 0; }
        `
      };
    case 'bottom-left':
      return {
        in: keyframes`
          from { transform: translateX(-100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        `,
        out: keyframes`
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-100%); opacity: 0; }
        `
      };
    case 'bottom-right':
      return {
        in: keyframes`
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        `,
        out: keyframes`
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        `
      };
    case 'bottom-center':
      return {
        in: keyframes`
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        `,
        out: keyframes`
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(100%); opacity: 0; }
        `
      };
    default: // top-right
      return {
        in: keyframes`
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        `,
        out: keyframes`
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        `
      };
  }
};

interface ToastContainerProps {
  type: ToastType; 
  removing: boolean; 
  position: ToastPosition;
  open: boolean;
}

const ToastContainer = styled.div<ToastContainerProps>`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 360px;
  padding: 16px;
  margin-bottom: 8px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  
  /* Các luật về animation */
  animation: ${props => {
    const animations = getSlideAnimation(props.position);
    return props.removing ? animations.out : animations.in;
  }} 0.3s ease-out forwards;
  
  /* Thêm transition cho việc di chuyển mượt mà */
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;

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

export const ToastItem: React.FC<ToastItemProps> = ({ 
  toast, 
  onRemove, 
  setOpen, 
  position
}) => {
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
    if (duration !== Infinity && !isPaused && !toast.removing) {
      startTimeRef.current = Date.now();
      remainingTimeRef.current = duration;
      timerRef.current = setTimeout(handleClose, duration);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [duration, handleClose, isPaused, toast.open, toast.removing]);

  return (
    <ToastContainer 
      type={toast.type} 
      removing={toast.removing || false}
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
      
      {duration !== Infinity && !toast.removing && (
        <ProgressBar duration={duration} isPaused={isPaused} />
      )}
    </ToastContainer>
  );
};

// Cập nhật usage-example.tsx để bỏ chế độ stacked
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

  // Thử tạo nhiều toast để kiểm tra animation mượt mà
  const createMultipleToasts = () => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        addToast({
          title: `Toast #${i + 1}`,
          description: `This is toast number ${i + 1} in the sequence`,
          type: i % 2 === 0 ? 'info' : 'success',
          duration: 5000 + i * 500, // Các toast sẽ đóng gần nhau
          pauseOnHover: true,
        });
      }, i * 200); // Tạo các toast cách nhau 200ms
    }
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
        <button onClick={createMultipleToasts}>Create 5 Toasts</button>
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

// edit toast
// Sửa hàm addToast trong toast-context.tsx
const addToast = useCallback((toast: Omit<Toast, 'id' | 'removing'>) => {
  const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const newToast: Toast = { 
    ...toast, 
    id, 
    open: toast.open !== undefined ? toast.open : true,
    pauseOnHover: toast.pauseOnHover !== undefined ? toast.pauseOnHover : true,
    removing: false
  };
  
  setToasts((prevToasts) => {
    // Nếu trong chế độ 'single', chỉ hiển thị toast mới nhất
    if (displayMode === 'single') {
      // Đánh dấu tất cả toast hiện tại là đang xóa
      const markedToasts = prevToasts.map(t => ({ ...t, removing: true }));
      
      // Thêm toast mới
      const updatedToasts = [...markedToasts, newToast];
      
      // Xóa các toast cũ sau khi animation hoàn tất
      prevToasts.forEach(oldToast => {
        setTimeout(() => {
          setToasts(current => current.filter(t => 
            t.id === newToast.id || t.id !== oldToast.id
          ));
        }, 300);
      });
      
      return updatedToasts;
    }
    
    // Chế độ default - thêm toast mới vào danh sách
    return [...prevToasts, newToast];
  });
  
  return id;
}, [displayMode]);

// Cập nhật removeToast để xử lý tốt hơn trong cả hai chế độ
const removeToast = useCallback((id: string) => {
  // Đánh dấu toast đang được xóa trước
  setToasts((prevToasts) => {
    return prevToasts.map(toast => 
      toast.id === id ? { ...toast, removing: true } : toast
    );
  });

  // Sau khi animation kết thúc, thực sự xóa toast khỏi state
  setTimeout(() => {
    setToasts((prevToasts) => {
      const toast = prevToasts.find(t => t.id === id);
      if (toast?.onClose) {
        toast.onClose();
      }
      return prevToasts.filter((toast) => toast.id !== id);
    });
  }, 300); // Đảm bảo thời gian này phải khớp với thời gian animation
}, []);

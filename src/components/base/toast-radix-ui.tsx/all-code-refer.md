```tsx
// File: components/Toast/types.ts
import * as RadixToast from '@radix-ui/react-toast';

export type ToastVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
export type ToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
export type ToastSize = 'small' | 'medium' | 'large';

export interface ToastRootProps extends RadixToast.ToastProps {
  variant?: ToastVariant;
  size?: ToastSize;
  hasIcon?: boolean;
}

export interface ToastTitleProps extends RadixToast.ToastTitleProps {
  size?: ToastSize;
  hasIcon?: boolean;
  variant?: ToastVariant;
}

export interface ToastDescriptionProps extends RadixToast.ToastDescriptionProps {
  size?: ToastSize;
  highlight?: boolean;
  variant?: ToastVariant;
}

export interface ToastActionProps extends RadixToast.ToastActionProps {
  altText: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface ToastCloseProps extends RadixToast.ToastCloseProps {
  hasIcon?: boolean;
  size?: ToastSize;
}

export interface ToastProviderProps extends RadixToast.ToastProviderProps {
  position?: ToastPosition;
}

export interface ToastViewportProps extends RadixToast.ToastViewportProps {
  position?: ToastPosition;
}

// File: components/Toast/styles.ts
import styled from '@emotion/styled';
import * as RadixToast from '@radix-ui/react-toast';
import { 
  ToastRootProps, 
  ToastTitleProps, 
  ToastDescriptionProps, 
  ToastActionProps, 
  ToastCloseProps,
  ToastViewportProps,
  ToastPosition
} from './types';

// Helper functions for position
const getViewportPositionStyles = (position?: ToastPosition) => {
  switch (position) {
    case 'top-left':
      return `
        top: 0;
        left: 0;
        align-items: flex-start;
      `;
    case 'top-right':
      return `
        top: 0;
        right: 0;
        align-items: flex-end;
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
      `;
    case 'bottom-center':
      return `
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        align-items: center;
      `;
    case 'bottom-right':
    default:
      return `
        bottom: 0;
        right: 0;
        align-items: flex-end;
      `;
  }
};

// Helper function for variant colors
const getVariantStyles = (variant?: string) => {
  switch (variant) {
    case 'success':
      return {
        background: '#EDF7ED',
        borderColor: '#4CAF50',
        titleColor: '#1E4620',
        textColor: '#3E6931'
      };
    case 'warning':
      return {
        background: '#FFF9E6',
        borderColor: '#FFC107',
        titleColor: '#663D00',
        textColor: '#8A5A00'
      };
    case 'error':
      return {
        background: '#FDEDED',
        borderColor: '#F44336',
        titleColor: '#621B16',
        textColor: '#92251C'
      };
    case 'info':
      return {
        background: '#E5F6FD',
        borderColor: '#03A9F4',
        titleColor: '#014361',
        textColor: '#025A8B'
      };
    default:
      return {
        background: 'white',
        borderColor: '#E0E0E0',
        titleColor: '#1A1A1A',
        textColor: '#6F6F6F'
      };
  }
};

// Helper function for size
const getSizeStyles = (size?: string, element?: string) => {
  if (element === 'title') {
    switch (size) {
      case 'small':
        return 'font-size: 14px; margin-bottom: 2px;';
      case 'large':
        return 'font-size: 18px; margin-bottom: 8px;';
      case 'medium':
      default:
        return 'font-size: 16px; margin-bottom: 5px;';
    }
  }
  
  if (element === 'description') {
    switch (size) {
      case 'small':
        return 'font-size: 12px;';
      case 'large':
        return 'font-size: 15px;';
      case 'medium':
      default:
        return 'font-size: 13px;';
    }
  }
  
  if (element === 'root') {
    switch (size) {
      case 'small':
        return 'padding: 10px 15px; max-width: 300px;';
      case 'large':
        return 'padding: 16px 24px; max-width: 500px;';
      case 'medium':
      default:
        return 'padding: 15px 20px; max-width: 400px;';
    }
  }
  
  if (element === 'close') {
    switch (size) {
      case 'small':
        return 'width: 16px; height: 16px;';
      case 'large':
        return 'width: 24px; height: 24px;';
      case 'medium':
      default:
        return 'width: 20px; height: 20px;';
    }
  }
  
  return '';
};

// Styled components
export const StyledToastRoot = styled(RadixToast.Root)<ToastRootProps>`
  background-color: ${props => getVariantStyles(props.variant).background};
  border-left: 4px solid ${props => getVariantStyles(props.variant).borderColor};
  border-radius: 6px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
  ${props => getSizeStyles(props.size, 'root')}
  display: grid;
  grid-template-areas: 'title action' 'description action';
  grid-template-columns: auto max-content;
  column-gap: 15px;
  align-items: center;
  position: relative;

  &[data-state='open'] {
    animation: slideIn 150ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  &[data-state='closed'] {
    animation: slideOut 100ms ease-in;
  }
  &[data-swipe='move'] {
    transform: translateX(var(--radix-toast-swipe-move-x));
  }
  &[data-swipe='cancel'] {
    transform: translateX(0);
    transition: transform 200ms ease-out;
  }
  &[data-swipe='end'] {
    animation: swipeOut 100ms ease-out;
  }

  @keyframes slideIn {
    from {
      transform: translateX(calc(100% + 25px));
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(calc(100% + 25px));
    }
  }

  @keyframes swipeOut {
    from {
      transform: translateX(var(--radix-toast-swipe-end-x));
    }
    to {
      transform: translateX(calc(100% + 25px));
    }
  }
`;

export const StyledToastTitle = styled(RadixToast.Title)<ToastTitleProps>`
  grid-area: title;
  font-weight: 600;
  color: ${props => getVariantStyles(props.variant).titleColor};
  ${props => getSizeStyles(props.size, 'title')}
  display: flex;
  align-items: center;
  gap: ${props => props.hasIcon ? '8px' : '0'};
`;

export const StyledToastDescription = styled(RadixToast.Description)<ToastDescriptionProps>`
  grid-area: description;
  margin: 0;
  color: ${props => getVariantStyles(props.variant).textColor};
  line-height: 1.4;
  ${props => getSizeStyles(props.size, 'description')}
  ${props => props.highlight && `
    font-weight: 500;
    background-color: rgba(0, 0, 0, 0.05);
    padding: 4px 8px;
    border-radius: 4px;
    margin-top: 4px;
    display: inline-block;
  `}
`;

export const StyledToastAction = styled(RadixToast.Action)<ToastActionProps>`
  grid-area: action;
  align-self: flex-start;
  margin-top: 2px;

  button {
    border: none;
    border-radius: 4px;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    
    ${props => {
      switch(props.variant) {
        case 'secondary':
          return `
            background-color: #F5F5F5;
            color: #333333;
            &:hover {
              background-color: #EBEBEB;
            }
          `;
        case 'outline':
          return `
            background-color: transparent;
            color: ${getVariantStyles().titleColor};
            border: 1px solid #E0E0E0;
            &:hover {
              background-color: #F5F5F5;
            }
          `;
        case 'primary':
        default:
          return `
            background-color: ${getVariantStyles(props.variant as any).borderColor};
            color: white;
            &:hover {
              filter: brightness(1.1);
            }
          `;
      }
    }}
  }
`;

export const StyledToastClose = styled(RadixToast.Close)<ToastCloseProps>`
  position: absolute;
  top: 8px;
  right: 8px;
  border: none;
  background: transparent;
  color: #A1A1A1;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  ${props => getSizeStyles(props.size, 'close')}
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: #333333;
  }
`;

export const StyledToastViewport = styled(RadixToast.Viewport)<ToastViewportProps>`
  position: fixed;
  ${props => getViewportPositionStyles(props.position)}
  display: flex;
  flex-direction: column;
  padding: 25px;
  gap: 10px;
  width: fit-content;
  max-width: 100vw;
  margin: 0;
  list-style: none;
  z-index: 2147483647;
  outline: none;
`;

// File: components/Toast/ToastTitle.tsx
import React, { forwardRef } from 'react';
import { StyledToastTitle } from './styles';
import { ToastTitleProps } from './types';
import * as Icons from '@radix-ui/react-icons';

export const ToastTitle = forwardRef<HTMLHeadingElement, ToastTitleProps>(({ 
  children, 
  hasIcon = true, 
  variant, 
  ...props 
}, ref) => {
  const getIcon = () => {
    if (!hasIcon || !variant) return null;
    
    switch (variant) {
      case 'success':
        return <Icons.CheckCircledIcon className="toast-icon" color="#4CAF50" />;
      case 'warning':
        return <Icons.ExclamationTriangleIcon className="toast-icon" color="#FFC107" />;
      case 'error':
        return <Icons.CrossCircledIcon className="toast-icon" color="#F44336" />;
      case 'info':
        return <Icons.InfoCircledIcon className="toast-icon" color="#03A9F4" />;
      default:
        return null;
    }
  };

  return (
    <StyledToastTitle ref={ref} hasIcon={hasIcon} variant={variant} {...props}>
      {getIcon()}
      {children}
    </StyledToastTitle>
  );
});

ToastTitle.displayName = 'ToastTitle';

// File: components/Toast/ToastDescription.tsx
import React, { forwardRef } from 'react';
import { StyledToastDescription } from './styles';
import { ToastDescriptionProps } from './types';

export const ToastDescription = forwardRef<HTMLParagraphElement, ToastDescriptionProps>((props, ref) => {
  return <StyledToastDescription ref={ref} {...props} />;
});

ToastDescription.displayName = 'ToastDescription';

// File: components/Toast/ToastAction.tsx
import React, { forwardRef } from 'react';
import { StyledToastAction } from './styles';
import { ToastActionProps } from './types';

export const ToastAction = forwardRef<HTMLButtonElement, ToastActionProps>((props, ref) => {
  return <StyledToastAction ref={ref} {...props} />;
});

ToastAction.displayName = 'ToastAction';

// File: components/Toast/ToastClose.tsx
import React, { forwardRef } from 'react';
import { StyledToastClose } from './styles';
import { ToastCloseProps } from './types';
import { Cross2Icon } from '@radix-ui/react-icons';

export const ToastClose = forwardRef<HTMLButtonElement, ToastCloseProps>(({ 
  children, 
  hasIcon = true, 
  ...props 
}, ref) => {
  return (
    <StyledToastClose ref={ref} {...props}>
      {hasIcon ? <Cross2Icon /> : children}
    </StyledToastClose>
  );
});

ToastClose.displayName = 'ToastClose';

// File: components/Toast/ToastViewport.tsx
import React, { forwardRef } from 'react';
import { StyledToastViewport } from './styles';
import { ToastViewportProps } from './types';

export const ToastViewport = forwardRef<HTMLOListElement, ToastViewportProps>(({ position = 'bottom-right', ...props }, ref) => {
  return <StyledToastViewport ref={ref} position={position} {...props} />;
});

ToastViewport.displayName = 'ToastViewport';

// File: components/Toast/index.ts
import * as RadixToast from '@radix-ui/react-toast';
import { StyledToastRoot } from './styles';
import { ToastTitle } from './ToastTitle';
import { ToastDescription } from './ToastDescription';
import { ToastAction } from './ToastAction';
import { ToastClose } from './ToastClose';
import { ToastViewport } from './ToastViewport';

// Export component using Object.assign pattern
export const Toast = Object.assign(StyledToastRoot, {
  Provider: RadixToast.Provider,
  Title: ToastTitle,
  Description: ToastDescription,
  Action: ToastAction,
  Close: ToastClose,
  Viewport: ToastViewport,
});

// Export types
export type {
  ToastVariant,
  ToastPosition,
  ToastSize,
  ToastRootProps,
  ToastTitleProps,
  ToastDescriptionProps,
  ToastActionProps,
  ToastCloseProps,
  ToastProviderProps,
  ToastViewportProps
} from './types';

// File: hooks/useToast.ts
import { useState, useCallback } from 'react';
import { ToastVariant, ToastSize, ToastPosition } from '../components/Toast/types';

interface ToastSettings {
  variant?: ToastVariant;
  size?: ToastSize;
  duration?: number;
  position?: ToastPosition;
  hasIcon?: boolean;
  title?: string;
  description?: string;
  action?: {
    text: string;
    altText: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
  };
  onClose?: () => void;
}

interface UseToastReturn {
  open: boolean;
  setOpen: (open: boolean) => void;
  toastSettings: ToastSettings;
  showToast: (settings: ToastSettings) => void;
  hideToast: () => void;
}

export const useToast = (defaultSettings?: ToastSettings): UseToastReturn => {
  const [open, setOpen] = useState(false);
  const [toastSettings, setToastSettings] = useState<ToastSettings>(defaultSettings || {
    variant: 'default',
    size: 'medium',
    duration: 5000,
    position: 'bottom-right',
    hasIcon: true
  });
  
  const showToast = useCallback((settings: ToastSettings) => {
    setToastSettings(prev => ({ ...prev, ...settings }));
    setOpen(true);
  }, []);
  
  const hideToast = useCallback(() => {
    setOpen(false);
  }, []);
  
  return {
    open,
    setOpen,
    toastSettings,
    showToast,
    hideToast
  };
};

// File: example-usage.tsx
import React from 'react';
import { Toast } from './components/Toast';
import { useToast } from './hooks/useToast';

export const App = () => {
  const { open, setOpen, toastSettings, showToast } = useToast();
  
  const handleShowSuccessToast = () => {
    showToast({
      variant: 'success',
      title: 'Success',
      description: 'Your changes have been saved successfully!',
      action: {
        text: 'Undo',
        altText: 'Undo last action',
        onClick: () => console.log('Undo clicked'),
        variant: 'primary'
      }
    });
  };
  
  const handleShowErrorToast = () => {
    showToast({
      variant: 'error',
      title: 'Error',
      description: 'An error occurred while saving your changes.',
      size: 'large'
    });
  };
  
  const handleShowWarningToast = () => {
    showToast({
      variant: 'warning',
      title: 'Warning',
      description: 'Your session will expire in 5 minutes.',
      position: 'top-right'
    });
  };
  
  const handleShowInfoToast = () => {
    showToast({
      variant: 'info',
      title: 'Information',
      description: 'A new version is available. Please refresh the page.',
      size: 'small'
    });
  };
  
  return (
    <div style={{ padding: '20px' }}>
      <h1>Toast Component Example</h1>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={handleShowSuccessToast}>Show Success Toast</button>
        <button onClick={handleShowErrorToast}>Show Error Toast</button>
        <button onClick={handleShowWarningToast}>Show Warning Toast</button>
        <button onClick={handleShowInfoToast}>Show Info Toast</button>
      </div>
      
      <Toast.Provider swipeDirection="right">
        <Toast 
          open={open} 
          onOpenChange={setOpen}
          variant={toastSettings.variant}
          size={toastSettings.size}
          hasIcon={toastSettings.hasIcon}
          duration={toastSettings.duration}
        >
          <Toast.Title variant={toastSettings.variant} hasIcon>
            {toastSettings.title}
          </Toast.Title>
          
          <Toast.Description>
            {toastSettings.description}
          </Toast.Description>
          
          {toastSettings.action && (
            <Toast.Action 
              altText={toastSettings.action.altText}
              onClick={toastSettings.action.onClick}
              variant={toastSettings.action.variant}
              asChild
            >
              <button>{toastSettings.action.text}</button>
            </Toast.Action>
          )}
          
          <Toast.Close hasIcon />
        </Toast>
        
        <Toast.Viewport position={toastSettings.position} />
      </Toast.Provider>
    </div>
  );
};
```
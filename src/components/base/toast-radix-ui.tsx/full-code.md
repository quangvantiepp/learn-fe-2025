// toast-type
import * as RadixToast from '@radix-ui/react-toast';

export type ToastVariant = 'default' | 'success' | 'warning' | 'error' | 'info';
export type ToastPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
export type ToastSize = 'small' | 'medium' | 'large';
export type SwipeDirection = 'left' | 'right' | 'up' | 'down';


export interface ToastRootProps extends RadixToast.ToastProps {
  variant?: ToastVariant;
  size?: ToastSize;
  hasIcon?: boolean;
  position: ToastPosition;
  useCustomStyle?: boolean;
  isDescription?: boolean;
  isAction?: boolean;
  isClose?: boolean;
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
  children?: React.ReactNode;
}

export interface ToastCloseProps extends RadixToast.ToastCloseProps {
  size?: ToastSize;
}

export interface ToastViewportProps extends RadixToast.ToastViewportProps {
  position?: ToastPosition;
}

export interface ToastCustomRenderProps {
  variant?: ToastVariant;
  size?: ToastSize;
  hasIcon?: boolean;
  title?: string;
  description?: string;
  onClose?: () => void;
}


// toast title
// File: components/Toast/ToastTitle.tsx
import {
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import { forwardRef } from "react";
import { StyledToastTitle } from "./toast-styled";
import { ToastTitleProps } from "./toast-type";

export const ToastTitle = forwardRef<HTMLHeadingElement, ToastTitleProps>(
  ({ children, hasIcon = true, variant, ...props }, ref) => {
    const getIcon = () => {
      if (!hasIcon || !variant) return null;

      switch (variant) {
        case "success":
          return <CheckCircledIcon color="#4CAF50" />;
        case "warning":
          return <ExclamationTriangleIcon color="#FFC107" />;
        case "error":
          return <CrossCircledIcon color="#F44336" />;
        case "info":
          return <InfoCircledIcon color="#03A9F4" />;
        default:
          return null;
      }
    };

    return (
      <StyledToastTitle
        ref={ref}
        hasIcon={hasIcon}
        variant={variant}
        {...props}
      >
        {getIcon()}
        {children}
      </StyledToastTitle>
    );
  }
);


// toast-styled
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import * as RadixToast from '@radix-ui/react-toast';
import {
  ToastActionProps,
  ToastCloseProps,
  ToastDescriptionProps,
  ToastPosition,
  ToastRootProps,
  ToastTitleProps,
  ToastViewportProps
} from './toast-type';

const getViewportPositionStyles = (position?: ToastPosition) => {
  switch (position) {
    case 'top-left':
      return css`
        top: 0;
        left: 0;
        align-items: flex-start;
      `;
    case 'top-right':
      return css`
        top: 0;
        right: 0;
        align-items: flex-end;
      `;
    case 'top-center':
      return css`
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        align-items: center;
      `;
    case 'bottom-left':
      return css`
        bottom: 0;
        left: 0;
        align-items: flex-start;
      `;
    case 'bottom-center':
      return css`
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        align-items: center;
      `;
    case 'bottom-right':
    default:
      return css`
        bottom: 0;
        right: 0;
        align-items: flex-end;
      `;
  }
};

const calculateGridStructure = ({ isDescription = false, isAction = false, isClose = false }) => {
  // Xác định có phần tử bên phải không (close button)
  const hasRightColumn = isClose;
  // Cấu hình cột dựa trên việc có close button hay không
  const gridTemplateColumns = hasRightColumn ? '1fr auto' : '1fr';
  
  let gridTemplateAreas = '';
  let gridTemplateRows = '';

  if (isDescription) {
    if (isClose && isAction) {
      gridTemplateAreas = `
        'title close' 
        'description close'
        'description action'`;
      gridTemplateRows = 'auto auto 1fr';
    } else if (isClose) {
      gridTemplateAreas = `
        'title close' 
        'description description'`;
      gridTemplateRows = 'auto 1fr';
    } else if (isAction) {
      gridTemplateAreas = `
        'title' 
        'description'
        'action'`;
      gridTemplateRows = 'auto 1fr auto';
    } else {
      gridTemplateAreas = `
        'title' 
        'description'`;
      gridTemplateRows = 'auto 1fr';
    }
  } else {
    if (isClose && isAction) {
      gridTemplateAreas = `
        'title close'
        'action action'`;
      gridTemplateRows = 'auto auto';
    } else if (isClose) {
      gridTemplateAreas = `'title close'`;
      gridTemplateRows = 'auto';
    } else if (isAction) {
      gridTemplateAreas = `
        'title'
        'action'`;
      gridTemplateRows = 'auto auto';
    } else {
      gridTemplateAreas = `'title'`;
      gridTemplateRows = 'auto';
    }
  }

  return {
    gridTemplateAreas,
    gridTemplateColumns,
    gridTemplateRows
  };
};

const getToastRootStylesDefault = ({
  isDescription = false,
  isAction = false,
  isClose = false
}: {
  isDescription?: boolean;
  isAction?: boolean;
  isClose?: boolean;
}) => {
  // Gọi hàm tính toán grid
  const { gridTemplateAreas, gridTemplateColumns, gridTemplateRows } = 
    calculateGridStructure({ isDescription, isAction, isClose });

  // Trả về CSS với cấu trúc grid đã tính toán
  return css`
    background-color: white;
    border-radius: 6px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
    display: grid;
    column-gap: 15px;
    row-gap: 5px;
    position: relative;
    padding: 12px;
    
    grid-template-areas: ${gridTemplateAreas};
    grid-template-columns: ${gridTemplateColumns};
    grid-template-rows: ${gridTemplateRows};
  `;
};

export const StyledToastRoot = styled(RadixToast.Root)<ToastRootProps>`
  ${props => props.useCustomStyle ?  "":getToastRootStylesDefault({
    isAction: props.isAction,
    isClose: props.isClose,
    isDescription: props.isDescription,
  })}

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
  color: black;
  display: flex;
  align-items: center;
  gap: ${props => props.hasIcon ? '8px' : '0'};
  font-size: 16px;
`;

export const StyledToastDescription = styled(RadixToast.Description)<ToastDescriptionProps>`
  grid-area: description;
  margin: 0;
  color: black;
  line-height: 1.4;
  text-align: left;
  font-size: 14px;
`;

export const StyledToastAction = styled(RadixToast.Action)<ToastActionProps>`
  grid-area: action;
  align-self: end;
  justify-self: end;
`;

export const StyledToastClose = styled(RadixToast.Close)<ToastCloseProps>`
  grid-area: close;
  align-self: start;
  justify-self: end;
  border: none;
  background: transparent;
  color: #A1A1A1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
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
  width: 390px;
  max-width: 100vw;
  margin: 0;
  list-style: none;
  z-index: 2147483647;
  outline: none;
  
`;

// toast-pattern
import {
  StyledToastAction,
  StyledToastClose,
  StyledToastDescription,
  StyledToastRoot,
  StyledToastViewport,
} from "./toast-styled";
import { ToastTitle } from "./toast-title";
import * as RadixToast from "@radix-ui/react-toast";
import { forwardRef } from "react";
import {
  ToastActionProps,
  ToastCloseProps,
  ToastDescriptionProps,
  ToastViewportProps,
} from "./toast-type";
import { Cross2Icon } from "@radix-ui/react-icons";

const ToastDescription = forwardRef<
  HTMLParagraphElement,
  ToastDescriptionProps
>((props, ref) => {
  return <StyledToastDescription ref={ref} {...props} />;
});

const ToastAction = forwardRef<HTMLButtonElement, ToastActionProps>(
  (props, ref) => {
    return <StyledToastAction ref={ref} {...props} />;
  }
);

const ToastClose = forwardRef<HTMLButtonElement, ToastCloseProps>(
  ({ children, ...props }, ref) => {
    return (
      <StyledToastClose ref={ref} {...props}>
        <Cross2Icon />
        {children}
      </StyledToastClose>
    );
  }
);

const ToastViewport = forwardRef<HTMLOListElement, ToastViewportProps>(
  ({ position = "bottom-right", ...props }, ref) => {
    return <StyledToastViewport ref={ref} position={position} {...props} />;
  }
);

export const ToastPattern = Object.assign(StyledToastRoot, {
  Root: StyledToastRoot,
  Provider: RadixToast.Provider,
  Title: ToastTitle,
  Description: ToastDescription,
  Action: ToastAction,
  Close: ToastClose,
  Viewport: ToastViewport,
});


// toast-context
import { createContext } from "react";
import { ToastSettings } from "./toast-provider";

interface ToastContextProps {
  showToast: (settings: ToastSettings) => void;
  hideToast: () => void;
}

export const ToastContext = createContext<ToastContextProps | undefined>(
  undefined
);


// toast provider
import React, { ReactNode, useState } from "react";
import { ToastPattern } from "../toast-pattern";
import {
  SwipeDirection,
  ToastCustomRenderProps,
  ToastPosition,
  ToastSize,
  ToastVariant,
} from "../toast-type";
import { ToastContext } from "./toast-context";

const TOAST_SETTINGS_DEFAULT: ToastSettings = {
  variant: "default",
  size: "medium",
  duration: 5000,
  position: "bottom-right",
  hasIcon: true,
  title: "",
  description: "",
  swipeDirection: "right",
  closable: true,
  useCustomStyle: false,
};

export interface ToastSettings {
  variant?: ToastVariant;
  size?: ToastSize;
  duration?: number;
  position?: ToastPosition;
  hasIcon?: boolean;
  title: string;
  description?: string;
  swipeDirection?: SwipeDirection;
  closable?: boolean;
  action?: {
    content: React.ReactNode;
    altText: string;
    onClick: () => void;
  };
  onClose?: () => void;
  customRender?: (props: ToastCustomRenderProps) => React.ReactNode;
  useCustomStyle?: boolean;
}

interface ToastProviderProps {
  children: ReactNode;
  defaultPosition?: ToastPosition;
  defaultDuration?: number;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [toastSettings, setToastSettings] = useState<ToastSettings>(
    TOAST_SETTINGS_DEFAULT
  );

  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const showToast = (settings: ToastSettings) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Đóng toast hiện tại
    setOpen(false);
    hideToast();

    timeoutRef.current = setTimeout(() => {
      setToastSettings({ ...TOAST_SETTINGS_DEFAULT, ...settings });
      setOpen(true);
      timeoutRef.current = null;
    }, 200);
  };

  const hideToast = () => {
    setOpen(false);
  };

  const handleClose = () => {
    if (toastSettings.onClose) {
      toastSettings.onClose();
    }
    hideToast();
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <ToastPattern.Provider swipeDirection={toastSettings.swipeDirection}>
        <ToastPattern.Root
          open={open}
          onOpenChange={setOpen}
          variant={toastSettings.variant}
          size={toastSettings.size}
          hasIcon={toastSettings.hasIcon}
          duration={toastSettings.duration}
          position={toastSettings.position || "top-right"}
          useCustomStyle={toastSettings.useCustomStyle}
          isAction={!!toastSettings.action}
          isClose={toastSettings.closable}
          isDescription={!!toastSettings.description}
        >
          {toastSettings.customRender ? (
            toastSettings.customRender({
              variant: toastSettings.variant,
              size: toastSettings.size,
              hasIcon: toastSettings.hasIcon,
              title: toastSettings.title,
              description: toastSettings.description,
              onClose: handleClose,
            })
          ) : (
            <>
              {toastSettings.title && (
                <ToastPattern.Title variant={toastSettings.variant} hasIcon>
                  {toastSettings.title}
                </ToastPattern.Title>
              )}

              {toastSettings.description && (
                <ToastPattern.Description>
                  {toastSettings.description}
                </ToastPattern.Description>
              )}

              {toastSettings.closable && (
                <ToastPattern.Close onClick={handleClose} size="small" />
              )}

              {toastSettings.action && (
                <ToastPattern.Action
                  altText={toastSettings.action.altText}
                  onClick={toastSettings.action.onClick}
                  asChild
                >
                  {toastSettings.action.content}
                </ToastPattern.Action>
              )}
            </>
          )}
        </ToastPattern.Root>

        <ToastPattern.Viewport position={toastSettings.position} />
      </ToastPattern.Provider>
    </ToastContext.Provider>
  );
};


// use-toast
import { useContext } from "react";
import { ToastContext } from "./toast-context";

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
};
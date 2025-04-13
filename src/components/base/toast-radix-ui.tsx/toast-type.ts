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
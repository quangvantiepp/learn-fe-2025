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

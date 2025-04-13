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

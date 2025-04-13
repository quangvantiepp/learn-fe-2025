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

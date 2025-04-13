import { createContext } from "react";
import { ToastSettings } from "./toast-provider";

interface ToastContextProps {
  showToast: (settings: ToastSettings) => void;
  hideToast: () => void;
}

export const ToastContext = createContext<ToastContextProps | undefined>(
  undefined
);

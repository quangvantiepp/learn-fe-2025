// types.ts
export type ToastType = "info" | "success" | "warning" | "error";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  type: ToastType;
  duration?: number;
  onClose?: () => void;
}

// toast-item.tsx
import React, { useState, useEffect, useCallback } from "react";
import styled from "@emotion/styled";
import { keyframes } from "@emotion/react";
import { Toast, ToastType } from "./toast-type";

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const slideIn = keyframes`
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(100%);
  }
`;

const ToastContainer = styled.div<{ type: ToastType; closing: boolean }>`
  position: relative;
  display: flex;
  width: 360px;
  padding: 16px;
  margin-bottom: 8px;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: ${slideIn} 0.3s ease-out forwards;

  ${(props) =>
    props.closing &&
    `
    animation: ${slideOut} 0.3s ease-in forwards;
  `}

  ${(props) => {
    switch (props.type) {
      case "success":
        return `
          background-color: #ebfbee;
          border-left: 4px solid #34c759;
        `;
      case "error":
        return `
          background-color: #feecf0;
          border-left: 4px solid #ff3b30;
        `;
      case "warning":
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

const ProgressBar = styled.div<{ duration: number }>`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: rgba(0, 0, 0, 0.1);
  width: 100%;

  &::after {
    content: "";
    position: absolute;
    height: 100%;
    left: 0;
    background-color: rgba(0, 0, 0, 0.3);
    width: 100%;
    animation: progress ${(props) => props.duration}ms linear forwards;
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

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onRemove }) => {
  const [closing, setClosing] = useState(false);
  const duration = toast.duration || 5000;

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => {
      onRemove(toast.id);
      toast.onClose?.();
    }, 300);
  }, [toast, onRemove]);

  useEffect(() => {
    if (duration !== Infinity) {
      const timer = setTimeout(handleClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, handleClose]);

  return (
    <ToastContainer type={toast.type} closing={closing}>
      <ToastContent>
        {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
        {toast.description && (
          <ToastDescription>{toast.description}</ToastDescription>
        )}
      </ToastContent>
      <CloseButton onClick={handleClose}>×</CloseButton>
      {duration !== Infinity && <ProgressBar duration={duration} />}
    </ToastContainer>
  );
};

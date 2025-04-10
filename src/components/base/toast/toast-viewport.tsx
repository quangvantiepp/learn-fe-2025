// toast-viewport.tsx
import React from "react";
import styled from "@emotion/styled";
import { ToastItem } from "./toast-item";
import { useToast } from "./toast-context";

interface ToastViewportProps {
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
}

const ViewportContainer = styled.div<{
  position: ToastViewportProps["position"];
}>`
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

  ${(props) => {
    switch (props.position) {
      case "top-left":
        return `
          top: 0;
          left: 0;
          align-items: flex-start;
        `;
      case "top-center":
        return `
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          align-items: center;
        `;
      case "bottom-left":
        return `
          bottom: 0;
          left: 0;
          align-items: flex-start;
          flex-direction: column-reverse;
        `;
      case "bottom-right":
        return `
          bottom: 0;
          right: 0;
          align-items: flex-end;
          flex-direction: column-reverse;
        `;
      case "bottom-center":
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

export const ToastViewport: React.FC<ToastViewportProps> = ({
  position = "top-right",
}) => {
  const { toasts, removeToast } = useToast();

  return (
    <ViewportContainer position={position}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </ViewportContainer>
  );
};

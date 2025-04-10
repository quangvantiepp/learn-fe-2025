// usage-example.tsx - Ví dụ cách sử dụng
import React from "react";
import { useToast } from "./index";

export const ToastButton: React.FC = () => {
  const { addToast } = useToast();

  const showToast = (type: "info" | "success" | "warning" | "error") => {
    addToast({
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Toast`,
      description: `This is a ${type} toast message!`,
      type,
      duration: 5000,
      onClose: () => console.log(`${type} toast closed`),
    });
  };

  return (
    <div>
      <button onClick={() => showToast("info")}>Show Info Toast</button>
      <button onClick={() => showToast("success")}>Show Success Toast</button>
      <button onClick={() => showToast("warning")}>Show Warning Toast</button>
      <button onClick={() => showToast("error")}>Show Error Toast</button>
    </div>
  );
};

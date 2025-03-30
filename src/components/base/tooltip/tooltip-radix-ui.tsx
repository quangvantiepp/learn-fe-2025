import React, { ReactNode } from "react";
import * as RadixTooltip from "@radix-ui/react-tooltip";
import styled from "@emotion/styled";

// Styled Tooltip Content
const StyledTooltipContent = styled(RadixTooltip.Content)<{
  $backgroundColor?: "normal" | "warning" | "accent";
}>`
  background-color: ${({ $backgroundColor }) =>
    $backgroundColor === "warning"
      ? "#FF6B6B"
      : $backgroundColor === "accent"
      ? "#4ECDC4"
      : "#333333"};
  color: white;
  border-radius: 6px;
  padding: 10px 15px;
  font-size: 14px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 250px;
  z-index: 50;

  animation: tooltipSlide 0.2s ease-out;

  @keyframes tooltipSlide {
    from {
      opacity: 0;
      transform: ${({ side }) =>
        side === "top"
          ? "translateY(10px)"
          : side === "bottom"
          ? "translateY(-10px)"
          : side === "left"
          ? "translateX(10px)"
          : "translateX(-10px)"};
    }
    to {
      opacity: 1;
      transform: translate(0);
    }
  }
`;

// Component Tooltip với các thuộc tính điều khiển thời gian
interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  backgroundColor?: "normal" | "warning" | "accent";
  delayDuration?: number; // Thời gian delay trước khi tooltip xuất hiện
  skipDelayDuration?: number; // Thời gian delay nếu đã hover trước đó
}

const CustomTooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement = "top",
  backgroundColor = "normal",
  delayDuration = 300, // Mặc định 300ms delay
  skipDelayDuration = 100, // Mặc định 100ms nếu đã hover trước
}) => {
  return (
    <RadixTooltip.Provider
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
    >
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <StyledTooltipContent
            side={placement}
            $backgroundColor={backgroundColor}
            sideOffset={5}
          >
            {content}
          </StyledTooltipContent>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};

export default CustomTooltip;

// Ví dụ sử dụng
export const TooltipExample = () => {
  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        padding: "20px",
        flexWrap: "wrap",
      }}
    >
      {/* Tooltip mặc định */}
      <CustomTooltip content="Tooltip mặc định">
        <button
          style={{
            backgroundColor: "blue",
            color: "white",
            padding: "10px 15px",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Hover Default
        </button>
      </CustomTooltip>

      {/* Tooltip với delay dài */}
      <CustomTooltip
        content="Tooltip với delay dài"
        delayDuration={1000} // 1 giây mới hiện
        placement="bottom"
        backgroundColor="warning"
      >
        <button
          style={{
            backgroundColor: "red",
            color: "white",
            padding: "10px 15px",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Hover Slow
        </button>
      </CustomTooltip>

      {/* Tooltip với skip delay ngắn */}
      <CustomTooltip
        content={
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src="/api/placeholder/40/40"
              alt="Avatar"
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                marginRight: "10px",
              }}
            />
            <span>Tooltip với skip delay ngắn</span>
          </div>
        }
        placement="right"
        backgroundColor="accent"
        delayDuration={500} // Delay ban đầu 0.5s
        skipDelayDuration={50} // Nếu hover lại rất nhanh chỉ delay 0.05s
      >
        <button
          style={{
            backgroundColor: "green",
            color: "white",
            padding: "10px 15px",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Hover Quick
        </button>
      </CustomTooltip>
    </div>
  );
};

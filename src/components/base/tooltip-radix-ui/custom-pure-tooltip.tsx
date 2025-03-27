import React, {
  useState,
  useRef,
  ReactNode,
  // MouseEvent as ReactMouseEvent
} from "react";
import styled from "@emotion/styled";

// Định nghĩa các màu sắc
const tooltipColors = {
  normal: "#333333",
  warning: "#FF6B6B",
  accent: "#4ECDC4",
};

// Styled component cho Tooltip
const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const TooltipContent = styled.div<{
  $visible: boolean;
  $placement: "top" | "bottom" | "left" | "right";
  $backgroundColor: keyof typeof tooltipColors;
}>`
  position: absolute;
  background-color: ${(props) => tooltipColors[props.$backgroundColor]};
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  z-index: 100;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  visibility: ${(props) => (props.$visible ? "visible" : "hidden")};
  transition: opacity 0.2s, visibility 0.2s;

  ${(props) => {
    switch (props.$placement) {
      case "top":
        return `
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%) translateY(-8px);
          `;
      case "bottom":
        return `
            top: 100%;
            left: 50%;
            transform: translateX(-50%) translateY(8px);
          `;
      case "left":
        return `
            right: 100%;
            top: 50%;
            transform: translateX(-8px) translateY(-50%);
          `;
      case "right":
        return `
            left: 100%;
            top: 50%;
            transform: translateX(8px) translateY(-50%);
          `;
    }
  }}
`;

// Interface cho props của Tooltip
interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  backgroundColor?: keyof typeof tooltipColors;
  delayDuration?: number;
  skipDelayDuration?: number;
}

const CustomTooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement = "top",
  backgroundColor = "normal",
  delayDuration = 300,
  skipDelayDuration = 100,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastHoverTimeRef = useRef<number>(0);

  const handleMouseEnter = () => {
    const currentTime = Date.now();
    const timeSinceLastHover = currentTime - lastHoverTimeRef.current;

    // Xóa timer cũ nếu còn
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    // Quyết định delay
    const currentDelay =
      timeSinceLastHover < delayDuration ? skipDelayDuration : delayDuration;

    // Đặt timer mới
    hoverTimerRef.current = setTimeout(() => {
      setIsVisible(true);
    }, currentDelay);

    // Cập nhật thời gian hover cuối
    lastHoverTimeRef.current = currentTime;
  };

  const handleMouseLeave = () => {
    // Xóa timer nếu còn
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    // Ẩn tooltip
    setIsVisible(false);
  };

  return (
    <TooltipWrapper
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      <TooltipContent
        $visible={isVisible}
        $placement={placement}
        $backgroundColor={backgroundColor}
      >
        {content}
      </TooltipContent>
    </TooltipWrapper>
  );
};

export default CustomTooltip;

// Ví dụ sử dụng
export const TooltipExampleCustom = () => {
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

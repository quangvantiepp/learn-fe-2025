import React, {
  useState,
  useRef,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import styled from "@emotion/styled";
import Button from "../../ui/button/Button";

// Define tooltip colors
const TOOLTIP_COLORS = {
  normal: "#333333",
  warning: "#FF6B6B",
  accent: "#4ECDC4",
} as const;

type TooltipColor = keyof typeof TOOLTIP_COLORS;
type TooltipPlacement = "top" | "bottom" | "left" | "right";

// Styled components
const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
  max-width: 100%;
`;

const TooltipContent = styled.div<{
  visible: boolean;
  placement: TooltipPlacement;
  variant: TooltipColor;
  zIndex: number;
  arrow?: boolean;
}>`
  position: absolute;
  background-color: ${(props) => TOOLTIP_COLORS[props.variant]};
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  z-index: ${(props) => props.zIndex};
  opacity: ${(props) => (props.visible ? 1 : 0)};
  visibility: ${(props) => (props.visible ? "visible" : "hidden")};
  transition: opacity 0.2s, visibility 0.2s;
  pointer-events: none;

  // Custom content styles
  max-width: 250px; /* Điều chỉnh chiều rộng tối đa theo nhu cầu */
  white-space: normal; /* Cho phép text xuống dòng */
  word-wrap: break-word; /* Đảm bảo từ dài tự động ngắt */
  overflow-wrap: break-word; /* Đảm bảo từ dài tự động ngắt (cho các trình duyệt mới) */
  text-align: left; /* Căn lề text */
  line-height: 1.4; /* Khoảng cách giữa các dòng */
  width: max-content; /* Đảm bảo chiều rộng tự động theo nội dung */

  ${(props) => getPlacementStyles(props.placement)}

  ${(props) => {
    if (!props.arrow) return;
    return `
          &::after {
          content: "";
          position: absolute;
          width: 0;
          height: 0;
          border-style: solid;
          z-index: ${props.zIndex};
      }
      ${getArrowStyles(
        props.placement,
        TOOLTIP_COLORS[props.variant],
        props.arrow
      )}
      `;
  }}
`;

// Extracted function for placement styles
const getPlacementStyles = (placement: TooltipPlacement) => {
  switch (placement) {
    case "top":
      return `
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%) translateY(-8px);
            margin-bottom: 8px;
          `;
    case "bottom":
      return `
            top: 100%;
            left: 50%;
            transform: translateX(-50%) translateY(8px);
            margin-top: 8px;
          `;
    case "left":
      return `
            right: 100%;
            top: 50%;
            transform: translateX(-8px) translateY(-50%);
            margin-right: 8px;
          `;
    case "right":
      return `
            left: 100%;
            top: 50%;
            transform: translateX(8px) translateY(-50%);
            margin-left: 8px;
          `;
  }
};

const getArrowStyles = (
  placement: TooltipPlacement,
  color: string,
  arrow?: boolean
) => {
  if (!arrow) return;
  switch (placement) {
    case "top":
      return `
              &::after {
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                border-width: 8px 8px 0;
                border-color: ${color} transparent transparent transparent;
              }
            `;
    case "bottom":
      return `
              &::after {
                bottom: 100%;
                left: 50%;
                transform: translateX(-50%);
                border-width: 0 8px 8px;
                border-color: transparent transparent ${color} transparent;
              }
            `;
    case "left":
      return `
              &::after {
                left: 100%;
                top: 50%;
                transform: translateY(-50%);
                border-width: 8px 0 8px 8px;
                border-color: transparent transparent transparent ${color};
              }
            `;
    case "right":
      return `
              
              &::after {
                right: 100%;
                top: 50%;
                transform: translateY(-50%);
                border-width: 8px 8px 8px 0;
                border-color: transparent ${color} transparent transparent;
              }
            `;
  }
};

// Props interface
interface TooltipProps {
  children: ReactNode;
  content: ReactNode;
  placement?: TooltipPlacement;
  variant?: TooltipColor;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  zIndex?: number;
  arrow?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement = "top",
  variant = "normal",
  mouseEnterDelay = 300,
  mouseLeaveDelay = 100,
  zIndex = 1000,
  arrow = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentPlacement, setCurrentPlacement] = useState(placement);

  const mouseEnterTimer = useRef<NodeJS.Timeout | null>(null);
  const mouseLeaveTimerTimer = useRef<NodeJS.Timeout | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setTimeout(() => {
        setCurrentPlacement(placement);
      }, 200);
    }
  }, [isVisible, placement]);

  // Ensure tooltip is visible in viewport
  const ensureVisibleInViewport = useCallback(
    (tooltipRect: DOMRect | null) => {
      if (!tooltipRect) return;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let newPlacement = placement;

      if (tooltipRect.left < 0) {
        newPlacement = "right";
      } else if (tooltipRect.right > viewportWidth) {
        newPlacement = "left";
      }

      if (tooltipRect.top < 0) {
        newPlacement = "bottom";
      } else if (tooltipRect.bottom > viewportHeight) {
        newPlacement = "top";
      }

      if (newPlacement !== currentPlacement) {
        setCurrentPlacement(newPlacement);
      }
    },
    [isVisible, currentPlacement]
  );

  const handleMouseEnter = useCallback(() => {
    clearTimers();
    mouseEnterTimer.current = setTimeout(() => {
      setIsVisible(true);
      requestAnimationFrame(() => {
        if (tooltipRef.current) {
          const tooltipRect = tooltipRef.current.getBoundingClientRect();
          ensureVisibleInViewport(tooltipRect);
        }
      });
    }, mouseEnterDelay);
  }, [mouseEnterDelay, ensureVisibleInViewport]);

  const handleMouseLeave = useCallback(() => {
    clearTimers();
    mouseLeaveTimerTimer.current = setTimeout(() => {
      setIsVisible(false);
    }, mouseLeaveDelay);
  }, [mouseLeaveDelay]);

  const clearTimers = () => {
    if (mouseEnterTimer.current) {
      clearTimeout(mouseEnterTimer.current);
      mouseEnterTimer.current = null;
    }
    if (mouseLeaveTimerTimer.current) {
      clearTimeout(mouseLeaveTimerTimer.current);
      mouseLeaveTimerTimer.current = null;
    }
  };

  const tooltipContent = useMemo(
    () => (
      <TooltipContent
        ref={tooltipRef}
        visible={isVisible}
        placement={currentPlacement}
        variant={variant}
        zIndex={zIndex}
        arrow={arrow}
      >
        {content}
      </TooltipContent>
    ),
    [isVisible, currentPlacement, variant, zIndex, content]
  );

  return (
    <TooltipWrapper
      ref={wrapperRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {tooltipContent}
    </TooltipWrapper>
  );
};

export default Tooltip;

// Usage example
export const TooltipExample = () => {
  return (
    <div
      style={{
        padding: "20px",

        // overflowX: "auto",
        // overflowY: "auto",
        // height: 200,
        // width: 400,
      }}
    >
      {/* Basic tooltip */}
      <div style={{ marginBottom: "20px" }}>
        <Tooltip content="Default tooltip with basic z-index" zIndex={1000}>
          <Button>Hover Default</Button>
        </Tooltip>
      </div>
      <div style={{ marginBottom: "20px" }}>
        <Tooltip
          content="Default tooltip with basic z-index"
          zIndex={1000}
          placement="left"
        >
          <Button>
            Hover left lllllllllllllllllllllllllllllllllllllllllllllll
          </Button>
        </Tooltip>
      </div>

      {/* Tooltip in modal example */}
      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          position: "relative",
          zIndex: 1000,
          backgroundColor: "#f5f5f5",
        }}
      >
        <h3>Modal Simulation (z-index: 100)</h3>
        <div>
          <Tooltip
            content="Tooltip in modal with higher z-index"
            placement="bottom"
            variant="warning"
            zIndex={2000}
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
              Tooltip in Modal
            </button>
          </Tooltip>
        </div>
      </div>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          position: "relative",
          zIndex: 1000,
          backgroundColor: "#f5f5f5",
        }}
      >
        <h3>Modal Simulation (z-index: 100)</h3>
        <div>
          <Tooltip
            content="Tooltip in modal with higher z-index"
            placement="bottom"
            variant="warning"
            zIndex={2000}
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
              Tooltip in Modal 1
            </button>
          </Tooltip>
        </div>
      </div>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          position: "relative",
          zIndex: 1000,
          backgroundColor: "#f5f5f5",
        }}
      >
        <h3>Modal Simulation (z-index: 100)</h3>
        <div>
          <Tooltip
            content="Tooltip in modal with higher z-index"
            placement="bottom"
            variant="warning"
            zIndex={2000}
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
              Tooltip in Modal 2
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

import { css, SerializedStyles } from "@emotion/react";
import styled from "@emotion/styled";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Button from "../../ui/button/Button";

// Define tooltip colors
const TOOLTIP_COLORS = {
  normal: "#333333",
  warning: "#FF6B6B",
  accent: "#4ECDC4",
} as const;

type TooltipColor = keyof typeof TOOLTIP_COLORS;
type TooltipPlacement =
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

interface TooltipContentProps {
  visible?: boolean;
  placement: TooltipPlacement;
  variant: TooltipColor;
  zIndex?: number;
  arrow?: boolean;
  contentStyles?: SerializedStyles;
  stayOpenOnHover?: boolean;
}
// Styled components
const TooltipWrapper = styled.div`
  position: relative;
  display: inline-block;
  max-width: 100%;
`;

const TooltipContent = styled.div<TooltipContentProps>`
  position: absolute;
  background-color: ${(props) => TOOLTIP_COLORS[props.variant]};
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  z-index: ${(props) => props.zIndex};
  opacity: ${(props) => (props.visible ? 1 : 0)};
  visibility: ${(props) => (props.visible ? "visible" : "hidden")};
  transition: opacity 0.2s, visibility 0.2s;
  pointer-events: ${({ stayOpenOnHover }) =>
    stayOpenOnHover ? "unset" : "none"};

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

  ${({ contentStyles }) => contentStyles}
`;

// Extracted function for placement styles
const getPlacementStyles = (placement: TooltipPlacement) => {
  switch (placement) {
    case "top":
      return css`
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
    case "top-left":
      return `
                &::after {
                  bottom: -8px;
                  left: 16px;
                  border-width: 8px 8px 0;
                  border-color: ${color} transparent transparent transparent;
                }
              `;
    case "top-right":
      return `
                &::after {
                  bottom: -8px;
                  right: 16px;
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
    case "bottom-left":
      return `
                &::after {
                  top: -8px;
                  left: 16px;
                  border-width: 0 8px 8px;
                  border-color: transparent transparent ${color} transparent;
                }
              `;
    case "bottom-right":
      return `
                &::after {
                  top: -8px;
                  right: 16px;
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
interface TooltipProps extends TooltipContentProps {
  children: ReactNode;
  content: ReactNode;
  mouseEnterDelay?: number;
  mouseLeaveDelay?: number;
  stayOpenOnHover?: boolean;
  autoAdjustOverflow?: boolean;
  open?: boolean;
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
  contentStyles,
  autoAdjustOverflow = true,
  stayOpenOnHover = true,
  open,
}) => {
  const [controlInfo, setControlInfo] = useState<{
    isOpen: boolean;
    placement: TooltipPlacement;
  }>({
    isOpen: false,
    placement: placement,
  });

  const mouseEnterTimer = useRef<NodeJS.Timeout | null>(null);
  const mouseLeaveTimer = useRef<NodeJS.Timeout | null>(null);
  const placementUpdateTimer = useRef<NodeJS.Timeout | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const isControlled = open !== undefined;
  const isVisible = isControlled ? open : controlInfo.isOpen;

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  useEffect(() => {
    if (!controlInfo.isOpen) {
      if (placementUpdateTimer.current) {
        clearTimeout(placementUpdateTimer.current);
        placementUpdateTimer.current = null;
      }

      placementUpdateTimer.current = setTimeout(() => {
        setControlInfo((prev) => ({
          ...prev,
          placement: placement,
        }));
      }, 200); // Delay to ensure tooltip is hidden before changing placement, animation time is 0.2s in styled component visibility 0.2s
    }
  }, [controlInfo.isOpen, placement]);

  // Ensure tooltip is visible in viewport
  const calculateOptimalPlacement = useCallback(() => {
    if (!wrapperRef.current || !tooltipRef.current) return placement;

    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Kiểm tra không gian cho mỗi hướng cơ bản
    const hasSpaceAbove = wrapperRect.top >= tooltipRect.height + 8;
    const hasSpaceBelow =
      viewportHeight - wrapperRect.bottom >= tooltipRect.height + 8;
    const hasSpaceLeft = wrapperRect.left >= tooltipRect.width + 8;
    const hasSpaceRight =
      viewportWidth - wrapperRect.right >= tooltipRect.width + 8;

    // Kiểm tra đặc biệt cho các vị trí góc - xét đến việc tooltip được canh theo mép
    const hasSpaceTopLeft =
      hasSpaceAbove && wrapperRect.left + tooltipRect.width <= viewportWidth;
    const hasSpaceTopRight =
      hasSpaceAbove && wrapperRect.right - tooltipRect.width >= 0;
    const hasSpaceBottomLeft =
      hasSpaceBelow && wrapperRect.left + tooltipRect.width <= viewportWidth;
    const hasSpaceBottomRight =
      hasSpaceBelow && wrapperRect.right - tooltipRect.width >= 0;

    // Logic chuyển đổi vị trí
    switch (placement) {
      case "top-left":
        if (hasSpaceTopLeft) return "top-left";
        if (hasSpaceTopRight) return "top-right";
        if (hasSpaceBottomLeft) return "bottom-left";
        if (hasSpaceBottomRight) return "bottom-right";
        if (hasSpaceAbove) return "top";
        if (hasSpaceBelow) return "bottom";
        if (hasSpaceLeft) return "left";
        return "right";

      case "top-right":
        if (hasSpaceTopRight) return "top-right";
        if (hasSpaceTopLeft) return "top-left";
        if (hasSpaceBottomRight) return "bottom-right";
        if (hasSpaceBottomLeft) return "bottom-left";
        if (hasSpaceAbove) return "top";
        if (hasSpaceBelow) return "bottom";
        if (hasSpaceRight) return "right";
        return "left";

      case "bottom-left":
        if (hasSpaceBottomLeft) return "bottom-left";
        if (hasSpaceBottomRight) return "bottom-right";
        if (hasSpaceTopLeft) return "top-left";
        if (hasSpaceTopRight) return "top-right";
        if (hasSpaceBelow) return "bottom";
        if (hasSpaceAbove) return "top";
        if (hasSpaceLeft) return "left";
        return "right";

      case "bottom-right":
        if (hasSpaceBottomRight) return "bottom-right";
        if (hasSpaceBottomLeft) return "bottom-left";
        if (hasSpaceTopRight) return "top-right";
        if (hasSpaceTopLeft) return "top-left";
        if (hasSpaceBelow) return "bottom";
        if (hasSpaceAbove) return "top";
        if (hasSpaceRight) return "right";
        return "left";

      case "top":
        if (hasSpaceAbove) return "top";
        if (hasSpaceBelow) return "bottom";
        if (hasSpaceLeft) return "left";
        return "right";

      case "bottom":
        if (hasSpaceBelow) return "bottom";
        if (hasSpaceAbove) return "top";
        if (hasSpaceLeft) return "left";
        return "right";

      case "left":
        if (hasSpaceLeft) return "left";
        if (hasSpaceRight) return "right";
        if (hasSpaceAbove) return "top";
        return "bottom";

      case "right":
        if (hasSpaceRight) return "right";
        if (hasSpaceLeft) return "left";
        if (hasSpaceAbove) return "top";
        return "bottom";

      default:
        return placement;
    }
  }, [placement]);

  const handleMouseEnter = useCallback(() => {
    clearAllTimers();

    mouseEnterTimer.current = setTimeout(() => {
      setControlInfo((prev) => ({ ...prev, isOpen: true }));

      if (autoAdjustOverflow) {
        requestAnimationFrame(() => {
          if (tooltipRef.current) {
            const tooltipRect = calculateOptimalPlacement();
            setControlInfo({
              isOpen: true,
              placement: tooltipRect,
            });
          }
        });
      }
    }, mouseEnterDelay);
  }, [mouseEnterDelay]);

  const handleMouseLeave = useCallback(() => {
    clearAllTimers();

    mouseLeaveTimer.current = setTimeout(() => {
      setControlInfo((prev) => ({
        ...prev,
        isOpen: false,
      }));
    }, mouseLeaveDelay);
  }, [mouseLeaveDelay]);

  const clearAllTimers = () => {
    if (mouseEnterTimer.current) {
      clearTimeout(mouseEnterTimer.current);
      mouseEnterTimer.current = null;
    }
    if (mouseLeaveTimer.current) {
      clearTimeout(mouseLeaveTimer.current);
      mouseLeaveTimer.current = null;
    }
  };

  const tooltipContent = () => (
    <TooltipContent
      ref={tooltipRef}
      visible={isVisible}
      placement={controlInfo.placement}
      variant={variant}
      zIndex={zIndex}
      arrow={arrow}
      onMouseEnter={isControlled ? undefined : handleMouseEnter}
      onMouseLeave={isControlled ? undefined : handleMouseLeave}
      contentStyles={contentStyles}
      stayOpenOnHover={stayOpenOnHover}
    >
      {content}
    </TooltipContent>
  );
  return (
    <TooltipWrapper
      ref={wrapperRef}
      onMouseEnter={isControlled ? undefined : handleMouseEnter}
      onMouseLeave={isControlled ? undefined : handleMouseLeave}
    >
      {children}
      {tooltipContent()}
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
        <Tooltip
          content="Default tooltip with basic z-index"
          zIndex={1000}
          placement="top"
          variant="accent"
        >
          <Button>Hover Default</Button>
        </Tooltip>
      </div>
      <div style={{ marginBottom: "20px" }}>
        <Tooltip
          content="Default tooltip with basic z-index"
          zIndex={1000}
          placement="left"
          variant="warning"
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

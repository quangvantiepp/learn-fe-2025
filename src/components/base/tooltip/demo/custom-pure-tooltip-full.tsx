import React, {
  useState,
  useRef,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import styled from "@emotion/styled";

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
  /* display: inline-block; */
  max-width: 100%;
`;

const TooltipContent = styled.div<{
  $visible: boolean;
  $placement: TooltipPlacement;
  $backgroundColor: TooltipColor;
  $zIndex: number;
  $arrow?: boolean;
}>`
  position: absolute;
  background-color: ${(props) => TOOLTIP_COLORS[props.$backgroundColor]};
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  z-index: ${(props) => props.$zIndex};
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  visibility: ${(props) => (props.$visible ? "visible" : "hidden")};
  transition: opacity 0.2s, visibility 0.2s;
  pointer-events: none;

  // Custom content styles
  max-width: 250px; /* Điều chỉnh chiều rộng tối đa theo nhu cầu */
  white-space: normal; /* Cho phép text xuống dòng */
  word-wrap: break-word; /* Đảm bảo từ dài tự động ngắt */
  overflow-wrap: break-word; /* Đảm bảo từ dài tự động ngắt (cho các trình duyệt mới) */
  text-align: left; /* Căn lề text */
  line-height: 1.4; /* Khoảng cách giữa các dòng */

  ${(props) => getPlacementStyles(props.$placement)}

  ${(props) => {
    if (!props.$arrow) return;
    return `
        &::after {
        content: "";
        position: absolute;
        width: 0;
        height: 0;
        border-style: solid;
        z-index: ${props.$zIndex};
    }
    ${getArrowStyles(
      props.$placement,
      TOOLTIP_COLORS[props.$backgroundColor],
      props.$arrow
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
  backgroundColor?: TooltipColor;
  delayDuration?: number;
  skipDelayDuration?: number;
  zIndex?: number;
  getPopupContainer?: () => HTMLElement;
}

const CustomTooltip: React.FC<TooltipProps> = ({
  children,
  content,
  placement = "top",
  backgroundColor = "normal",
  delayDuration = 300,
  skipDelayDuration = 100,
  zIndex = 1000,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentPlacement, setCurrentPlacement] = useState(placement);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastHoverTimeRef = useRef<number>(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Ensure tooltip is visible in viewport
  const ensureVisibleInViewport = useCallback(
    (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      console.log(
        "rect",
        rect,
        "viewport:",
        viewportWidth,
        "viewportHeight:",
        viewportHeight
      );

      if (
        (placement === "left" && rect.left < 0) ||
        (placement === "right" && rect.right > viewportWidth)
      ) {
        setCurrentPlacement(placement === "left" ? "right" : "left");
      } else if (
        (placement === "top" && rect.top < 0) ||
        (placement === "bottom" && rect.bottom > viewportHeight)
      ) {
        setCurrentPlacement(placement === "top" ? "bottom" : "top");
      }
    },
    [placement]
  );

  // Reset placement when prop changes
  //   useEffect(() => {
  //     setCurrentPlacement(placement);
  //   }, [placement]);

  // Add this inside the CustomTooltip component
  useEffect(() => {
    if (isVisible) {
      const handleScroll = () => {
        if (tooltipRef.current) {
          ensureVisibleInViewport(tooltipRef.current);
        }
      };

      window.addEventListener("scroll", handleScroll, true);
      return () => {
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [isVisible, ensureVisibleInViewport]);

  // Clean up timers when component unmounts
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  const handleMouseEnter = useCallback(() => {
    const currentTime = Date.now();
    const timeSinceLastHover = currentTime - lastHoverTimeRef.current;

    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }

    const currentDelay =
      timeSinceLastHover < delayDuration ? skipDelayDuration : delayDuration;

    hoverTimerRef.current = setTimeout(() => {
      setIsVisible(true);

      if (tooltipRef.current) {
        ensureVisibleInViewport(tooltipRef.current);
      }
    }, currentDelay);

    lastHoverTimeRef.current = currentTime;
  }, [delayDuration, skipDelayDuration, ensureVisibleInViewport]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
    }
    setIsVisible(false);
  }, []);

  const tooltipContent = useMemo(
    () => (
      <TooltipContent
        ref={tooltipRef}
        $visible={isVisible}
        $placement={currentPlacement}
        $backgroundColor={backgroundColor}
        $zIndex={zIndex}
        // data-tooltip="true"
      >
        {content}
      </TooltipContent>
    ),
    [isVisible, currentPlacement, backgroundColor, zIndex, content]
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

export default CustomTooltip;

// Usage example
export const TooltipExampleCustomFull = () => {
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
        <CustomTooltip
          content="Default tooltip with basic z-index"
          zIndex={1000}
        >
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
      </div>
      <div style={{ marginBottom: "20px" }}>
        <CustomTooltip
          content="Default tooltip with basic z-index"
          zIndex={1000}
          placement="left"
        >
          <button
            style={{
              backgroundColor: "blue",
              color: "white",
              padding: "10px 15px",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Hover left lllllllllllllllllllllllllllllllllllllllllllllll
          </button>
        </CustomTooltip>
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
          <CustomTooltip
            content="Tooltip in modal with higher z-index"
            placement="bottom"
            backgroundColor="warning"
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
          </CustomTooltip>
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
          <CustomTooltip
            content="Tooltip in modal with higher z-index"
            placement="bottom"
            backgroundColor="warning"
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
          </CustomTooltip>
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
          <CustomTooltip
            content="Tooltip in modal with higher z-index"
            placement="bottom"
            backgroundColor="warning"
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
          </CustomTooltip>
        </div>
      </div>
    </div>
  );
};

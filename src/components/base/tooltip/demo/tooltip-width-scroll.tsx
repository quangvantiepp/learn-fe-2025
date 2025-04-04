import React, {
  useState,
  useRef,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import styled from "@emotion/styled";
import Button from "../../../ui/button/Button";

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
  position: { top?: number; left?: number; bottom?: number; right?: number };
}>`
  position: fixed; /* Changed to fixed for better positioning control */
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
  max-width: 250px;
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
  text-align: left;
  line-height: 1.4;
  width: max-content;

  // Dynamic positioning
  top: ${(props) =>
    props.position.top !== undefined ? `${props.position.top}px` : "auto"};
  left: ${(props) =>
    props.position.left !== undefined ? `${props.position.left}px` : "auto"};
  bottom: ${(props) =>
    props.position.bottom !== undefined
      ? `${props.position.bottom}px`
      : "auto"};
  right: ${(props) =>
    props.position.right !== undefined ? `${props.position.right}px` : "auto"};
  transform: none; /* We'll handle transformations in JS */

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

// Modified arrow styles for fixed positioning
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
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 8px 8px 0;
          border-color: ${color} transparent transparent transparent;
        }
      `;
    case "bottom":
      return `
        &::after {
          top: -8px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 0 8px 8px;
          border-color: transparent transparent ${color} transparent;
        }
      `;
    case "left":
      return `
        &::after {
          right: -8px;
          top: 50%;
          transform: translateY(-50%);
          border-width: 8px 0 8px 8px;
          border-color: transparent transparent transparent ${color};
        }
      `;
    case "right":
      return `
        &::after {
          left: -8px;
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
  scrollContainer?: HTMLElement | null; // New prop for scroll container reference
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
  scrollContainer = null,
}) => {
  const [controlInfo, setControlInfo] = useState<{
    isOpen: boolean;
    placement: TooltipPlacement;
    position: { top?: number; left?: number; bottom?: number; right?: number };
  }>({
    isOpen: false,
    placement: placement,
    position: {},
  });

  const mouseEnterTimer = useRef<NodeJS.Timeout | null>(null);
  const mouseLeaveTimer = useRef<NodeJS.Timeout | null>(null);
  const placementUpdateTimer = useRef<NodeJS.Timeout | null>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);
  const scrollListenerAdded = useRef<boolean>(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const currentScrollContainer = useRef<HTMLElement | null>(null);

  // Find the nearest scrollable parent
  const findScrollableParent = useCallback(
    (element: HTMLElement | null): HTMLElement | null => {
      if (!element) return null;

      // Check if the element itself is scrollable
      const hasScrollableContent =
        element.scrollHeight > element.clientHeight ||
        element.scrollWidth > element.clientWidth;
      const overflowStyle = window.getComputedStyle(element).overflow;
      const isScrollable =
        overflowStyle === "auto" ||
        overflowStyle === "scroll" ||
        overflowStyle === "overlay";

      if (hasScrollableContent && isScrollable) {
        return element;
      }

      // Continue to check parent elements
      return findScrollableParent(element.parentElement);
    },
    []
  );

  // Clean up function for removing event listeners
  const cleanupListeners = useCallback(() => {
    if (currentScrollContainer.current) {
      currentScrollContainer.current.removeEventListener(
        "scroll",
        updatePosition
      );
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
      scrollListenerAdded.current = false;
    }

    if (resizeObserver.current) {
      resizeObserver.current.disconnect();
    }
  }, []);

  // Cleanup timers and event listeners on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
      cleanupListeners();
    };
  }, [cleanupListeners]);

  const clearAllTimers = () => {
    if (mouseEnterTimer.current) {
      clearTimeout(mouseEnterTimer.current);
      mouseEnterTimer.current = null;
    }
    if (mouseLeaveTimer.current) {
      clearTimeout(mouseLeaveTimer.current);
      mouseLeaveTimer.current = null;
    }
    if (placementUpdateTimer.current) {
      clearTimeout(placementUpdateTimer.current);
      placementUpdateTimer.current = null;
    }
  };

  // Update position function
  const updatePosition = useCallback(() => {
    if (!wrapperRef.current || !tooltipRef.current) return;

    const wrapperRect = wrapperRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Check if tooltip is in viewport
    let isInViewport = true;

    // First, determine best placement based on space available
    let bestPlacement = placement;
    const spaceTop = wrapperRect.top;
    const spaceBottom = viewportHeight - wrapperRect.bottom;
    const spaceLeft = wrapperRect.left;
    const spaceRight = viewportWidth - wrapperRect.right;

    // Check if current placement has enough space
    if (
      (bestPlacement === "top" && spaceTop < tooltipRect.height) ||
      (bestPlacement === "bottom" && spaceBottom < tooltipRect.height) ||
      (bestPlacement === "left" && spaceLeft < tooltipRect.width) ||
      (bestPlacement === "right" && spaceRight < tooltipRect.width)
    ) {
      // Find placement with most space
      const spaces = {
        top: spaceTop,
        bottom: spaceBottom,
        left: spaceLeft,
        right: spaceRight,
      };

      // Sort placements by available space
      bestPlacement = Object.entries(spaces).sort(
        (a, b) => b[1] - a[1]
      )[0][0] as TooltipPlacement;
    }

    // Calculate position based on best placement
    let newPosition: {
      top?: number;
      left?: number;
      bottom?: number;
      right?: number;
    } = {};

    switch (bestPlacement) {
      case "top":
        newPosition = {
          left:
            wrapperRect.left + wrapperRect.width / 2 - tooltipRect.width / 2,
          bottom: viewportHeight - wrapperRect.top + 8, // 8px offset
        };
        break;
      case "bottom":
        newPosition = {
          left:
            wrapperRect.left + wrapperRect.width / 2 - tooltipRect.width / 2,
          top: wrapperRect.bottom + 8, // 8px offset
        };
        break;
      case "left":
        newPosition = {
          right: viewportWidth - wrapperRect.left + 8, // 8px offset
          top:
            wrapperRect.top + wrapperRect.height / 2 - tooltipRect.height / 2,
        };
        break;
      case "right":
        newPosition = {
          left: wrapperRect.right + 8, // 8px offset
          top:
            wrapperRect.top + wrapperRect.height / 2 - tooltipRect.height / 2,
        };
        break;
    }

    // Check if tooltip would be outside viewport and adjust
    if (newPosition.left !== undefined && newPosition.left < 0) {
      newPosition.left = 8; // Min 8px from left edge
    }

    if (newPosition.right !== undefined && newPosition.right < 0) {
      newPosition.right = 8; // Min 8px from right edge
    }

    if (newPosition.top !== undefined && newPosition.top < 0) {
      newPosition.top = 8; // Min 8px from top edge
    }

    if (newPosition.bottom !== undefined && newPosition.bottom < 0) {
      newPosition.bottom = 8; // Min 8px from bottom edge
    }

    if (
      newPosition.left !== undefined &&
      newPosition.left + tooltipRect.width > viewportWidth
    ) {
      newPosition.left = viewportWidth - tooltipRect.width - 8;
    }

    if (
      newPosition.top !== undefined &&
      newPosition.top + tooltipRect.height > viewportHeight
    ) {
      newPosition.top = viewportHeight - tooltipRect.height - 8;
    }

    // Check if the wrapper element is visible within its scroll container
    if (currentScrollContainer.current) {
      const containerRect =
        currentScrollContainer.current.getBoundingClientRect();

      isInViewport = !(
        wrapperRect.bottom < containerRect.top ||
        wrapperRect.top > containerRect.bottom ||
        wrapperRect.right < containerRect.left ||
        wrapperRect.left > containerRect.right
      );
    }

    // Update state only if changes are needed
    setControlInfo((prev) => ({
      ...prev,
      isOpen: prev.isOpen && isInViewport, // Hide if not in viewport
      placement: bestPlacement,
      position: newPosition,
    }));
  }, [placement]);

  // Setup scroll and resize listeners
  const setupListeners = useCallback(() => {
    if (scrollListenerAdded.current) return;

    // Find the scrollable parent if not provided
    const scrollElement =
      scrollContainer ||
      (wrapperRef.current ? findScrollableParent(wrapperRef.current) : null);

    if (scrollElement) {
      currentScrollContainer.current = scrollElement;
      scrollElement.addEventListener("scroll", updatePosition);
      window.addEventListener("scroll", updatePosition);
      window.addEventListener("resize", updatePosition);
      scrollListenerAdded.current = true;

      // Setup resize observer for the scroll container
      if (resizeObserver.current) {
        resizeObserver.current.disconnect();
      }

      resizeObserver.current = new ResizeObserver(() => {
        updatePosition();
      });

      resizeObserver.current.observe(scrollElement);
    }
  }, [scrollContainer, findScrollableParent, updatePosition]);

  const handleMouseEnter = useCallback(() => {
    if (mouseLeaveTimer.current) {
      clearTimeout(mouseLeaveTimer.current);
      mouseLeaveTimer.current = null;
    }

    mouseEnterTimer.current = setTimeout(() => {
      setControlInfo((prev) => ({
        ...prev,
        isOpen: true,
      }));

      // Setup listeners when tooltip opens
      setupListeners();

      // Calculate position after render
      requestAnimationFrame(() => {
        updatePosition();
      });
    }, mouseEnterDelay);
  }, [mouseEnterDelay, setupListeners, updatePosition]);

  const handleMouseLeave = useCallback(() => {
    if (mouseEnterTimer.current) {
      clearTimeout(mouseEnterTimer.current);
      mouseEnterTimer.current = null;
    }

    mouseLeaveTimer.current = setTimeout(() => {
      setControlInfo((prev) => ({
        ...prev,
        isOpen: false,
      }));

      // Clean up listeners when tooltip closes
      cleanupListeners();
    }, mouseLeaveDelay);
  }, [mouseLeaveDelay, cleanupListeners]);

  const tooltipContent = useMemo(
    () => (
      <TooltipContent
        ref={tooltipRef}
        visible={controlInfo.isOpen}
        placement={controlInfo.placement}
        variant={variant}
        zIndex={zIndex}
        arrow={arrow}
        position={controlInfo.position}
      >
        {content}
      </TooltipContent>
    ),
    [
      controlInfo.isOpen,
      controlInfo.placement,
      controlInfo.position,
      variant,
      zIndex,
      arrow,
      content,
    ]
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

export const TooltipExample = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div>
      {/* Example with regular tooltips */}
      <div style={{ marginBottom: "20px" }}>
        <Tooltip content="Default tooltip with basic z-index" zIndex={1000}>
          <Button>Hover Default</Button>
        </Tooltip>
      </div>

      {/* Example with scrollable container */}
      <div
        ref={scrollContainerRef}
        style={{
          border: "1px solid #ddd",
          height: "200px",
          overflow: "auto",
          padding: "10px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            height: "400px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <Tooltip
              content="This tooltip will stay visible when in view"
              scrollContainer={scrollContainerRef.current}
            >
              <Button>Top tooltip in scroll container</Button>
            </Tooltip>
          </div>

          <div>
            <Tooltip
              content="Scroll to see how this tooltip behaves"
              placement="right"
              scrollContainer={scrollContainerRef.current}
            >
              <Button>Middle tooltip in scroll container</Button>
            </Tooltip>
          </div>

          <div>
            <Tooltip
              content="This tooltip will hide when scrolled out of view"
              placement="bottom"
              scrollContainer={scrollContainerRef.current}
            >
              <Button>Bottom tooltip in scroll container</Button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Additional examples */}
      <div style={{ marginBottom: "20px" }}>
        <Tooltip content="Left placement tooltip" placement="left">
          <Button>Hover Left</Button>
        </Tooltip>
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
        <h3>Modal Simulation (z-index: 1000)</h3>
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
    </div>
  );
};

// ContextMenu.tsx
import React, { useEffect, useRef } from "react";
import styled from "@emotion/styled";

export interface ContextMenuOption {
  label: string;
  action: () => void;
  divider?: boolean;
  icon?: React.ReactNode;
}

export interface ContextMenuPosition {
  x: number;
  y: number;
}

// Định nghĩa kiểu dữ liệu cho context
export interface CanvasContext {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  imageRef: React.RefObject<HTMLImageElement | null>;
}

interface ContextMenuProps {
  options: ContextMenuOption[];
  position: ContextMenuPosition;
  visible: boolean;
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  options,
  position,
  visible,
  onClose,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Đóng menu khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [visible, onClose]);

  // Đóng menu khi nhấn Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <MenuContainer
      ref={menuRef}
      style={{ top: position.y, left: position.x }}
      onClick={(e) => e.stopPropagation()}
    >
      {options.map((option, index) => (
        <React.Fragment key={index}>
          <MenuItem
            onClick={() => {
              option.action();
              onClose();
            }}
          >
            {option.icon && <IconWrapper>{option.icon}</IconWrapper>}
            {option.label}
          </MenuItem>
          {option.divider && <MenuDivider />}
        </React.Fragment>
      ))}
    </MenuContainer>
  );
};

// Hook tùy chỉnh với kiểu dữ liệu cụ thể
export const useContextMenu = () => {
  const [contextMenu, setContextMenu] = React.useState<{
    visible: boolean;
    position: ContextMenuPosition;
    context: CanvasContext | null;
  }>({
    visible: false,
    position: { x: 0, y: 0 },
    context: null,
  });

  const showContextMenu = (e: React.MouseEvent, context: CanvasContext) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      position: { x: e.clientX, y: e.clientY },
      context,
    });
  };

  const hideContextMenu = () => {
    setContextMenu((prev) => ({
      ...prev,
      visible: false,
    }));
  };

  return {
    contextMenuProps: {
      visible: contextMenu.visible,
      position: contextMenu.position,
      onClose: hideContextMenu,
    },
    showContextMenu,
    hideContextMenu,
    menuContext: contextMenu.context,
  };
};

// Styled Components
const MenuContainer = styled.div`
  position: fixed;
  background-color: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  min-width: 200px;
  z-index: 1000;
  overflow: hidden;
`;

const MenuItem = styled.div`
  padding: 8px 12px;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #f2f2f2;
  }
`;

const MenuDivider = styled.div`
  height: 1px;
  background-color: #ccc;
  margin: 4px 0;
`;

const IconWrapper = styled.span`
  margin-right: 8px;
  display: flex;
  align-items: center;
`;

export default ContextMenu;

import { css } from '@emotion/react';
import styled from '@emotion/styled';
import * as RadixToast from '@radix-ui/react-toast';
import {
  ToastActionProps,
  ToastCloseProps,
  ToastDescriptionProps,
  ToastPosition,
  ToastRootProps,
  ToastTitleProps,
  ToastViewportProps
} from './toast-type';

const getViewportPositionStyles = (position?: ToastPosition) => {
  switch (position) {
    case 'top-left':
      return css`
        top: 0;
        left: 0;
        align-items: flex-start;
      `;
    case 'top-right':
      return css`
        top: 0;
        right: 0;
        align-items: flex-end;
      `;
    case 'top-center':
      return css`
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        align-items: center;
      `;
    case 'bottom-left':
      return css`
        bottom: 0;
        left: 0;
        align-items: flex-start;
      `;
    case 'bottom-center':
      return css`
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        align-items: center;
      `;
    case 'bottom-right':
    default:
      return css`
        bottom: 0;
        right: 0;
        align-items: flex-end;
      `;
  }
};

const calculateGridStructure = ({ isDescription = false, isAction = false, isClose = false }) => {
  // Xác định có phần tử bên phải không (close button)
  const hasRightColumn = isClose;
  // Cấu hình cột dựa trên việc có close button hay không
  const gridTemplateColumns = hasRightColumn ? '1fr auto' : '1fr';
  
  let gridTemplateAreas = '';
  let gridTemplateRows = '';

  if (isDescription) {
    if (isClose && isAction) {
      gridTemplateAreas = `
        'title close' 
        'description close'
        'description action'`;
      gridTemplateRows = 'auto auto 1fr';
    } else if (isClose) {
      gridTemplateAreas = `
        'title close' 
        'description description'`;
      gridTemplateRows = 'auto 1fr';
    } else if (isAction) {
      gridTemplateAreas = `
        'title' 
        'description'
        'action'`;
      gridTemplateRows = 'auto 1fr auto';
    } else {
      gridTemplateAreas = `
        'title' 
        'description'`;
      gridTemplateRows = 'auto 1fr';
    }
  } else {
    if (isClose && isAction) {
      gridTemplateAreas = `
        'title close'
        'action action'`;
      gridTemplateRows = 'auto auto';
    } else if (isClose) {
      gridTemplateAreas = `'title close'`;
      gridTemplateRows = 'auto';
    } else if (isAction) {
      gridTemplateAreas = `
        'title'
        'action'`;
      gridTemplateRows = 'auto auto';
    } else {
      gridTemplateAreas = `'title'`;
      gridTemplateRows = 'auto';
    }
  }

  return {
    gridTemplateAreas,
    gridTemplateColumns,
    gridTemplateRows
  };
};

const getToastRootStylesDefault = ({
  isDescription = false,
  isAction = false,
  isClose = false
}: {
  isDescription?: boolean;
  isAction?: boolean;
  isClose?: boolean;
}) => {
  // Gọi hàm tính toán grid
  const { gridTemplateAreas, gridTemplateColumns, gridTemplateRows } = 
    calculateGridStructure({ isDescription, isAction, isClose });

  // Trả về CSS với cấu trúc grid đã tính toán
  return css`
    background-color: white;
    border-radius: 6px;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15);
    display: grid;
    column-gap: 15px;
    row-gap: 5px;
    position: relative;
    padding: 12px;
    
    grid-template-areas: ${gridTemplateAreas};
    grid-template-columns: ${gridTemplateColumns};
    grid-template-rows: ${gridTemplateRows};
  `;
};

export const StyledToastRoot = styled(RadixToast.Root)<ToastRootProps>`
  ${props => props.useCustomStyle ?  "":getToastRootStylesDefault({
    isAction: props.isAction,
    isClose: props.isClose,
    isDescription: props.isDescription,
  })}

  &[data-state='open'] {
    animation: slideIn 150ms cubic-bezier(0.16, 1, 0.3, 1);
  }
  &[data-state='closed'] {
    animation: slideOut 100ms ease-in;
  }
  &[data-swipe='move'] {
    transform: translateX(var(--radix-toast-swipe-move-x));
  }
  &[data-swipe='cancel'] {
    transform: translateX(0);
    transition: transform 200ms ease-out;
  }
  &[data-swipe='end'] {
    animation: swipeOut 100ms ease-out;
  }

  @keyframes slideIn {
    from {
      transform: translateX(calc(100% + 25px));
    }
    to {
      transform: translateX(0);
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(calc(100% + 25px));
    }
  }

  @keyframes swipeOut {
    from {
      transform: translateX(var(--radix-toast-swipe-end-x));
    }
    to {
      transform: translateX(calc(100% + 25px));
    }
  }
`;

export const StyledToastTitle = styled(RadixToast.Title)<ToastTitleProps>`
  grid-area: title;
  font-weight: 600;
  color: black;
  display: flex;
  align-items: center;
  gap: ${props => props.hasIcon ? '8px' : '0'};
  font-size: 16px;
`;

export const StyledToastDescription = styled(RadixToast.Description)<ToastDescriptionProps>`
  grid-area: description;
  margin: 0;
  color: black;
  line-height: 1.4;
  text-align: left;
  font-size: 14px;
`;

export const StyledToastAction = styled(RadixToast.Action)<ToastActionProps>`
  grid-area: action;
  align-self: end;
  justify-self: end;
`;

export const StyledToastClose = styled(RadixToast.Close)<ToastCloseProps>`
  grid-area: close;
  align-self: start;
  justify-self: end;
  border: none;
  background: transparent;
  color: #A1A1A1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: #333333;
  }
`;

export const StyledToastViewport = styled(RadixToast.Viewport)<ToastViewportProps>`
  position: fixed;
  ${props => getViewportPositionStyles(props.position)}
  display: flex;
  flex-direction: column;
  padding: 25px;
  gap: 10px;
  width: 390px;
  max-width: 100vw;
  margin: 0;
  list-style: none;
  z-index: 2147483647;
  outline: none;
  
`;
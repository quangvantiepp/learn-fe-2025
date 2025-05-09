import styled from "@emotion/styled";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  children?: React.ReactNode;
}

const ButtonStyled = styled.button<ButtonProps>`
  color: black;
  font-size: 16px;
`;

const Button = ({ disabled, onClick, children, ...props }: ButtonProps) => {
  return (
    <ButtonStyled disabled={disabled} onClick={onClick} {...props}>
      {children}
    </ButtonStyled>
  );
};

export default Button;

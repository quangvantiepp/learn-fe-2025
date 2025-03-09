import styled from "@emotion/styled";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
}

const ButtonStyled = styled.button<ButtonProps>`
  color: black;
  font-size: 16px;
`;

const Button = ({ label, disabled, onClick }: ButtonProps) => {
  return (
    <ButtonStyled disabled={disabled} onClick={onClick}>
      {label}
    </ButtonStyled>
  );
};

export default Button;

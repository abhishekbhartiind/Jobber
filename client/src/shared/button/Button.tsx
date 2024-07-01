import React from "react";
import { IButtonProps } from "../shared.interface";

const Button: React.FC<IButtonProps> = (props): React.ReactElement => {
  const { id, className, disabled, label, onClick, role, testId, type } = props;

  return (
    <button
      data-testid={testId}
      id={id}
      className={className}
      role={role}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {label}
    </button>
  );
};

export default Button;

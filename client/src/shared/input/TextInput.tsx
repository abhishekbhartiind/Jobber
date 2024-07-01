import React from "react";
import { ITextInputProps } from "../shared.interface";

const TextInput: React.ForwardRefExoticComponent<
  Omit<ITextInputProps, "ref"> & React.RefAttributes<HTMLInputElement>
> = React.forwardRef((props, ref) => (
  <>
    <input
      ref={ref}
      id={props.id}
      name={props.name}
      type={props.type}
      value={props.value}
      readOnly={props.readOnly}
      checked={props.checked}
      className={props.className}
      maxLength={props.maxLength}
      style={props.style}
      placeholder={props.placeholder}
      min={props.min}
      max={props.max}
      onChange={props.onChange}
      onClick={props.onClick}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      onKeyUp={props.onKeyUp}
      onKeyDown={props.onKeyDown}
      autoComplete={props.autoComplete ?? "false"}
      required={props.required ?? false}
    />
  </>
));

export default TextInput;

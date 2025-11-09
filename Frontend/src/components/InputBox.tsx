import React from "react";
import "../styles/InputBox.css";

interface Props {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
}

const InputBox: React.FC<Props> = ({ value, onChange, onSubmit, disabled }) => {
  return (
    <form onSubmit={onSubmit} className="input-box">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="Ask something..."
        disabled={disabled}
      />
      <button type="submit" disabled={disabled}>
        Send
      </button>
    </form>
  );
};

export default InputBox;

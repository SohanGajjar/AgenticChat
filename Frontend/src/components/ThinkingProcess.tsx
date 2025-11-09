import React from "react";

const ThinkingProcess: React.FC<{ message: string }> = ({ message }) => {
  return <div className="thinking">🧠 {message}</div>;
};

export default ThinkingProcess;

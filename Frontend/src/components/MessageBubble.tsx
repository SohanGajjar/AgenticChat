import React from "react";
import "../styles/MessageBubble.css";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ role, content }) => {
  const isUser = role === "user";
  return (
    <div className={`message-bubble ${isUser ? "user" : "assistant"}`}>
      {content}
    </div>
  );
};

export default MessageBubble;

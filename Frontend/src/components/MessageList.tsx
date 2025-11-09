import React from "react";
import type { Message } from "../types";

interface Props {
  messages: Message[];
}

const MessageList: React.FC<Props> = ({ messages }) => {
  return (
    <div className="message-list">
      {messages.map((msg, i) => (
        <div key={i} className={`message ${msg.type}`}>
          <strong>{msg.type === "user" ? "You" : msg.type === "ai" ? "AI" : "System"}:</strong>
          <p>{msg.content}</p>
        </div>
      ))}
    </div>
  );
};

export default MessageList;

import React from "react";
import type { Message } from "../types";
import "../styles/MessageList.css";

interface Props {
  messages: Message[];
}

const MessageList: React.FC<Props> = ({ messages }) => {
  return (
    <div className="message-list">
      {messages.map((msg, i) => {
        const isUser = msg.type === "user";
        const isAI = msg.type === "ai";
        const isSystem = msg.type === "system";

        return (
          <div
            key={i}
            className={`message-row ${
              isUser ? "user-row" : isAI ? "ai-row" : "system-row"
            }`}
          >
            {!isUser && !isSystem && (
              <div className="avatar ai-avatar">🤖</div>
            )}

            <div
              className={`message-bubble ${
                isUser
                  ? "user-bubble"
                  : isAI
                  ? "ai-bubble"
                  : "system-bubble"
              }`}
            >
              {msg.content}
            </div>

            {isUser && <div className="avatar user-avatar">🧑</div>}
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;

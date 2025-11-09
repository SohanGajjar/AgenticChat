import React, { useState } from "react";
import type { Message } from "../types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "../styles/MessageList.css";
import { Wrench, Brain, X } from "lucide-react";

interface Props {
  messages: Message[];
  tool_result?: Message[];
  reasoning?: Message[];
}

const MessageList: React.FC<Props> = ({ messages, tool_result, reasoning }) => {
  const [showPopup, setShowPopup] = useState<"tool" | "reasoning" | null>(null);

  const renderPopup = () => {
    if (!showPopup) return null;

    const isTool = showPopup === "tool";
    const data = isTool ? tool_result : reasoning;

    return (
      <div className="popup-overlay" onClick={() => setShowPopup(null)}>
        <div className="popup" onClick={(e) => e.stopPropagation()}>
          <div className="popup-header">
            <h3>{isTool ? "Tools Calls and Result" : "Reasoning Process"}</h3>
            <button className="close-btn" onClick={() => setShowPopup(null)}>
              <X size={18} />
            </button>
          </div>
          <div className="popup-content">
         {data && data.length > 0 ? (
  data.map((msg, idx) => (
    <div key={idx} className="popup-line markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {msg.content}
      </ReactMarkdown>
    </div>
  ))
) : (
  <p className="popup-line empty-text">No data available.</p>
)}

          </div>
        </div>
      </div>
    );
  };

  return (
    <>
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
                {isAI ? (
                  <div className="markdown">
                     <ReactMarkdown
                    
                    remarkPlugins={[remarkGfm]}
                  >
                    {msg.content}
                  </ReactMarkdown>
                  </div>
                 
                ) : (
                  msg.content
                )}

                {isAI && (
                  <div className="ai-icons">
                    {tool_result && tool_result.length > 0 && (
                      <button
                        className="icon-btn"
                        onClick={() => setShowPopup("tool")}
                      >
                        <Wrench size={16} />
                      </button>
                    )}
                    {reasoning && reasoning.length > 0 && (
                      <button
                        className="icon-btn"
                        onClick={() => setShowPopup("reasoning")}
                      >
                        <Brain size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              {isUser && <div className="avatar user-avatar">🧑</div>}
            </div>
          );
        })}
      </div>

      {renderPopup()}
    </>
  );
};

export default MessageList;

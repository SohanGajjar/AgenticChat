import React, { useEffect, useRef, useState } from "react";
import { sendChatMessage } from "../services/apiService";
import type { EventMessage, Message } from "../types";
import "../styles/ChatBox.css";

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [webResults, setWebResults] = useState<string[]>([]);
  const [systemMessages, setSystemMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isWebPanelOpen, setIsWebPanelOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // ✅ Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Handle events from backend
  const handleEvent = (event: EventMessage) => {
    switch (event.type) {
      case "response_start": {
        setMessages((prev) => [...prev, { type: "ai", content: "" }]);
        break;
      }

      case "response_chunk": {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.type === "ai") {
            last.content += event.content || "";
          }
          return updated;
        });
        break;
      }

      case "response_end": {
        setLoading(false);
        break;
      }

      // ✅ Handle web search results separately
      case "tool_call":
      case "tool_result": {
        const candidateOutput =
          typeof event.output === "string" && event.output.trim().length > 0
            ? event.output
            : typeof event.content === "string" && event.content.trim().length > 0
            ? event.content
            : undefined;

        if (candidateOutput) {
          setWebResults((prev) => [...prev, candidateOutput]);
          setIsWebPanelOpen(true);
        }
        break;
      }

      // ✅ Handle system or error messages outside chat
      case "error": {
        const errMsg =
          typeof event.content === "string" && event.content.trim().length > 0
            ? event.content
            : "An unknown error occurred.";
        setSystemMessages((prev) => [...prev, errMsg]);
        setLoading(false);
        break;
      }

      default:
        break;
    }
  };

  // ✅ Send message
  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { type: "user", content: input }]);
    setInput("");
    setLoading(true);

    await sendChatMessage(input, handleEvent);
  };

  // ✅ Enter to send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="main-layout">
      {/* ✅ Chat Section */}
      <div className="chat-container">
        <div className="chat-messages">
          {messages
            .filter((msg) => msg.type === "user" || msg.type === "ai")
            .map((msg, index) => (
              <div
                key={index}
                className={`chat-bubble ${
                  msg.type === "user"
                    ? "user-message"
                    : "ai-message"
                }`}
              >
                {msg.content}
              </div>
            ))}

          {loading && (
            <div className="ai-message thinking">AI is thinking...</div>
          )}

          <div ref={messagesEndRef}></div>
        </div>

        <div className="chat-input-area">
          <textarea
            className="chat-input"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className={`send-button ${loading ? "disabled" : ""}`}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>

      {/* ✅ Web Search Results Panel */}
      <div className={`web-panel ${isWebPanelOpen ? "open" : ""}`}>
        <div className="web-panel-header">
          <h3>🔎 Web Search Results</h3>
          <button
            className="close-panel"
            onClick={() => setIsWebPanelOpen(false)}
          >
            ✖
          </button>
        </div>

        <div className="web-results">
          {webResults.length === 0 ? (
            <p className="empty-text">No web search results yet.</p>
          ) : (
            webResults.map((result, index) => (
              <div key={index} className="web-result">
                {result}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ✅ System Messages Below Chat */}
      {systemMessages.length > 0 && (
        <div className="system-messages">
          <h4>⚙️ System Messages</h4>
          {systemMessages.map((msg, index) => (
            <p key={index} className="system-message">
              {msg}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatBox;

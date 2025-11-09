import React, { useState, useEffect, useRef } from "react";
import MessageList from "./MessageList";
import ThinkingProcess from "./ThinkingProcess";
import InputBox from "./InputBox";
import { useChat } from "../hooks/useChat";
import "../styles/ChatInterface.css";

const ChatInterface: React.FC = () => {
  const { messages, sendMessage, thinking, loading } = useChat();
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // ✅ Auto-scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-container">
        <header className="chat-header">
          <h1>🤖 Agentic Chat</h1>
        </header>

        <main className="chat-content">
          <MessageList messages={messages} />
          {thinking && <ThinkingProcess message={thinking} />}
          <div ref={chatEndRef}></div>
        </main>

        <footer className="chat-footer">
          <InputBox
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onSubmit={handleSubmit}
            disabled={loading}
          />
        </footer>
      </div>
    </div>
  );
};

export default ChatInterface;

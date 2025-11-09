import React, { useState } from "react";
import MessageList from "./MessageList";
import ThinkingProcess from "./ThinkingProcess";
import InputBox from "./InputBox";
import { useChat } from "../hooks/useChat";
import "../styles/App.css";

const ChatInterface: React.FC = () => {
  const { messages, sendMessage, thinking, loading } = useChat();
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
    setInput("");
  };

  return (
    <div className="chat-container">
      <h1>🤖 Agentic Chat</h1>
      <MessageList messages={messages} />
      {thinking && <ThinkingProcess message={thinking} />}
      <InputBox
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onSubmit={handleSubmit}
        disabled={loading}
      />
    </div>
  );
};

export default ChatInterface;

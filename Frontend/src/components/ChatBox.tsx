import React, { useState, useRef } from "react";
import MessageBubble from "./MessageBubble";
import "../styles/ChatBox.css";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatBox: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const chatRef = useRef<HTMLDivElement | null>(null);

const sendMessage = async () => {
  if (!input.trim()) return;

  const userMessage: Message = { role: "user", content: input };
  setMessages((prev) => [...prev, userMessage]);
  setInput("");

  try {
    const response = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: input }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) return;

    let assistantMessage = "";
    let hasAssistantStarted = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const events = chunk
        .split("\n\n")
        .filter((line) => line.startsWith("data: "));

      for (const event of events) {
        const data = event.replace("data: ", "");

        try {
          const json = JSON.parse(data);

          if (json.type === "reasoning") {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: "🤔 Thinking..." },
            ]);
          } else if (json.type === "tool_call") {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: `🔍 Searching for: ${json.input}` },
            ]);
          } else if (json.type === "tool_result") {
            // optional: skip showing search results
          } else if (json.type === "response") {
            // live stream: append text instead of replacing
            assistantMessage += json.content;

            if (!hasAssistantStarted) {
              hasAssistantStarted = true;
              setMessages((prev) => [
                ...prev,
                { role: "assistant", content: assistantMessage },
              ]);
            } else {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantMessage,
                };
                return updated;
              });
            }
          } else if (json.type === "error") {
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: `❌ ${json.content}` },
            ]);
          }
        } catch (err) {
          console.error("Error parsing event:", err);
        }
      }
    }
  } catch (err) {
    console.error("Chat error:", err);
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: "❌ Failed to connect to backend." },
    ]);
  }
};

  
  return (
    <div className="chat-container">
      <h2 className="chat-title">🤖 Agentic Chat</h2>

      <div ref={chatRef} className="chat-box">
        {messages.map((msg, index) => (
          <MessageBubble key={index} role={msg.role} content={msg.content} />
        ))}
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          value={input}
          placeholder="Type your message..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="chat-input"
        />
        <button onClick={sendMessage} className="chat-send-btn">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;

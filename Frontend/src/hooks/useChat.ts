import { useState, useRef } from "react";
import { sendChatMessage } from "../services/apiService";
import type { Message, EventMessage } from "../types";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [tool_result, setToolResult] = useState<Message[]>([]);
  const [reasoning, setReasoning] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [thinking, setThinking] = useState<string | null>(null);

  // track whether an AI bubble is active
  const aiActiveRef = useRef(false);

  const endThinking = () => {
    setThinking(null);
    setLoading(false);
    aiActiveRef.current = false;
  };

  const ensureAiBubble = () => {
    // if last message isn't an ai bubble, append one
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (!last || last.type !== "ai") {
        aiActiveRef.current = true;
        return [...prev, { type: "ai", content: "" }];
      }
      aiActiveRef.current = true;
      return prev;
    });
  };

  const appendToAiBubble = (text: string) => {
    if (!text) return;
    setMessages((prev) => {
      const updated = [...prev];
      const lastIndex = updated.length - 1;
      if (lastIndex < 0 || updated[lastIndex].type !== "ai") {
        // if no ai bubble exists, create one
        updated.push({ type: "ai", content: text });
      } else {
        updated[lastIndex] = {
          ...updated[lastIndex],
          content: updated[lastIndex].content + text,
        };
      }
      return updated;
    });
  };

  const handleEvent = (event: EventMessage) => {

    console.log("event",event)

    switch (event.type) {
      case "reasoning":
        setReasoning((prev) => [
          ...prev,
          { type: "reasoning", content: `Reasoning :\n${event.content}` },
        ]);
        break;

      case "tool_call":
        setThinking(`Using tool: ${event.tool} for "${event.input}"`);
        break;

      case "tool_result":
        setThinking("Fetched search results...");
        setToolResult((prev) => [
          ...prev,
          { type: "system", content: `📄 Web Data:\n${event.output}` },
        ]);
        break;

      // chunked streaming lifecycle events (preferred)
      case "response_start":
        setThinking("AI is responding...");
        ensureAiBubble();
        break;

      case "response_chunk":
        ensureAiBubble();
        appendToAiBubble(event.content || "");
        break;

      case "response_end":
        endThinking();
        break;

      case "error":
        endThinking();
        setMessages((prev) => [
          ...prev,
          { type: "system", content: `❌ ${event.content}` },
        ]);
        break;
    }
  };

  const sendMessage = async (query: string) => {
    if (!query.trim()) return;
    setMessages((prev) => [...prev, { type: "user", content: query }]);
    setLoading(true);
    setThinking("Analyzing...");

    try {
      await sendChatMessage(query, handleEvent);
    } catch (err) {
      console.error("sendMessage error:", err);
      setMessages((prev) => [
        ...prev,
        { type: "system", content: "❌ Failed to send message." },
      ]);
    } finally {
      // safety: ensure we stop loading if the backend forgot to send done
      setTimeout(() => {
        if (loading) {
          endThinking();
        }
      }, 20000); // 20s safety timeout
    }
    
  };

  return { messages, sendMessage, loading, thinking, tool_result, reasoning };
}

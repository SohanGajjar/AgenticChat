const API_BASE = "http://localhost:5000/api";

export async function sendChatMessage(
  query: string,
  onEvent: (event: any) => void
) {
  const response = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });

  if (!response.body) throw new Error("No response stream");

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      // Decode and accumulate partial chunks
      buffer += decoder.decode(value, { stream: true });

      // Each event is separated by two newlines
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith("data:")) continue;

        // Extract only the JSON data after "data:"
        const jsonStr = line.replace(/^data:\s*/, "");
        if (!jsonStr) continue;

        try {
          const event = JSON.parse(jsonStr);

          // ✅ Stream event to the frontend
          onEvent(event);

          // ✅ If the event signals the end, exit cleanly
          if (event.type === "done" || event.type === "response_end") {
            reader.cancel();
            return;
          }
        } catch (err) {
          console.warn("⚠️ Failed to parse SSE chunk:", jsonStr);
        }
      }
    }
  } catch (err) {
    console.error("💥 Error reading stream:", err);
    onEvent({ type: "error", content: "Stream interrupted" });
  } finally {
    reader.releaseLock?.();
  }
}

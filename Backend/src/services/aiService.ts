import axios from "axios";

/**
 * Get full AI response (non-streaming)
 */
export async function getAIResponse(prompt: string): Promise<string> {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`;

    const response = await axios.post(url, {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return text || "No response from Gemini";
  } catch (error: any) {
    console.error("Gemini API error:", error.response?.data || error.message);
    return "Error fetching response from Gemini.";
  }
}

/**
 * Stream AI response chunk by chunk
 * Uses Gemini's streamGenerateContent endpoint
 */
export async function streamAIResponse(
  prompt: string,
  onData: (chunk: string) => void
): Promise<void> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  // ✅ USE STREAMING ENDPOINT (notice "streamGenerateContent")
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`;

  try {
    const response = await axios.post(
      url,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        responseType: "stream", // Important for streaming
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    let buffer = "";

    // Listen for data chunks
    response.data.on("data", (chunk: Buffer) => {
      buffer += chunk.toString();
      
      // Process complete lines
      const lines = buffer.split("\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const jsonStr = line.slice(6); // Remove "data: " prefix
            
            // Skip [DONE] signal
            if (jsonStr.trim() === "[DONE]") continue;
            
            const parsed = JSON.parse(jsonStr);
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (text) {
              console.log("📨 Chunk received:", text.substring(0, 50) + "..."); // Debug log
              onData(text); // Send chunk to frontend
            }
          } catch (parseError) {
            // Ignore malformed JSON
            console.warn("⚠️ Failed to parse chunk:", line.substring(0, 100));
          }
        }
      }
    });

    response.data.on("end", () => {
      console.log("✅ Streaming completed");
    });

    response.data.on("error", (err: Error) => {
      console.error("❌ Streaming error:", err);
      onData("⚠️ Error during streaming.");
    });

    // Wait for stream to complete
    await new Promise<void>((resolve, reject) => {
      response.data.on("end", resolve);
      response.data.on("error", reject);
    });

  } catch (err: any) {
    console.error("❌ Gemini stream request error:", err.response?.data || err.message);
    throw new Error("Gemini streaming failed");
  }
}
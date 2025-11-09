import { Router, Request, Response } from "express";
import { searchWeb, formatSearchResults } from "../services/searchService";
import { getAIResponse, streamAIResponse } from "../services/aiService";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const { query } = req.body;
  if (!query) {
    res.write(`data: ${JSON.stringify({ type: "error", content: "Missing query" })}\n\n`);
    return res.end();
  }

  try {
    res.write(`data: ${JSON.stringify({ type: "reasoning", content: "Thinking..." })}\n\n`);

    const aiPlanPrompt = `You are an intelligent assistant.
User query: "${query}"
Decide if a web search is needed for up-to-date or factual information.
Answer only "yes" or "no".`;

    const aiPlan = (await getAIResponse(aiPlanPrompt)).trim().toLowerCase();
    console.log("🧭 AI Decision:", aiPlan);

    let searchData = "";

    if (aiPlan.startsWith("y")) {
      res.write(`data: ${JSON.stringify({ type: "tool_call", tool: "web_search", input: query })}\n\n`);
      const results = await searchWeb(query, 5);
      const formatted = formatSearchResults(results);
      res.write(`data: ${JSON.stringify({ type: "tool_result", tool: "web_search", output: formatted })}\n\n`);
      searchData = formatted;
    } else {
      res.write(`data: ${JSON.stringify({ type: "reasoning", content: "No web search needed. Generating response..." })}\n\n`);
    }

    const finalPrompt = searchData
      ? `Use the following web results to answer:\n\n${searchData}\n\nQuestion: ${query}`
      : `Answer this clearly:\n\n${query}`;

    res.write(`data: ${JSON.stringify({ type: "response_start" })}\n\n`);

    // ✅ STREAM RESPONSE PROPERLY
    try {
      await streamAIResponse(finalPrompt, (chunk: string) => {
        if (chunk && chunk.trim()) {
          res.write(
            `data: ${JSON.stringify({ type: "response_chunk", content: chunk })}\n\n`
          );
        }
      });

      // ✅ End signal for frontend
      res.write(`data: ${JSON.stringify({ type: "response_end" })}\n\n`);
    } catch (err) {
      console.warn("⚠️ Streaming failed, falling back to one-shot mode");
      const fallback = await getAIResponse(finalPrompt);
      res.write(`data: ${JSON.stringify({ type: "response_chunk", content: fallback })}\n\n`);
      res.write(`data: ${JSON.stringify({ type: "response_end" })}\n\n`);
    }
  } catch (err: any) {
    console.error("Chat route error:", err);
    res.write(`data: ${JSON.stringify({ type: "error", content: err.message })}\n\n`);
  } finally {
    res.end();
  }
});

export default router;

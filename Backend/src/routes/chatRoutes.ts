import { Router, Request, Response } from "express";
import { searchWeb, formatSearchResults } from "../services/searchService";
import { getAIResponse } from "../services/aiService";

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
    // Step 1: Send reasoning event
    res.write(`data: ${JSON.stringify({ type: "reasoning", content: "Thinking about the query..." })}\n\n`);

    // Step 2: Decide if web search is needed
    const aiPlanPrompt = `You are an intelligent agent. 
    The user asked: "${query}".
    Decide if this requires web search for up-to-date facts. 
    Respond with exactly one word: "yes" or "no".`;

    const aiPlan = await getAIResponse(aiPlanPrompt);

    let searchData = "";
    if (aiPlan.toLowerCase().includes("yes")) {
      // Step 3: Do tool call
      res.write(`data: ${JSON.stringify({ type: "tool_call", tool: "web_search", input: query })}\n\n`);

      const searchResults = await searchWeb(query, 5);
      const formattedResults = formatSearchResults(searchResults);

      res.write(`data: ${JSON.stringify({
        type: "tool_call",
        tool: "web_search",
        input: query,
        output: formattedResults
      })}\n\n`);

      searchData = formattedResults;
    }

    // Step 4: Get final AI response
    const finalPrompt = searchData
      ? `Use the following web data to answer the question:\n\n${searchData}\n\nQuestion: ${query}`
      : query;

    const finalAnswer = await getAIResponse(finalPrompt);

    res.write(`data: ${JSON.stringify({ type: "response", content: finalAnswer })}\n\n`);
  } catch (err: any) {
    console.error("Chat route error:", err);
    res.write(`data: ${JSON.stringify({ type: "error", content: err.message })}\n\n`);
  } finally {
    res.end();
  }
});

export default router;

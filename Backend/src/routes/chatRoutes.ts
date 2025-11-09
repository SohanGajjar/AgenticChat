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
    // ✅ STEP 1: Simple "Thinking..." indicator
    res.write(`data: ${JSON.stringify({ type: "thinking", content: "Thinking..." })}\n\n`);

    // ✅ STEP 2: Decide if web search is needed FIRST
    const aiPlanPrompt = `You are an intelligent assistant.
User query: "${query}"
Decide if a web search is needed for up-to-date or factual information.
Answer only "yes" or "no".`;

    const aiPlan = (await getAIResponse(aiPlanPrompt)).trim().toLowerCase();
    const needsWebSearch = aiPlan.startsWith("y");
    console.log("🧭 AI Decision:", needsWebSearch ? "Web search needed" : "No web search needed");

    let searchData = "";
    let toolUsed = "";

    // ✅ STEP 3: Execute web search if needed
    if (needsWebSearch) {
      // Show "Web Searching..." status
      res.write(`data: ${JSON.stringify({ type: "thinking", content: "Web Searching..." })}\n\n`);
      
      res.write(`data: ${JSON.stringify({ type: "tool_call", tool: "web_search", input: query })}\n\n`);
      const results = await searchWeb(query, 5);
      const formatted = formatSearchResults(results);
      res.write(`data: ${JSON.stringify({ type: "tool_result", tool: "web_search", output: formatted })}\n\n`);
      searchData = formatted;
      toolUsed = "SerpAPI";
    }

    // ✅ STEP 4: Generate detailed reasoning AFTER knowing what actions were taken
    const reasoningPrompt = needsWebSearch
      ? `You are an intelligent assistant. Explain your reasoning process for this query.

User query: "${query}"

You decided to use web search and found information. Write a detailed reasoning in 4-5 lines explaining:
1. What the user wants to know
2. Why web search was necessary (current information, factual verification, etc.)
3. That you used ${toolUsed} to get current information
4. How you'll structure your response based on the search results

Write in first person as if thinking out loud. Start with "The user wants to know..." and mention using web search.`
      : `You are an intelligent assistant. Explain your reasoning process for this query.

User query: "${query}"

You decided NOT to use web search. Write a detailed reasoning in 4-5 lines explaining:
1. What the user wants to know
2. Why you have sufficient knowledge without web search
3. What type of information you'll provide (explanation, analysis, etc.)
4. How you'll structure your response

Write in first person as if thinking out loud. Start with "The user wants to know..." and explain why no web search was needed.`;

    const detailedReasoning = await getAIResponse(reasoningPrompt);
    console.log("🧠 Detailed Reasoning:", detailedReasoning);

    // Send detailed reasoning
    res.write(`data: ${JSON.stringify({ type: "reasoning", content: detailedReasoning.trim() })}\n\n`);

    // ✅ STEP 5: Generate final response
    const finalPrompt = searchData
      ? `Use the following web results to answer the question. Be comprehensive and cite the information.

Web Search Results:
${searchData}

Question: ${query}

Provide a detailed answer based on the search results above.`
      : `Answer the following question clearly and comprehensively using your knowledge:

Question: ${query}

Provide a detailed, well-structured answer.`;

    res.write(`data: ${JSON.stringify({ type: "response_start" })}\n\n`);

    // ✅ STEP 6: Stream response
    try {
      await streamAIResponse(finalPrompt, (chunk: string) => {
        if (chunk && chunk.trim()) {
          res.write(
            `data: ${JSON.stringify({ type: "response_chunk", content: chunk })}\n\n`
          );
        }
      });

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
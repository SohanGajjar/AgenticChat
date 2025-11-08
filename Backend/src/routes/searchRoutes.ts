import { Router, Request, Response } from "express";
import { searchWeb, formatSearchResults } from "../services/searchService";

const router = Router();

/**
 * Test search endpoint
 * GET /api/search/test?q=your+query
 */
router.get("/test", async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required. Example: /api/search/test?q=AI+news',
      });
    }

    console.log(`\n📞 Search request received: "${query}"`);

    const results = await searchWeb(query, 5);
    const formattedResults = formatSearchResults(results);

    res.json({
      success: true,
      query: query,
      resultsCount: results.length,
      results: results,
      formatted: formattedResults,
    });
  } catch (error) {
    console.error("Search endpoint error:", error);
    res.status(500).json({
      success: false,
      error: "Search failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/search
 * Body: { "query": "your search query" }
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: "Query is required in request body",
      });
    }

    const results = await searchWeb(query, 5);

    res.json({
      success: true,
      query: query,
      results: results,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      success: false,
      error: "Search failed",
    });
  }
});

export default router;

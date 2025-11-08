import axios from "axios";

// Search result interface
export interface SearchResult {
  title: string;
  url: string;
  description: string;
}

/**
 * Search the web using SerpAPI
 * @param query - Search query string
 * @param maxResults - Maximum number of results to return (default: 5)
 * @returns Array of search results
 */
export async function searchWeb(query: string, maxResults: number = 5): Promise<SearchResult[]> {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.error("❌ SERPAPI_KEY not found in environment variables");
    return [];
  }

  console.log(`🔍 Searching on Google via SerpAPI for: "${query}"`);

  try {
    const response = await axios.get("https://serpapi.com/search.json", {
      params: {
        q: query,
        engine: "google",
        api_key: apiKey,
      },
    });

    // Extract first `maxResults` organic results
    const organicResults = response.data.organic_results || [];
    const results: SearchResult[] = organicResults
      .slice(0, maxResults)
      .map((r: any) => ({
        title: r.title || "No title",
        url: r.link || "",
        description: r.snippet || r.title || "No description available",
      }));

    console.log(`✅ Found ${results.length} results`);
    return results;
  } catch (err: any) {
    console.error("❌ Search error:", err.response?.data || err.message);
    return [];
  }
}

/**
 * Format search results into a readable string for AI
 * @param results - Array of search results
 * @returns Formatted string
 */
export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return "No search results found.";
  }

  return results
    .map((result, index) => `[${index + 1}] ${result.title}\n${result.description}\nURL: ${result.url}`)
    .join("\n\n");
}

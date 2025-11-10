import { tavilyInstance } from "@/lib/tavily";
import { tool } from "ai";
import { z } from "zod";

export const webSearch = () =>
  tool({
    description:
      "Search the web for current information. Use when you need up-to-date info or when user asks to search the internet.",
    inputSchema: z.object({
      query: z.string().describe("Search web query"),
    }),
    execute: async ({ query }) => {
      try {
        const response = await tavilyInstance.search(query, {
          includeAnswer: true,
          includeFavicon: true,
          includeImages: false,
          maxResults: 3,
        });

        const results = (response.results || []).map((r) => ({
          title: r.title,
          url: r.url,
          content: r.content,
          favicon: response?.favicon || null,
        }));

        return {
          success: true,
          answer: response.answer || "No summary available",
          results: results,
          response_time: response.responseTime,
        };
      } catch (error) {
        return {
          success: false,
          message: "Web search failed",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    },
  });

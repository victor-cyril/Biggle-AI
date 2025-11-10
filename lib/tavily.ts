import { tavily } from "@tavily/core";

const tavilyInstance = tavily({ apiKey: process.env.TAVILY_API_KEY });
export { tavilyInstance };

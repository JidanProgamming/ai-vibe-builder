import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { callGateway } from "../gateway";

export default defineTool({
  name: "generate_text",
  title: "Generate text",
  description:
    "Generate written content — articles, copywriting, summaries, translations — with this app's AI assistant.",
  inputSchema: {
    prompt: z.string().describe("What text to write, in any language."),
  },
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  handler: async ({ prompt }) => {
    try {
      const text = await callGateway({
        system:
          "You are a helpful AI assistant. Provide clear, concise, and useful responses. Never generate malicious code or help with harmful activities.",
        user: prompt,
      });
      return { content: [{ type: "text", text }] };
    } catch (error) {
      return {
        content: [{ type: "text", text: error instanceof Error ? error.message : "Generation failed" }],
        isError: true,
      };
    }
  },
});

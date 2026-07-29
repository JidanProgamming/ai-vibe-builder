import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { callGateway } from "../gateway";

const CATEGORY_HINTS: Record<string, string> = {
  landing: "a modern, responsive marketing landing page",
  dashboard: "a clean admin dashboard UI with stats cards, tables and navigation",
  component: "a reusable, well-structured UI component",
  app: "a business application UI with suggested backend/data structure",
  website: "an SEO-optimized business website with compelling copywriting",
  game: "an interactive promotional mini-game that is fully playable",
  aiapps: "an AI-powered tool app with text, image and chat sections",
};

export default defineTool({
  name: "generate_code",
  title: "Generate code",
  description:
    "Generate a complete, runnable standalone HTML page (Tailwind CDN) plus a React/TypeScript version for a described project.",
  inputSchema: {
    prompt: z.string().describe("What to build, in any language."),
    category: z
      .enum(["landing", "dashboard", "component", "app", "website", "game", "aiapps"])
      .describe("The kind of project to generate."),
  },
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  handler: async ({ prompt, category }) => {
    const hint = CATEGORY_HINTS[category] ?? CATEGORY_HINTS.landing;
    try {
      const text = await callGateway({
        system: `You are an expert web developer. Generate ${hint}.
Always provide a complete standalone HTML file first (with <!DOCTYPE html> and <script src="https://cdn.tailwindcss.com"></script>), using real Unsplash images (https://images.unsplash.com/photo-{ID}?w=800&h=600&fit=crop) and avatars (https://i.pravatar.cc/150?img=1).
Then provide a React/TypeScript component version. Keep explanations brief and respond in the language of the user's prompt.`,
        user: `Generate code for the following request:\n\n${prompt}`,
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

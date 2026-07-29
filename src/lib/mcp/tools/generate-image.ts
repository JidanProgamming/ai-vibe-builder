import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { generateImage } from "../gateway";

export default defineTool({
  name: "generate_image",
  title: "Generate image",
  description: "Create an image from a text description using this app's AI image model.",
  inputSchema: {
    prompt: z.string().describe("Description of the image to create."),
  },
  annotations: { readOnlyHint: true, destructiveHint: false, openWorldHint: false },
  handler: async ({ prompt }) => {
    try {
      const { text, image } = await generateImage(prompt);
      if (!image) {
        return { content: [{ type: "text", text: text || "No image was generated" }], isError: !text };
      }
      const [meta, base64] = image.split(",");
      const mimeType = meta?.match(/data:(.*?);base64/)?.[1] ?? "image/png";
      return {
        content: [
          ...(text ? [{ type: "text" as const, text }] : []),
          { type: "image" as const, data: base64 ?? "", mimeType },
        ],
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: error instanceof Error ? error.message : "Image generation failed" }],
        isError: true,
      };
    }
  },
});

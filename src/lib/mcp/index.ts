import { defineMcp } from "@lovable.dev/mcp-js";
import generateCodeTool from "./tools/generate-code";
import generateTextTool from "./tools/generate-text";
import generateImageTool from "./tools/generate-image";

export default defineMcp({
  name: "generative-digital-lab-mcp",
  title: "Generative Digital Lab",
  version: "0.1.0",
  instructions:
    "Tools from Generative Digital Lab. Use `generate_code` to build landing pages, dashboards, components, websites, apps or mini-games; `generate_text` for written content; `generate_image` to create images from a description.",
  tools: [generateCodeTool, generateTextTool, generateImageTool],
});

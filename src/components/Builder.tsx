import { useState } from "react";
import ModelSelector from "./ModelSelector";
import CategorySelector from "./CategorySelector";
import PromptInput from "./PromptInput";
import OutputPreview from "./OutputPreview";
import { toast } from "@/hooks/use-toast";
import { ImageIcon, Sparkles, CheckCircle2 } from "lucide-react";

const Builder = () => {
  const [model, setModel] = useState<"frontend" | "fullstack">("frontend");
  const [category, setCategory] = useState("landing");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [generationStep, setGenerationStep] = useState<"idle" | "images" | "code">("idle");
  const [aiImages, setAiImages] = useState<Record<string, string>>({});
  const [imageCount, setImageCount] = useState(0);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Masukkan deskripsi website yang ingin dibuat",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setOutput("");
    setAiImages({});
    setImageCount(0);
    setGenerationStep("images");

    let generatedAiImages: Record<string, string> = {};

    // Step 1: Generate AI images first (skip for game category)
    if (category !== "game") {
      try {
        const imgResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-images`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({ prompt }),
          }
        );

        if (imgResponse.ok) {
          const imgData = await imgResponse.json();
          if (imgData.images && Object.keys(imgData.images).length > 0) {
            generatedAiImages = imgData.images;
            setAiImages(generatedAiImages);
            setImageCount(Object.keys(generatedAiImages).length);
            console.log(`Generated ${Object.keys(generatedAiImages).length} AI images`);
          }
        } else if (imgResponse.status === 402) {
          toast({
            title: "Kredit habis",
            description: "Tambah kredit di Settings → Workspace → Usage untuk melanjutkan",
            variant: "destructive",
          });
          setIsLoading(false);
          setGenerationStep("idle");
          return;
        } else if (imgResponse.status === 429) {
          // Rate limited on image gen, continue without images
          console.warn("Image generation rate limited, continuing without AI images");
        }
      } catch (err) {
        console.warn("Image generation failed, continuing without AI images:", err);
      }
    }

    // Step 2: Generate website code with AI images
    setGenerationStep("code");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            prompt,
            model,
            category,
            aiImages: generatedAiImages,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate code");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let generatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              generatedText += content;
              setOutput(generatedText);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw || raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              generatedText += content;
              setOutput(generatedText);
            }
          } catch { /* ignore */ }
        }
      }

      toast({
        title: "Berhasil!",
        description: `Website berhasil digenerate${Object.keys(generatedAiImages).length > 0 ? ` dengan ${Object.keys(generatedAiImages).length} gambar AI` : ""}`,
      });
    } catch (error) {
      console.error("Generation error:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Gagal generate kode",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setGenerationStep("idle");
    }
  };

  return (
    <section id="builder" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Mulai <span className="text-gradient">Generate Sekarang</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pilih model, kategori, lalu deskripsikan ide Anda. AI akan generate
            gambar & kode secara otomatis.
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          {/* Step 1 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                1
              </span>
              Pilih Model
            </h3>
            <ModelSelector selected={model} onSelect={setModel} />
          </div>

          {/* Step 2 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                2
              </span>
              Pilih Kategori
            </h3>
            <CategorySelector
              model={model}
              selected={category}
              onSelect={setCategory}
            />
          </div>

          {/* Step 3 */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                3
              </span>
              Deskripsikan Ide Anda
            </h3>
            <PromptInput
              value={prompt}
              onChange={setPrompt}
              onSubmit={handleGenerate}
              isLoading={isLoading}
              model={model}
            />
          </div>

          {/* AI Generation Progress */}
          {isLoading && (
            <div className="glass rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {generationStep === "images" ? (
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center animate-pulse">
                    <ImageIcon className="w-4 h-4 text-accent" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {generationStep === "images"
                      ? "Generating gambar AI untuk website..."
                      : `✓ ${imageCount} gambar AI berhasil dibuat`}
                  </p>
                  {generationStep === "images" && (
                    <p className="text-xs text-muted-foreground">
                      Membuat logo, hero image, dan visual lainnya
                    </p>
                  )}
                </div>
              </div>

              {generationStep === "code" && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Generating kode website dengan gambar AI...
                    </p>
                    <p className="text-xs text-muted-foreground">
                      AI sedang menulis HTML, CSS, dan JavaScript
                    </p>
                  </div>
                </div>
              )}

              {/* Thumbnail preview of generated images */}
              {Object.keys(aiImages).length > 0 && (
                <div className="flex gap-2 flex-wrap mt-1">
                  {Object.entries(aiImages).map(([id, url]) => (
                    <div key={id} className="relative">
                      <img
                        src={url}
                        alt={id}
                        className="w-14 h-14 rounded-lg object-cover border border-border/50"
                      />
                      <span className="absolute bottom-0 left-0 right-0 text-center text-[9px] bg-foreground/60 text-background rounded-b-lg px-1 truncate">
                        {id}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Output */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                4
              </span>
              Hasil Generate
            </h3>
            <OutputPreview
              code={output}
              isLoading={isLoading}
              category={category}
              model={model}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Builder;

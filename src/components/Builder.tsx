import { useState } from "react";
import ModelSelector from "./ModelSelector";
import CategorySelector from "./CategorySelector";
import PromptInput from "./PromptInput";
import OutputPreview from "./OutputPreview";
import { toast } from "@/hooks/use-toast";

const Builder = () => {
  const [model, setModel] = useState<"frontend" | "fullstack">("frontend");
  const [category, setCategory] = useState("landing");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState("");

  const streamResponse = async (body: Record<string, unknown>) => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-code`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate code');
    }
    if (!response.body) throw new Error('No response body');

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

    if (textBuffer.trim()) {
      for (const raw of textBuffer.split("\n")) {
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
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description of what you want to build",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setOutput("");

    try {
      await streamResponse({ prompt, model, category });

      toast({
        title: "Success!",
        description: "Code generated successfully",
      });
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (editPrompt: string) => {
    if (!editPrompt.trim() || !output) return;
    
    setIsLoading(true);
    try {
      await streamResponse({ prompt: editPrompt, model, category, existingCode: output });
      toast({
        title: "Success!",
        description: "Website berhasil diperbarui",
      });
    } catch (error) {
      console.error('Edit error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Gagal mengedit website",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
            Pilih model, kategori, lalu deskripsikan ide Anda. AI akan generate kode dalam hitungan detik.
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          {/* Step 1: Model Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">1</span>
              Pilih Model
            </h3>
            <ModelSelector selected={model} onSelect={setModel} />
          </div>

          {/* Step 2: Category Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">2</span>
              Pilih Kategori
            </h3>
            <CategorySelector model={model} selected={category} onSelect={setCategory} />
          </div>

          {/* Step 3: Prompt Input */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">3</span>
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

          {/* Output */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">4</span>
              Hasil Generate
            </h3>
            <OutputPreview code={output} isLoading={isLoading} onEdit={handleEdit} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Builder;

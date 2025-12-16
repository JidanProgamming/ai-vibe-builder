import { Send, Sparkles } from "lucide-react";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  model: "frontend" | "fullstack";
}

const placeholders = {
  frontend: "Contoh: Buat landing page untuk startup fintech dengan hero section, fitur, pricing, dan testimonial...",
  fullstack: "Contoh: Buat aplikasi booking salon dengan fitur jadwal, pembayaran, dan dashboard admin...",
};

const PromptInput = ({ value, onChange, onSubmit, isLoading, model }: PromptInputProps) => {
  return (
    <div className="glass-strong rounded-2xl p-4">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholders[model]}
        className="w-full bg-transparent border-none outline-none resize-none min-h-[120px] text-foreground placeholder:text-muted-foreground"
        disabled={isLoading}
      />
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>AI akan menganalisis dan generate kode</span>
        </div>
        <button
          onClick={onSubmit}
          disabled={!value.trim() || isLoading}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            model === "frontend"
              ? "bg-primary text-primary-foreground hover:opacity-90 glow-primary"
              : "bg-accent text-accent-foreground hover:opacity-90 glow-accent"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Generate
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PromptInput;

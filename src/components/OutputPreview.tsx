import { Code2, Eye, Copy, Download, Check } from "lucide-react";
import { useState } from "react";

interface OutputPreviewProps {
  code: string;
  isLoading: boolean;
}

const OutputPreview = ({ code, isLoading }: OutputPreviewProps) => {
  const [activeTab, setActiveTab] = useState<"preview" | "code">("code");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!code && !isLoading) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary mx-auto mb-4 flex items-center justify-center">
          <Code2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">Hasil akan muncul di sini</h3>
        <p className="text-sm text-muted-foreground">
          Pilih model, kategori, lalu masukkan deskripsi ide Anda
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/20 mx-auto mb-4 flex items-center justify-center animate-pulse">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2">AI sedang bekerja...</h3>
        <p className="text-sm text-muted-foreground">
          Menganalisis prompt dan generate kode untuk Anda
        </p>
        <div className="mt-6 h-2 bg-secondary rounded-full overflow-hidden max-w-xs mx-auto">
          <div className="h-full bg-gradient-to-r from-primary to-accent animate-shimmer" style={{ width: "100%", backgroundSize: "200% 100%" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "code" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <Code2 className="w-4 h-4" />
            Kode
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "preview" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-all">
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[500px] overflow-auto">
        {activeTab === "code" ? (
          <pre className="font-mono text-sm text-foreground whitespace-pre-wrap">
            <code>{code}</code>
          </pre>
        ) : (
          <div className="bg-background rounded-lg p-4 min-h-[300px]">
            <p className="text-muted-foreground text-center">Preview akan tersedia setelah implementasi backend</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Add Sparkles import
import { Sparkles } from "lucide-react";

export default OutputPreview;

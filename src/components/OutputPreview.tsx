import { Code2, Eye, Copy, Download, Check, Sparkles } from "lucide-react";
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

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-code.tsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  if (isLoading && !code) {
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
            disabled={!code}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-all disabled:opacity-50"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button 
            onClick={handleDownload}
            disabled={!code}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[500px] overflow-auto">
        {activeTab === "code" ? (
          <div className="relative">
            {isLoading && (
              <div className="absolute top-2 right-2 flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Generating...
              </div>
            )}
            <pre className="font-mono text-sm text-foreground whitespace-pre-wrap">
              <code>{code}</code>
            </pre>
          </div>
        ) : (
          <div className="bg-background rounded-lg p-4 min-h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground text-center">
              Preview tersedia untuk kode HTML/CSS. <br />
              Untuk React components, copy kode dan jalankan di project Anda.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPreview;

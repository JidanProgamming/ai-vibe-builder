import { Code2, Eye, Copy, Download, Check, Sparkles, Maximize2, Minimize2, ExternalLink, Rocket, Link, FolderTree } from "lucide-react";
import { useState, useMemo } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import JSZip from "jszip";
import FileExplorer, { FileItem } from "./FileExplorer";

interface OutputPreviewProps {
  code: string;
  isLoading: boolean;
  category?: string;
  model?: string;
}

const extractHtmlFromCode = (code: string): string => {
  if (code.includes('<!DOCTYPE html>') || code.includes('<html')) {
    const htmlMatch = code.match(/<!DOCTYPE html>[\s\S]*<\/html>/i) || 
                      code.match(/<html[\s\S]*<\/html>/i);
    if (htmlMatch) return htmlMatch[0];
  }

  const htmlBlockMatch = code.match(/```html\n([\s\S]*?)```/);
  if (htmlBlockMatch) return htmlBlockMatch[1];

  const jsxMatch = code.match(/return\s*\(\s*([\s\S]*?)\s*\);?\s*};?\s*$/m);
  if (jsxMatch) {
    let jsx = jsxMatch[1];
    jsx = jsx.replace(/className=/g, 'class=');
    jsx = jsx.replace(/\{[^}]*\}/g, '');
    return generatePreviewHtml(jsx);
  }

  if (code.includes('<div') || code.includes('<section') || code.includes('<header')) {
    const jsxContent = code.match(/<(?:div|section|header|main|footer|nav|article)[\s\S]*$/);
    if (jsxContent) {
      let content = jsxContent[0];
      content = content.replace(/className=/g, 'class=');
      content = content.replace(/\{[^}]*\}/g, '');
      return generatePreviewHtml(content);
    }
  }

  return '';
};

const generatePreviewHtml = (content: string): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, sans-serif;
    }
  </style>
</head>
<body>
  ${content}
</body>
</html>
  `;
};

// Parse code blocks from generated output
const parseCodeBlocks = (code: string): FileItem[] => {
  const files: FileItem[] = [];
  const codeBlockRegex = /```(\w+)?\s*(?:\/\/\s*(.+?)\n|#\s*(.+?)\n)?([^`]+)```/g;
  let match;
  
  const projectFiles: Record<string, FileItem[]> = {
    src: [],
    public: [],
    supabase: [],
  };

  let fileIndex = 0;
  while ((match = codeBlockRegex.exec(code)) !== null) {
    const lang = match[1] || 'text';
    const filename = match[2] || match[3] || `file${fileIndex}.${getExtension(lang)}`;
    const content = match[4].trim();
    
    fileIndex++;

    const fileItem: FileItem = {
      name: filename.trim(),
      type: "file",
      content,
      language: lang,
    };

    // Categorize files
    if (filename.includes('index.html') || filename.includes('.html')) {
      projectFiles.public.push(fileItem);
    } else if (filename.includes('edge') || filename.includes('function') || filename.includes('supabase')) {
      projectFiles.supabase.push(fileItem);
    } else {
      projectFiles.src.push(fileItem);
    }
  }

  // If no code blocks found, create a single file
  if (fileIndex === 0 && code.trim()) {
    const hasHtml = code.includes('<!DOCTYPE') || code.includes('<html');
    const hasReact = code.includes('import React') || code.includes('export default');
    
    if (hasHtml) {
      projectFiles.public.push({
        name: 'index.html',
        type: 'file',
        content: code,
        language: 'html',
      });
    } else if (hasReact) {
      projectFiles.src.push({
        name: 'App.tsx',
        type: 'file',
        content: code,
        language: 'tsx',
      });
    } else {
      projectFiles.src.push({
        name: 'main.ts',
        type: 'file',
        content: code,
        language: 'typescript',
      });
    }
  }

  // Build file tree
  if (projectFiles.src.length > 0) {
    files.push({
      name: 'src',
      type: 'folder',
      children: projectFiles.src,
    });
  }
  
  if (projectFiles.public.length > 0) {
    files.push({
      name: 'public',
      type: 'folder',
      children: projectFiles.public,
    });
  }
  
  if (projectFiles.supabase.length > 0) {
    files.push({
      name: 'supabase',
      type: 'folder',
      children: [{
        name: 'functions',
        type: 'folder',
        children: projectFiles.supabase,
      }],
    });
  }

  // Add common config files
  files.push({
    name: 'package.json',
    type: 'file',
    content: JSON.stringify({
      name: 'ai-generated-project',
      version: '1.0.0',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0'
      },
      devDependencies: {
        '@vitejs/plugin-react': '^4.0.0',
        vite: '^4.4.0',
        typescript: '^5.0.0'
      }
    }, null, 2),
    language: 'json',
  });

  files.push({
    name: 'README.md',
    type: 'file',
    content: '# AI Generated Project\n\nGenerated by AI Vibe Coding\n\n## Getting Started\n\n```bash\nnpm install\nnpm run dev\n```',
    language: 'md',
  });

  return files;
};

const getExtension = (lang: string): string => {
  const map: Record<string, string> = {
    typescript: 'ts',
    javascript: 'js',
    tsx: 'tsx',
    jsx: 'jsx',
    html: 'html',
    css: 'css',
    json: 'json',
    python: 'py',
    sql: 'sql',
  };
  return map[lang] || lang;
};

const generateSlug = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  for (let i = 0; i < 8; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
};

const OutputPreview = ({ code, isLoading, category, model }: OutputPreviewProps) => {
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "files">("preview");
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);

  const previewHtml = useMemo(() => {
    if (!code) return '';
    return extractHtmlFromCode(code);
  }, [code]);

  const fileTree = useMemo(() => {
    if (!code) return [];
    return parseCodeBlocks(code);
  }, [code]);

  const handleCopy = () => {
    const contentToCopy = selectedFile?.content || code;
    navigator.clipboard.writeText(contentToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    
    const addFilesToZip = (items: FileItem[], path: string = '') => {
      items.forEach(item => {
        const itemPath = path ? `${path}/${item.name}` : item.name;
        if (item.type === 'folder' && item.children) {
          addFilesToZip(item.children, itemPath);
        } else if (item.content) {
          zip.file(itemPath, item.content);
        }
      });
    };
    
    addFilesToZip(fileTree);
    
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-generated-project.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Project downloaded as ZIP!");
  };

  const handleDeploy = async () => {
    if (!code || !previewHtml) {
      toast.error("Tidak ada kode untuk di-deploy");
      return;
    }

    setIsDeploying(true);
    try {
      const slug = generateSlug();
      
      const { error } = await supabase
        .from("deployed_sites")
        .insert({
          slug,
          title: "AI Generated Site",
          code,
          html_content: previewHtml,
        });

      if (error) throw error;

      const siteUrl = `${window.location.origin}/site/${slug}`;
      setDeployedUrl(siteUrl);
      toast.success("Website berhasil di-deploy!");
    } catch (error) {
      console.error("Deploy error:", error);
      toast.error("Gagal men-deploy website");
    } finally {
      setIsDeploying(false);
    }
  };

  const copyDeployedUrl = () => {
    if (deployedUrl) {
      navigator.clipboard.writeText(deployedUrl);
      toast.success("URL berhasil disalin!");
    }
  };

  const openInCodeSandbox = () => {
    const files = {
      'package.json': {
        content: JSON.stringify({
          name: 'ai-vibe-generated',
          version: '1.0.0',
          dependencies: { react: '^18.2.0', 'react-dom': '^18.2.0' },
          devDependencies: { '@vitejs/plugin-react': '^4.0.0', vite: '^4.4.0' },
          scripts: { dev: 'vite', build: 'vite build' }
        }, null, 2)
      },
      'index.html': {
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Vibe Generated</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`
      },
      'src/main.jsx': {
        content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)`
      },
      'src/App.jsx': { content: code }
    };

    const parameters = btoa(unescape(encodeURIComponent(JSON.stringify({ files }))))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    window.open(`https://codesandbox.io/api/v1/sandboxes/define?parameters=${parameters}`, '_blank');
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

  const getLanguageFromFile = (file: FileItem | null): string => {
    if (!file) return 'tsx';
    const ext = file.name.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      ts: 'typescript',
      tsx: 'tsx',
      js: 'javascript',
      jsx: 'jsx',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      py: 'python',
      sql: 'sql',
    };
    return langMap[ext || ''] || 'text';
  };

  return (
    <div className={`glass rounded-2xl overflow-hidden transition-all ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}>
      {isFullscreen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm -z-10" onClick={() => setIsFullscreen(false)} />
      )}

      {/* Tabs */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 flex-wrap gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "preview" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "files" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <FolderTree className="w-4 h-4" />
            Files
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === "code" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <Code2 className="w-4 h-4" />
            Raw
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={handleCopy}
            disabled={!code}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-all disabled:opacity-50"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy"}
          </button>
          <button 
            onClick={handleDownloadZip}
            disabled={!code}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            ZIP
          </button>
          <button 
            onClick={openInCodeSandbox}
            disabled={!code}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary transition-all disabled:opacity-50"
          >
            <ExternalLink className="w-4 h-4" />
            CodeSandbox
          </button>
          <button 
            onClick={handleDeploy}
            disabled={!code || !previewHtml || isDeploying}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            <Rocket className={`w-4 h-4 ${isDeploying ? 'animate-pulse' : ''}`} />
            {isDeploying ? "Deploying..." : "Deploy"}
          </button>
        </div>
      </div>

      {/* Deployed URL Banner */}
      {deployedUrl && (
        <div className="px-4 py-2 bg-green-500/10 border-b border-green-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-green-500">
            <Check className="w-4 h-4" />
            <span>Website live di:</span>
            <a 
              href={deployedUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-green-400"
            >
              {deployedUrl}
            </a>
          </div>
          <button
            onClick={copyDeployedUrl}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-green-500 hover:bg-green-500/10 transition-all"
          >
            <Link className="w-3 h-3" />
            Copy URL
          </button>
        </div>
      )}

      {/* Content */}
      <div className={`${isFullscreen ? 'h-[calc(100%-60px)]' : 'h-[500px]'} overflow-hidden`}>
        {activeTab === "preview" ? (
          <div className="h-full bg-white rounded-b-lg overflow-hidden">
            {previewHtml ? (
              <iframe
                srcDoc={previewHtml}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-forms"
                title="Preview"
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-muted/30">
                <div className="text-center p-8">
                  <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        Generating preview...
                      </span>
                    ) : (
                      "Preview akan ditampilkan setelah kode selesai di-generate"
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === "files" ? (
          <div className="h-full flex">
            {/* File Explorer */}
            <div className="w-64 border-r border-border/50 bg-secondary/30 overflow-hidden">
              <div className="px-3 py-2 border-b border-border/50 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Explorer
              </div>
              <FileExplorer 
                files={fileTree} 
                onSelectFile={(file) => setSelectedFile(file)}
                selectedFile={selectedFile?.name || null}
              />
            </div>
            {/* Code View */}
            <div className="flex-1 overflow-auto p-4">
              {selectedFile ? (
                <div>
                  <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{selectedFile.name}</span>
                  </div>
                  <SyntaxHighlighter
                    language={getLanguageFromFile(selectedFile)}
                    style={oneDark}
                    customStyle={{
                      margin: 0,
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                      background: "hsl(var(--secondary))",
                    }}
                    showLineNumbers
                    wrapLongLines
                  >
                    {selectedFile.content || ''}
                  </SyntaxHighlighter>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <FolderTree className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Pilih file dari explorer untuk melihat kode</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full overflow-auto p-4">
            <div className="relative">
              {isLoading && (
                <div className="absolute top-2 right-2 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Generating...
                </div>
              )}
              <SyntaxHighlighter
                language="tsx"
                style={oneDark}
                customStyle={{
                  margin: 0,
                  borderRadius: "0.5rem",
                  fontSize: "0.875rem",
                  background: "hsl(var(--secondary))",
                }}
                showLineNumbers
                wrapLongLines
              >
                {code}
              </SyntaxHighlighter>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPreview;

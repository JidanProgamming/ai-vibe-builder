import { useState } from "react";
import { ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react";

interface FileItem {
  name: string;
  type: "file" | "folder";
  content?: string;
  children?: FileItem[];
  language?: string;
}

interface FileExplorerProps {
  files: FileItem[];
  onSelectFile: (file: FileItem) => void;
  selectedFile: string | null;
}

const languageIcons: Record<string, { icon: string; color: string }> = {
  tsx: { icon: "⚛️", color: "text-blue-400" },
  ts: { icon: "🔷", color: "text-blue-500" },
  jsx: { icon: "⚛️", color: "text-yellow-400" },
  js: { icon: "🟨", color: "text-yellow-500" },
  html: { icon: "🌐", color: "text-orange-500" },
  css: { icon: "🎨", color: "text-blue-400" },
  json: { icon: "📋", color: "text-yellow-300" },
  md: { icon: "📝", color: "text-gray-400" },
  py: { icon: "🐍", color: "text-green-400" },
  sql: { icon: "🗃️", color: "text-blue-300" },
  env: { icon: "🔐", color: "text-green-500" },
};

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const langInfo = languageIcons[ext];
  
  if (langInfo) {
    return <span className={`text-sm ${langInfo.color}`}>{langInfo.icon}</span>;
  }
  
  return <span className="text-sm text-muted-foreground">📄</span>;
};

const FileTreeItem = ({ 
  item, 
  depth, 
  onSelectFile, 
  selectedFile 
}: { 
  item: FileItem; 
  depth: number; 
  onSelectFile: (file: FileItem) => void;
  selectedFile: string | null;
}) => {
  const [isOpen, setIsOpen] = useState(depth < 2);
  
  const isSelected = selectedFile === item.name;
  
  if (item.type === "folder") {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-secondary/50 rounded text-left text-sm"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          )}
          {isOpen ? (
            <FolderOpen className="w-4 h-4 text-yellow-500" />
          ) : (
            <Folder className="w-4 h-4 text-yellow-500" />
          )}
          <span className="text-foreground">{item.name}</span>
        </button>
        {isOpen && item.children && (
          <div>
            {item.children.map((child, idx) => (
              <FileTreeItem
                key={`${child.name}-${idx}`}
                item={child}
                depth={depth + 1}
                onSelectFile={onSelectFile}
                selectedFile={selectedFile}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <button
      onClick={() => onSelectFile(item)}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-left text-sm transition-colors ${
        isSelected ? "bg-primary/20 text-primary" : "hover:bg-secondary/50"
      }`}
      style={{ paddingLeft: `${depth * 12 + 24}px` }}
    >
      {getFileIcon(item.name)}
      <span>{item.name}</span>
    </button>
  );
};

const FileExplorer = ({ files, onSelectFile, selectedFile }: FileExplorerProps) => {
  return (
    <div className="h-full overflow-auto py-2">
      {files.map((item, idx) => (
        <FileTreeItem
          key={`${item.name}-${idx}`}
          item={item}
          depth={0}
          onSelectFile={onSelectFile}
          selectedFile={selectedFile}
        />
      ))}
    </div>
  );
};

export type { FileItem };
export default FileExplorer;

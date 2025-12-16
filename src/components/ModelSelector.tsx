import { Layout, Server, Check } from "lucide-react";

interface ModelSelectorProps {
  selected: "frontend" | "fullstack";
  onSelect: (model: "frontend" | "fullstack") => void;
}

const ModelSelector = ({ selected, onSelect }: ModelSelectorProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Frontend Model */}
      <button
        onClick={() => onSelect("frontend")}
        className={`group relative p-6 rounded-2xl text-left transition-all duration-300 ${
          selected === "frontend"
            ? "glass-strong glow-primary border-primary/50"
            : "glass hover:border-primary/30"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${selected === "frontend" ? "bg-primary/20" : "bg-secondary"}`}>
            <Layout className={`w-6 h-6 ${selected === "frontend" ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Frontend Model</h3>
              {selected === "frontend" && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Fokus pada UI/UX modern dan responsif
            </p>
            <ul className="space-y-2">
              {["Website Landing Page", "Dashboard UI", "Komponen React", "HTML/CSS/JS"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </button>

      {/* Fullstack Model */}
      <button
        onClick={() => onSelect("fullstack")}
        className={`group relative p-6 rounded-2xl text-left transition-all duration-300 ${
          selected === "fullstack"
            ? "glass-strong glow-accent border-accent/50"
            : "glass hover:border-accent/30"
        }`}
      >
        <div className="absolute top-4 right-4 px-2 py-1 rounded-md bg-accent/20 text-accent text-xs font-medium">
          Pro
        </div>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${selected === "fullstack" ? "bg-accent/20" : "bg-secondary"}`}>
            <Server className={`w-6 h-6 ${selected === "fullstack" ? "text-accent" : "text-muted-foreground"}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Fullstack Model</h3>
              {selected === "fullstack" && (
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                  <Check className="w-4 h-4 text-accent-foreground" />
                </div>
              )}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Aplikasi lengkap dengan backend & database
            </p>
            <ul className="space-y-2">
              {["AI Apps Generator", "SaaS & CRM", "Game Bisnis", "Auth & API"].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </button>
    </div>
  );
};

export default ModelSelector;

import { Globe, Smartphone, Gamepad2 } from "lucide-react";

interface CategorySelectorProps {
  model: "frontend" | "fullstack";
  selected: string;
  onSelect: (category: string) => void;
}

const frontendCategories = [
  { id: "landing", label: "Landing Page", icon: Globe, desc: "Website promosi produk/bisnis" },
  { id: "dashboard", label: "Dashboard", icon: Smartphone, desc: "Panel admin & analitik" },
  { id: "component", label: "Komponen", icon: Globe, desc: "UI components siap pakai" },
];

const fullstackCategories = [
  { id: "app", label: "Aplikasi Bisnis", icon: Smartphone, desc: "CRM, POS, Booking System" },
  { id: "website", label: "Website Bisnis", icon: Globe, desc: "Landing page dengan CMS" },
  { id: "game", label: "Game Promosi", icon: Gamepad2, desc: "Mini game & gamifikasi" },
];

const CategorySelector = ({ model, selected, onSelect }: CategorySelectorProps) => {
  const categories = model === "frontend" ? frontendCategories : fullstackCategories;

  return (
    <div className="grid grid-cols-3 gap-4">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selected === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className={`p-4 rounded-xl text-center transition-all duration-300 ${
              isSelected
                ? model === "frontend"
                  ? "glass-strong border-primary/50 glow-primary"
                  : "glass-strong border-accent/50 glow-accent"
                : "glass hover:border-border"
            }`}
          >
            <Icon className={`w-8 h-8 mx-auto mb-2 ${isSelected ? (model === "frontend" ? "text-primary" : "text-accent") : "text-muted-foreground"}`} />
            <div className="font-medium text-sm">{cat.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{cat.desc}</div>
          </button>
        );
      })}
    </div>
  );
};

export default CategorySelector;

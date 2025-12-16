import logo from "@/assets/logo.png";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/30">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="AI Vibe Coding" className="h-10 w-10 object-contain" />
          <span className="text-xl font-bold text-gradient">AI Vibe Coding</span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Fitur
          </a>
          <a href="#models" className="text-muted-foreground hover:text-foreground transition-colors">
            Model
          </a>
          <a href="#builder" className="text-muted-foreground hover:text-foreground transition-colors">
            Builder
          </a>
        </nav>
        <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity glow-primary">
          Mulai Gratis
        </button>
      </div>
    </header>
  );
};

export default Header;

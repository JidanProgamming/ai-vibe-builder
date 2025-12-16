import logo from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="AI Vibe Coding" className="h-8 w-8 object-contain" />
            <span className="text-lg font-bold text-gradient">AI Vibe Coding</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Tentang</a>
            <a href="#" className="hover:text-foreground transition-colors">Dokumentasi</a>
            <a href="#" className="hover:text-foreground transition-colors">Kontak</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
          </div>
          
          <div className="text-sm text-muted-foreground">
            © 2024 AI Vibe Coding. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

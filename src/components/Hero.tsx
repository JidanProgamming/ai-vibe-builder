import { Sparkles, Zap, Code2 } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse-glow delay-200" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-primary/10 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-accent/10 rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Platform AI Builder #1 untuk Bisnis</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in-up delay-100">
            Buat Aplikasi dengan
            <span className="text-gradient block mt-2">Kekuatan AI</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200">
            Transformasi ide menjadi website, aplikasi, dan game hanya dengan deskripsi teks. 
            Tanpa coding. Tanpa ribet. Langsung jadi.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <a
              href="#builder"
              className="group px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all glow-primary flex items-center gap-2"
            >
              <Zap className="w-5 h-5" />
              Mulai Generate
            </a>
            <a
              href="#features"
              className="px-8 py-4 rounded-xl glass font-semibold text-lg hover:bg-secondary/50 transition-all flex items-center gap-2"
            >
              <Code2 className="w-5 h-5" />
              Lihat Fitur
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto animate-fade-in-up delay-400">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gradient">10K+</div>
              <div className="text-sm text-muted-foreground mt-1">Proyek Dibuat</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gradient">5K+</div>
              <div className="text-sm text-muted-foreground mt-1">Pengguna Aktif</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-gradient">99%</div>
              <div className="text-sm text-muted-foreground mt-1">Kepuasan</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

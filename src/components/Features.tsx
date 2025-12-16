import { Zap, Palette, Code2, Database, Shield, Rocket } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Super Cepat",
    desc: "Generate kode dalam hitungan detik, bukan jam",
    color: "text-yellow-500",
  },
  {
    icon: Palette,
    title: "Desain Modern",
    desc: "Output UI yang cantik dan responsif",
    color: "text-pink-500",
  },
  {
    icon: Code2,
    title: "Kode Bersih",
    desc: "Hasil kode terstruktur dan mudah dipahami",
    color: "text-primary",
  },
  {
    icon: Database,
    title: "Fullstack Ready",
    desc: "Backend, database, dan API siap pakai",
    color: "text-green-500",
  },
  {
    icon: Shield,
    title: "Aman & SEO",
    desc: "Best practices keamanan dan optimasi SEO",
    color: "text-accent",
  },
  {
    icon: Rocket,
    title: "Deploy Instan",
    desc: "Langsung deploy ke hosting pilihan Anda",
    color: "text-orange-500",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Kenapa <span className="text-gradient">AI Vibe Coding?</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Platform AI builder paling powerful untuk membangun produk digital dengan cepat
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="glass p-6 rounded-2xl hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;

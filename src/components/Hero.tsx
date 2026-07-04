import { Button } from "@/components/ui/button";
import { useCategory } from "@/contexts/CategoryContext";
import techHero from "@/assets/tech-hero.jpg";
import { ArrowRight, Zap } from "lucide-react";

const Hero = () => {
  const { setSelectedCategory } = useCategory();

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-slate-950">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25"
        style={{ backgroundImage: `url(${techHero})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/20" />

      <div className="container mx-auto px-4 relative z-10 py-20">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/25 text-primary text-sm font-medium px-3 py-1.5 rounded-full mb-6">
            <Zap className="h-3.5 w-3.5" />
            Novas ofertas toda semana
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
            Tecnologia
            <br />
            <span className="text-primary">que transforma.</span>
          </h1>

          <p className="text-lg text-slate-300 mb-10 max-w-lg leading-relaxed">
            Setup gamer, smartphones de última geração, componentes e muito mais. Entrega rápida para todo o Brasil.
          </p>

          <div className="flex flex-wrap gap-3 mb-14">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-semibold"
              onClick={() => setSelectedCategory('todos')}
            >
              Ver Produtos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 hover:text-white hover:border-white/30 font-semibold bg-transparent"
              onClick={() => setSelectedCategory('gaming')}
            >
              Gaming Zone
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-6 border-t border-white/10">
            <div>
              <p className="text-2xl font-bold text-white">22+</p>
              <p className="text-sm text-slate-400">Produtos disponíveis</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-sm text-slate-400">Pagamento seguro</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">5 regiões</p>
              <p className="text-sm text-slate-400">Entrega nacional</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

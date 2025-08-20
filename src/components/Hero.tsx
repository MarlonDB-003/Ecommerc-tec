import { Button } from "@/components/ui/button";
import { useCategory } from "@/contexts/CategoryContext";
import techHero from "@/assets/tech-hero.jpg";

const Hero = () => {
  const { setSelectedCategory } = useCategory();

  const handleVerProdutos = () => {
    setSelectedCategory('todos');
    setTimeout(() => {
      document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleGamingZone = () => {
    setSelectedCategory('gaming');
    setTimeout(() => {
      document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15"
        style={{ backgroundImage: `url(${techHero})` }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary-glow/10" />
      
      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 text-center">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-primary-glow bg-clip-text text-transparent leading-tight">
          Tecnologia
          <br />
          <span className="text-primary">de Ponta</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
          Os melhores produtos eletrônicos, gaming e componentes para você montar o setup dos seus sonhos.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl"
            onClick={handleVerProdutos}
          >
            Ver Produtos
          </Button>
          <Button 
            variant="outline" 
            size="lg" 
            className="text-lg px-8 py-6 border-2 hover:bg-primary/5 transition-all duration-300"
            onClick={handleGamingZone}
          >
            Gaming Zone
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
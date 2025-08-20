import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { useCategory } from "@/contexts/CategoryContext";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const { setSelectedCategory } = useCategory();
  const navigate = useNavigate();

  const handleCategoryClick = (category: 'smartphones' | 'gaming' | 'computadores' | 'componentes') => {
    setSelectedCategory(category);
    navigate('/');
    setTimeout(() => {
      const productSection = document.getElementById('produtos');
      productSection?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <footer className="bg-background border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              TechWorld
            </h3>
            <p className="text-muted-foreground">
              Sua loja especializada em produtos eletrônicos, gaming e componentes tecnológicos de última geração.
            </p>
            <div className="flex space-x-4">
              <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <button 
                  onClick={() => handleCategoryClick('smartphones')} 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Smartphones
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleCategoryClick('gaming')} 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Gaming
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleCategoryClick('computadores')} 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Computadores
                </button>
              </li>
              <li>
                <button 
                  onClick={() => handleCategoryClick('componentes')} 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Componentes
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Atendimento</h4>
            <ul className="space-y-2">
              <li><a href="/central-ajuda" className="text-muted-foreground hover:text-primary transition-colors">Central de Ajuda</a></li>
              <li><a href="/politica-devolucao" className="text-muted-foreground hover:text-primary transition-colors">Política de Devolução</a></li>
              <li><a href="/frete-entrega" className="text-muted-foreground hover:text-primary transition-colors">Frete e Entrega</a></li>
              <li><a href="/contato" className="text-muted-foreground hover:text-primary transition-colors">Contato</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">contato@techworld.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">(11) 9999-9999</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">São Paulo, SP</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            © 2024 TechWorld. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
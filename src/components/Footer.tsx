import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { useCategory } from "@/contexts/CategoryContext";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const { setSelectedCategory } = useCategory();
  const navigate = useNavigate();

  const handleCategoryClick = (category: 'smartphones' | 'gaming' | 'consoles' | 'componentes') => {
    setSelectedCategory(category);
    navigate('/');
    setTimeout(() => {
      const productSection = document.getElementById('produtos');
      productSection?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          <div className="space-y-4">
            <h3 className="text-2xl font-black tracking-tight text-white">
              Tech<span className="text-primary">World</span>
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Sua loja especializada em produtos eletrônicos, gaming e componentes tecnológicos de última geração.
            </p>
            <div className="flex space-x-4">
              <Instagram className="h-5 w-5 text-slate-500 hover:text-white cursor-pointer transition-colors" />
              <Facebook className="h-5 w-5 text-slate-500 hover:text-white cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-slate-500 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-white">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleCategoryClick('smartphones')}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Smartphones
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('gaming')}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Gaming
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('consoles')}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Consoles
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleCategoryClick('componentes')}
                  className="text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Componentes
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-white">Atendimento</h4>
            <ul className="space-y-2">
              <li><a href="/central-ajuda" className="text-slate-400 hover:text-white transition-colors text-sm">Central de Ajuda</a></li>
              <li><a href="/politica-devolucao" className="text-slate-400 hover:text-white transition-colors text-sm">Política de Devolução</a></li>
              <li><a href="/frete-entrega" className="text-slate-400 hover:text-white transition-colors text-sm">Frete e Entrega</a></li>
              <li><a href="/contato" className="text-slate-400 hover:text-white transition-colors text-sm">Contato</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-white">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                <span className="text-slate-400 text-sm">contato@techworld.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-slate-500 shrink-0" />
                <span className="text-slate-400 text-sm">(92) 99999-9999</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-slate-500 shrink-0" />
                <span className="text-slate-400 text-sm">Itacoatiara, AM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-slate-500 text-sm">
            © 2025 TechWorld. Todos os direitos reservados.
          </p>
          <p className="text-slate-600 text-xs">
            Pagamentos seguros · Compra protegida
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

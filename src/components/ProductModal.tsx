import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Heart, Star, ShoppingCart, Truck, Shield, RotateCcw, User } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import CheckoutModal from "./CheckoutModal";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  isOnSale?: boolean;
  description?: string;
}

interface ProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductModal = ({ product, isOpen, onClose }: ProductModalProps) => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [specifications, setSpecifications] = useState<Array<{label: string, value: string}>>([]);
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  useEffect(() => {
    if (product && isOpen) {
      fetchSpecifications();
    }
  }, [product, isOpen]);

  const fetchSpecifications = async () => {
    if (!product) return;
    
    try {
      const { data, error } = await supabase
        .from('product_specifications')
        .select('label, value')
        .eq('product_id', product.id)
        .order('display_order');

      if (error) throw error;
      setSpecifications(data || []);
    } catch (error) {
      console.error('Error fetching specifications:', error);
      // Fallback to static specs if fetch fails
      setSpecifications(getProductSpecs(product.name));
    }
  };

  if (!product) return null;

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const reviews = getProductReviews(product.name);
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image
    });
    
    toast({
      title: "Produto adicionado!",
      description: `${product.name} foi adicionado ao carrinho`,
    });
  };

  const handleBuyNow = () => {
    setIsCheckoutOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {product.name}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-lg bg-muted/20">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-96 object-cover"
              />
              {product.isOnSale && (
                <Badge className="absolute top-4 left-4 bg-sale text-white">
                  -{discount}% OFF
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm hover:bg-background/90"
              >
                <Heart className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Product Features */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Truck className="h-4 w-4" />
                <span>Entrega grátis para todo o Amazonas</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Garantia de 12 meses</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RotateCcw className="h-4 w-4" />
                <span>Troca gratuita em 30 dias</span>
              </div>
            </div>
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${i < product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating}/5 ({product.reviews} avaliações)
              </span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-price">
                  R$ {product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    R$ {product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              {product.isOnSale && (
                <p className="text-sm text-green-600 font-medium">
                  Você economiza R$ {((product.originalPrice || 0) - product.price).toFixed(2)}
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                ou 12x de R$ {(product.price / 12).toFixed(2)} sem juros
              </p>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Sobre o produto</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || getProductDescription(product.name)}
              </p>
            </div>

            {/* Specifications */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Especificações</h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                {specifications.length > 0 ? (
                  specifications.map((spec, index) => (
                    <div key={index} className="flex justify-between py-2 border-b border-muted/30">
                      <span className="font-medium">{spec.label}:</span>
                      <span className="text-muted-foreground">{spec.value}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma especificação cadastrada.</p>
                )}
              </div>
            </div>

            {/* Customer Reviews */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Avaliações dos Clientes</h3>
              <div className="space-y-4">
                {displayedReviews.map((review, index) => (
                  <div key={index} className="border border-muted/30 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{review.name}</p>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))}
                
                {reviews.length > 3 && (
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="w-full"
                  >
                    {showAllReviews ? 'Ver Menos Avaliações' : `Ver Todas as ${reviews.length} Avaliações`}
                  </Button>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <Button 
                onClick={handleAddToCart}
                className="w-full h-12 bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary transition-all duration-300"
                size="lg"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Adicionar ao Carrinho
              </Button>
              <Button 
                onClick={handleBuyNow}
                variant="outline"
                className="w-full h-12"
                size="lg"
              >
                Comprar Agora
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
      
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => {
          setIsCheckoutOpen(false);
          onClose(); // Fecha o modal do produto quando o checkout for finalizado
        }}
        onBack={() => {
          setIsCheckoutOpen(false);
          // Mantém o modal do produto aberto
        }}
        singleProduct={product}
        includeCartItems={true} // Inclui os itens do carrinho junto com o produto
      />
    </Dialog>
  );
};

// Helper functions for dynamic content
const getProductDescription = (name: string): string => {
  if (name.includes("iPhone")) {
    return "O iPhone 15 Pro Max redefine o que é possível em um smartphone. Com o chip A17 Pro revolucionário, sistema de câmeras profissionais e design em titânio premium, oferece performance excepcional para todas as suas necessidades.";
  }
  if (name.includes("Notebook") || name.includes("Gaming")) {
    return "Notebook gamer de alta performance equipado com placa de vídeo RTX 4070, processador Intel de última geração e tela de alta taxa de atualização. Ideal para jogos, criação de conteúdo e trabalho profissional.";
  }
  if (name.includes("RTX") || name.includes("Placa de Vídeo")) {
    return "Placa de vídeo de última geração com arquitetura Ada Lovelace, ray tracing em tempo real e DLSS 3. Performance excepcional para jogos 4K e aplicações profissionais de renderização.";
  }
  if (name.includes("iPad")) {
    return "iPad Pro com chip M2, tela Liquid Retina XDR de 12.9 polegadas e compatibilidade com Apple Pencil. Perfeito para criatividade, produtividade e entretenimento.";
  }
  return "Produto eletrônico de alta qualidade com tecnologia avançada e design premium. Desenvolvido para oferecer a melhor experiência em sua categoria.";
};

const getProductSpecs = (name: string) => {
  if (name.includes("iPhone")) {
    return [
      { label: "Tela", value: "6.7\" Super Retina XDR" },
      { label: "Chip", value: "A17 Pro" },
      { label: "Armazenamento", value: "256GB" },
      { label: "Câmera", value: "48MP Principal + 12MP Ultra-angular" },
      { label: "Bateria", value: "Até 29h de vídeo" }
    ];
  }
  if (name.includes("Notebook")) {
    return [
      { label: "Processador", value: "Intel Core i7-13700H" },
      { label: "Placa de Vídeo", value: "NVIDIA RTX 4070 8GB" },
      { label: "Memória RAM", value: "16GB DDR5" },
      { label: "Armazenamento", value: "1TB SSD NVMe" },
      { label: "Tela", value: "15.6\" 144Hz Full HD" }
    ];
  }
  if (name.includes("RTX")) {
    return [
      { label: "GPU", value: "NVIDIA GeForce RTX 4080" },
      { label: "Memória", value: "16GB GDDR6X" },
      { label: "Interface", value: "PCIe 4.0" },
      { label: "Ray Tracing", value: "Sim, 3ª geração" },
      { label: "DLSS", value: "DLSS 3 com Frame Generation" }
    ];
  }
  return [
    { label: "Marca", value: "Premium Tech" },
    { label: "Modelo", value: "Série Pro" },
    { label: "Garantia", value: "12 meses" },
    { label: "Origem", value: "Nacional" }
  ];
};

const getProductReviews = (name: string) => {
  const baseReviews = [
    {
      name: "João Silva",
      rating: 5,
      date: "15/01/2025",
      comment: "Produto excepcional! Superou todas as minhas expectativas. A qualidade é impressionante e o desempenho é exatamente o que eu esperava. Recomendo muito!"
    },
    {
      name: "Maria Santos",
      rating: 4,
      date: "12/01/2025", 
      comment: "Muito bom produto, entrega rápida e bem embalado. Único ponto negativo é que poderia vir com mais acessórios inclusos, mas no geral estou satisfeita."
    },
    {
      name: "Carlos Oliveira",
      rating: 5,
      date: "10/01/2025",
      comment: "Compra perfeita! O produto chegou antes do prazo e está funcionando perfeitamente. Atendimento da loja também foi excelente. Com certeza comprarei novamente."
    },
    {
      name: "Ana Costa",
      rating: 4,
      date: "08/01/2025",
      comment: "Produto de qualidade, mas o preço poderia ser um pouco mais acessível. No entanto, vale o investimento pela durabilidade e performance oferecidas."
    },
    {
      name: "Pedro Ferreira",
      rating: 5,
      date: "05/01/2025",
      comment: "Simplesmente perfeito! Já é minha segunda compra nesta loja e sempre me surpreendo positivamente. Produtos originais e de alta qualidade."
    },
    {
      name: "Lucia Almeida",
      rating: 3,
      date: "03/01/2025",
      comment: "Produto ok, mas esperava um pouco mais pela fama. Funciona bem, mas não é tão impressionante quanto outros usuários comentaram. Talvez minhas expectativas estavam muito altas."
    },
    {
      name: "Roberto Lima",
      rating: 5,
      date: "01/01/2025",
      comment: "Excelente custo-benefício! Produto chegou rapidamente e em perfeitas condições. A qualidade de construção é sólida e o desempenho atende perfeitamente."
    }
  ];

  if (name.includes("iPhone")) {
    return [
      ...baseReviews.slice(0, 3),
      {
        name: "Felipe Tech",
        rating: 5,
        date: "20/01/2025",
        comment: "O melhor iPhone que já tive! A câmera é incrível, a bateria dura o dia todo e o desempenho é impressionante. Vale cada centavo investido."
      },
      {
        name: "Camila Rodrigues",
        rating: 4,
        date: "18/01/2025",
        comment: "iPhone excelente, mas senti falta de mais opções de cor. A qualidade da tela e das fotos é realmente superior. Recomendo!"
      }
    ];
  }

  if (name.includes("Notebook") || name.includes("Gaming")) {
    return [
      ...baseReviews.slice(0, 3),
      {
        name: "Gamer Pro",
        rating: 5,
        date: "22/01/2025",
        comment: "Notebook gamer perfeito! Roda todos os jogos no ultra sem travamentos. A tela de 144Hz faz toda a diferença na experiência de jogo."
      },
      {
        name: "Designer Carol",
        rating: 5,
        date: "19/01/2025",
        comment: "Uso para design gráfico e renderização. Performance excelente, nunca trava e o processamento é muito rápido. Investimento que valeu a pena."
      }
    ];
  }

  return baseReviews;
};

export default ProductModal;
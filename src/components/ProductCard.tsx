import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  isOnSale?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  reviews,
  isOnSale = false,
  compact = false,
  onClick
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id,
      name,
      price,
      originalPrice,
      image
    });
    
    toast({
      title: "Produto adicionado!",
      description: `${name} foi adicionado ao carrinho`,
    });
  };
  if (compact) {
    return (
      <Card className="group overflow-hidden border border-border/50 shadow-sm hover:shadow-md transition-all duration-200 bg-card cursor-pointer h-full flex flex-col" onClick={onClick}>
        <div className="relative overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {isOnSale && (
            <div className="absolute top-2 left-2 bg-sale text-white px-1.5 py-0.5 rounded text-[10px] font-semibold">
              OFERTA
            </div>
          )}
        </div>

        <CardContent className="p-2 flex flex-col flex-1">
          <div className="flex items-center gap-0.5 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
            ))}
            <span className="text-[10px] text-muted-foreground ml-1">({reviews})</span>
          </div>

          <h3 className="font-medium text-xs text-card-foreground mb-1.5 line-clamp-2 group-hover:text-primary transition-colors leading-tight flex-1">
            {name}
          </h3>

          <div className="mb-2">
            {originalPrice && (
              <span className="text-[10px] text-muted-foreground line-through block">
                R$ {originalPrice.toFixed(2)}
              </span>
            )}
            <span className="text-sm font-bold text-price">
              R$ {price.toFixed(2)}
            </span>
          </div>

          <Button
            onClick={handleAddToCart}
            className="w-full text-[10px] bg-primary hover:bg-primary/90"
            size="sm"
            style={{ height: '28px', padding: '0 8px' }}
          >
            Adicionar ao Carrinho
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-card cursor-pointer" onClick={onClick}>
      <div className="relative overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-48 sm:h-56 lg:h-64 object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Sale Badge */}
        {isOnSale && (
          <div className="absolute top-3 left-3 bg-sale text-white px-2 py-1 rounded-full text-xs font-semibold">
            OFERTA
          </div>
        )}

      </div>

      <CardContent className="p-3 sm:p-4">
        <h3 className="font-semibold text-sm sm:text-base text-card-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {name}
        </h3>

        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <span className="text-lg sm:text-xl font-bold text-price">
            R$ {price.toFixed(2)}
          </span>
          {originalPrice && (
            <span className="text-xs sm:text-sm text-muted-foreground line-through">
              R$ {originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        <Button
          onClick={handleAddToCart}
          className="w-full text-xs sm:text-sm bg-primary hover:bg-primary/90"
          size="sm"
        >
          <span className="hidden sm:inline">Adicionar ao Carrinho</span>
          <span className="sm:hidden">Adicionar</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";
import { supabase } from "@/integrations/supabase/client";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
  is_active: boolean;
  discount_percentage: number;
  created_at: string;
}

interface ProductCarouselProps {
  title: string;
  description: string;
  type: 'discounts' | 'recent' | 'gaming';
}

const ProductCarousel = ({ title, description, type }: ProductCarouselProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [type]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      switch (type) {
        case 'discounts':
          query = query.gt('discount_percentage', 0).order('discount_percentage', { ascending: false });
          break;
        case 'recent':
          query = query.order('created_at', { ascending: false });
          break;
        case 'gaming':
          query = query.eq('category', 'gaming').order('created_at', { ascending: false });
          break;
      }

      const { data, error } = await query.limit(10);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const transformProduct = (product: Product) => {
    const priceWithDiscount = product.discount_percentage > 0 
      ? product.price * (1 - product.discount_percentage / 100)
      : product.price;
    
    return {
      id: product.id,
      name: product.name,
      price: priceWithDiscount,
      originalPrice: product.discount_percentage > 0 ? product.price : undefined,
      image: product.image_url,
      rating: 5,
      reviews: Math.floor(Math.random() * 500) + 50,
      isOnSale: product.discount_percentage > 0,
      category: product.category,
      description: product.description,
      stock: product.stock
    };
  };

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando produtos...</p>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{title}</h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhum produto encontrado.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-card/50 border-y">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {products.map((product) => (
              <CarouselItem key={product.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3">
                <ProductCard
                  {...transformProduct(product)}
                  onClick={() => handleProductClick(product)}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background border shadow-lg backdrop-blur-sm" />
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/80 hover:bg-background border shadow-lg backdrop-blur-sm" />
        </Carousel>
      </div>
      
      <ProductModal 
        product={selectedProduct ? transformProduct(selectedProduct) : null}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </section>
  );
};

export default ProductCarousel;
import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";
import { productService, ProductListItem } from "@/services/productService";

interface ProductCarouselProps {
  title: string;
  description: string;
  type: 'discounts' | 'recent' | 'gaming';
}

const ProductCarousel = ({ title, description, type }: ProductCarouselProps) => {
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ProductListItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, [type]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getFeatured(type, 10);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching featured products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductClick = (product: ProductListItem) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const transformProduct = (product: ProductListItem) => ({
    id: product.id,
    name: product.name,
    price: product.discountedPrice,
    originalPrice: product.discountPercentage > 0 ? product.price : undefined,
    image: product.imageUrl ?? '',
    rating: 5,
    reviews: 128,
    isOnSale: product.discountPercentage > 0,
    category: product.category,
    description: product.description ?? undefined,
    stock: product.stock,
  });

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
    <section className="py-10">
      <div className="container mx-auto px-8">
        <div className="mb-6 flex items-end gap-4">
          <div className="border-l-4 border-primary pl-4">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">{title}</h2>
            <p className="text-muted-foreground text-sm mt-0.5">{description}</p>
          </div>
        </div>

        <div className="relative">
          <Carousel
            opts={{ align: "start", loop: true }}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
              {products.map((product) => (
                <CarouselItem key={product.id} className="pl-2 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5">
                  <ProductCard
                    {...transformProduct(product)}
                    compact
                    onClick={() => handleProductClick(product)}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-background border shadow-md" />
            <CarouselNext className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-background border shadow-md" />
          </Carousel>
        </div>
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

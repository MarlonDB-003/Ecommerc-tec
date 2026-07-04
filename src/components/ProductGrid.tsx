import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";
import { useCategory } from "@/contexts/CategoryContext";
import { useSearch } from "@/contexts/SearchContext";
import { productService, ProductListItem } from "@/services/productService";

const ProductGrid = () => {
  const [selectedProduct, setSelectedProduct] = useState<ProductListItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedCategory } = useCategory();
  const { searchQuery } = useSearch();

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      setShowAllProducts(false);
      const result = await productService.getAll({
        category: selectedCategory,
        search: searchQuery || undefined,
        isActive: true,
        pageSize: 100,
      });
      setProducts(result.items);
    } catch (error) {
      console.error('Error fetching products:', error);
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
      <section id="produtos" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Carregando produtos...</p>
          </div>
        </div>
      </section>
    );
  }

  const displayedProducts = showAllProducts ? products : products.slice(0, 12);
  const hasMoreProducts = products.length > 12;

  const getCategoryTitle = () => {
    if (searchQuery) return `Resultados para "${searchQuery}"`;
    switch (selectedCategory) {
      case 'smartphones': return 'Smartphones & Tablets';
      case 'gaming': return 'Gaming Zone';
      case 'consoles': return 'Consoles';
      case 'componentes': return 'Componentes & Acessórios';
      case 'computadores': return 'Computadores & Notebooks';
      default: return 'Produtos em Destaque';
    }
  };

  const getCategoryDescription = () => {
    if (searchQuery) {
      return `Encontrados ${products.length} produto(s) relacionado(s) à sua busca.`;
    }
    const base = (() => {
      switch (selectedCategory) {
        case 'smartphones': return 'Os melhores smartphones, tablets e acessórios móveis do mercado.';
        case 'gaming': return 'Computadores, notebooks e equipamentos gaming profissionais para uma experiência única.';
        case 'consoles': return 'Consoles Xbox, PlayStation e outros videogames para sua diversão.';
        case 'componentes': return 'Mouse, teclados, gabinetes, placas de vídeo e componentes para seu setup.';
        case 'computadores': return 'Notebooks e desktops de alta performance para trabalho e entretenimento.';
        default: return 'Descubra os melhores produtos eletrônicos, gaming e componentes para tecnologia de ponta.';
      }
    })();
    if (showAllProducts || products.length <= 12) {
      return `${base} Exibindo todos os ${products.length} produtos.`;
    }
    return `${base} Exibindo ${displayedProducts.length} de ${products.length} produtos.`;
  };

  return (
    <section id="produtos" className="py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            {getCategoryTitle()}
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            {getCategoryDescription()}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...transformProduct(product)}
              compact
              onClick={() => handleProductClick(product)}
            />
          ))}
        </div>

        {displayedProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              {searchQuery
                ? `Nenhum produto encontrado para "${searchQuery}".`
                : 'Nenhum produto encontrado nesta categoria.'}
            </p>
          </div>
        )}

        {!searchQuery && hasMoreProducts && (
          <div className="text-center mt-6">
            {!showAllProducts ? (
              <Button
                onClick={() => setShowAllProducts(true)}
                className="px-8 py-3 font-semibold"
                variant="outline"
              >
                Ver Todos os Produtos ({products.length})
              </Button>
            ) : (
              <Button
                onClick={() => setShowAllProducts(false)}
                className="px-8 py-3 font-semibold"
                variant="outline"
              >
                Ver Menos Produtos
              </Button>
            )}
          </div>
        )}
      </div>

      <ProductModal
        product={selectedProduct ? transformProduct(selectedProduct) : null}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </section>
  );
};

export default ProductGrid;

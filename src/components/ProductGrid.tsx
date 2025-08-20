import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";
import { useCategory } from "@/contexts/CategoryContext";
import { useSearch } from "@/contexts/SearchContext";
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
}

const ProductGrid = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedCategory } = useCategory();
  const { searchQuery } = useSearch();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

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

  // Converter produto do banco para formato do componente
  const transformProduct = (product: Product) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    originalPrice: product.discount_percentage > 0 ? product.price / (1 - product.discount_percentage / 100) : undefined,
    image: product.image_url,
    rating: 5, // Default rating
    reviews: Math.floor(Math.random() * 500) + 50, // Random reviews for demo
    isOnSale: product.discount_percentage > 0,
    category: product.category,
    description: product.description,
    stock: product.stock
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

  // Filtrar produtos por categoria e busca
  const filteredProducts = products.filter(product => {
    // Filtro por categoria
    const matchesCategory = selectedCategory === 'todos' || product.category === selectedCategory;
    
    // Filtro por busca (nome do produto)
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Limitar produtos exibidos (12 inicialmente, ou todos se showAllProducts for true, ou todos se houver busca)
  const displayedProducts = searchQuery || showAllProducts 
    ? filteredProducts 
    : filteredProducts.slice(0, 12);

  const hasMoreProducts = filteredProducts.length > 12;

  // Texto dinâmico baseado na categoria e busca
  const getCategoryTitle = () => {
    if (searchQuery) {
      return `Resultados para "${searchQuery}"`;
    }
    
    switch (selectedCategory) {
      case 'smartphones': return 'Smartphones & Tablets';
      case 'gaming': return 'Produtos Gaming';
      case 'computadores': return 'Computadores & Notebooks';
      case 'componentes': return 'Componentes de Hardware';
      default: return 'Produtos em Destaque';
    }
  };

  const getCategoryDescription = () => {
    if (searchQuery) {
      return `Encontrados ${filteredProducts.length} produto(s) relacionado(s) à sua busca.`;
    }
    
    const totalProducts = filteredProducts.length;
    const displayedCount = displayedProducts.length;
    const categoryDescription = (() => {
      switch (selectedCategory) {
        case 'smartphones': return 'Os melhores smartphones, tablets e acessórios móveis do mercado.';
        case 'gaming': return 'Equipamentos gaming profissionais para uma experiência única.';
        case 'computadores': return 'Notebooks e desktops para trabalho e entretenimento.';
        case 'componentes': return 'Componentes de hardware para montagem e upgrade de PCs.';
        default: return 'Descubra os melhores produtos eletrônicos, gaming e componentes para tecnologia de ponta.';
      }
    })();

    if (showAllProducts || totalProducts <= 12) {
      return `${categoryDescription} Exibindo todos os ${totalProducts} produtos.`;
    } else {
      return `${categoryDescription} Exibindo ${displayedCount} de ${totalProducts} produtos.`;
    }
  };

  return (
    <section id="produtos" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            {getCategoryTitle()}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {getCategoryDescription()}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              {...transformProduct(product)}
              onClick={() => handleProductClick(product)}
            />
          ))}
        </div>

        {displayedProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">
              {searchQuery 
                ? `Nenhum produto encontrado para "${searchQuery}".`
                : 'Nenhum produto encontrado nesta categoria.'
              }
            </p>
          </div>
        )}
        
        {/* Botões de Ver Todos / Ver Menos */}
        {!searchQuery && hasMoreProducts && (
          <div className="text-center mt-12">
            {!showAllProducts ? (
              <Button 
                onClick={() => setShowAllProducts(true)}
                className="px-8 py-3 font-semibold"
                variant="outline"
              >
                Ver Todos os Produtos ({filteredProducts.length})
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
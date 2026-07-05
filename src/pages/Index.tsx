import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductCarousel from "@/components/ProductCarousel";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import { useCategory } from "@/contexts/CategoryContext";

const Index = () => {
  const { selectedCategory } = useCategory();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        {selectedCategory === 'todos' ? (
          <div className="divide-y divide-border">
            <ProductCarousel
              title="Ofertas Imperdíveis"
              description="Os produtos com os melhores descontos para você economizar mais!"
              type="discounts"
            />
            <ProductCarousel
              title="Lançamentos Recentes"
              description="Os últimos produtos cadastrados em nossa loja."
              type="recent"
            />
            <ProductCarousel
              title="Gaming Zone"
              description="Equipamentos gaming profissionais para uma experiência única."
              type="gaming"
            />
          </div>
        ) : (
          <ProductGrid />
        )}
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Index;
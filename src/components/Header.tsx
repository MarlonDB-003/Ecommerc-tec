import { useState } from "react";
import { ShoppingCart, Search, User, Menu, X, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/CartContext";
import { useCategory } from "@/contexts/CategoryContext";
import { useSearch } from "@/contexts/SearchContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import CartModal from "./CartModal";
import ThemeToggle from "./ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  const { selectedCategory, setSelectedCategory } = useCategory();
  const { searchQuery, setSearchQuery } = useSearch();
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (category: 'todos' | 'smartphones' | 'gaming' | 'computadores' | 'componentes') => {
    navigate('/');
    setSelectedCategory(category);
    setIsMobileMenuOpen(false); // Fechar menu mobile após navegação
    
    // Scroll para a seção correspondente após um pequeno delay para garantir que a navegação foi processada
    setTimeout(() => {
      if (category === 'todos') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const produtosSection = document.getElementById('produtos');
        if (produtosSection) {
          produtosSection.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }, 100);
  };
  return (
    <header className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <button onClick={() => handleNavigation('todos')}>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent hover:opacity-80 transition-opacity">
              TechWorld
            </h1>
          </button>
        </div>

        {/* Navigation - Hidden on mobile */}
        <nav className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => handleNavigation('todos')}
            className={`transition-colors ${selectedCategory === 'todos' ? 'text-primary' : 'text-foreground hover:text-primary'}`}
          >
            Início
          </button>
          <button 
            onClick={() => handleNavigation('smartphones')}
            className={`transition-colors ${selectedCategory === 'smartphones' ? 'text-primary' : 'text-foreground hover:text-primary'}`}
          >
            Smartphones
          </button>
          <button 
            onClick={() => handleNavigation('gaming')}
            className={`transition-colors ${selectedCategory === 'gaming' ? 'text-primary' : 'text-foreground hover:text-primary'}`}
          >
            Gaming
          </button>
          <button 
            onClick={() => handleNavigation('computadores')}
            className={`transition-colors ${selectedCategory === 'computadores' ? 'text-primary' : 'text-foreground hover:text-primary'}`}
          >
            Computadores
          </button>
          <button 
            onClick={() => handleNavigation('componentes')}
            className={`transition-colors ${selectedCategory === 'componentes' ? 'text-primary' : 'text-foreground hover:text-primary'}`}
          >
            Componentes
          </button>
        </nav>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b border-border p-4 z-40">
            <div className="container mx-auto px-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar produtos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-10"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-background border-b border-border p-4 z-40 md:hidden">
            <div className="container mx-auto px-4">
              <div className="space-y-4">
                {/* Mobile Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Pesquisar produtos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Mobile Navigation */}
                <nav className="space-y-2">
                  <button 
                    onClick={() => handleNavigation('todos')}
                    className={`block w-full text-left py-2 px-3 rounded-md transition-colors ${selectedCategory === 'todos' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
                  >
                    Início
                  </button>
                  <button 
                    onClick={() => handleNavigation('smartphones')}
                    className={`block w-full text-left py-2 px-3 rounded-md transition-colors ${selectedCategory === 'smartphones' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
                  >
                    Smartphones
                  </button>
                  <button 
                    onClick={() => handleNavigation('gaming')}
                    className={`block w-full text-left py-2 px-3 rounded-md transition-colors ${selectedCategory === 'gaming' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
                  >
                    Gaming
                  </button>
                  <button 
                    onClick={() => handleNavigation('computadores')}
                    className={`block w-full text-left py-2 px-3 rounded-md transition-colors ${selectedCategory === 'computadores' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
                  >
                    Computadores
                  </button>
                  <button 
                    onClick={() => handleNavigation('componentes')}
                    className={`block w-full text-left py-2 px-3 rounded-md transition-colors ${selectedCategory === 'componentes' ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
                  >
                    Componentes
                  </button>
                </nav>
                
                {/* Mobile User Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  {user ? (
                    <div className="space-y-2">
                      {isAdmin && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center gap-2 w-full justify-start"
                          onClick={() => {
                            navigate('/admin');
                            setIsMobileMenuOpen(false);
                          }}
                        >
                          <Shield className="h-4 w-4" />
                          Painel Admin
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="flex items-center gap-2 w-full justify-start"
                        onClick={() => {
                          signOut();
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        Sair
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="flex items-center gap-2"
                      onClick={() => {
                        navigate('/auth');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <User className="h-4 w-4" />
                      Entrar
                    </Button>
                  )}
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden sm:flex"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="h-5 w-5" />
          </Button>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hidden sm:flex">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin')}>
                    <Shield className="mr-2 h-4 w-4" />
                    Painel Admin
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden sm:flex"
              onClick={() => navigate('/auth')}
            >
              <User className="h-5 w-5" />
            </Button>
          )}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          {/* Cart Icon */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
            onClick={() => setIsCartOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {getTotalItems() > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground"
              >
                {getTotalItems()}
              </Badge>
            )}
          </Button>
          {/* Mobile Menu Button */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>
      
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Header;
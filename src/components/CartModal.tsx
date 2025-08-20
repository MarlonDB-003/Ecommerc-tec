import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Trash2, Plus, Minus, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import CheckoutModal from "./CheckoutModal";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal = ({ isOpen, onClose }: CartModalProps) => {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart();
  const { toast } = useToast();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const handleRemoveItem = (id: string, name: string) => {
    removeFromCart(id);
    toast({
      title: "Produto removido",
      description: `${name} foi removido do carrinho`,
    });
  };

  const handleQuantityChange = (id: string, newQuantity: number) => {
    updateQuantity(id, newQuantity);
  };

  const handleClearCart = () => {
    clearCart();
    toast({
      title: "Carrinho limpo",
      description: "Todos os produtos foram removidos do carrinho",
    });
  };

  const handleCheckout = () => {
    onClose();
    setIsCheckoutOpen(true);
  };

  if (items.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Carrinho de Compras
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Seu carrinho está vazio</h3>
            <p className="text-muted-foreground mb-6">
              Adicione alguns produtos incríveis ao seu carrinho!
            </p>
            <Button onClick={onClose}>
              Continuar Comprando
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Carrinho de Compras ({items.length} {items.length === 1 ? 'item' : 'itens'})
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 border border-muted/30 rounded-lg">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg"
              />
              
              <div className="flex-1 space-y-1">
                <h3 className="font-semibold text-sm">{item.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-price">
                    R$ {item.price.toFixed(2)}
                  </span>
                  {item.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      R$ {item.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="h-8 w-8"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                <span className="w-12 text-center font-semibold">
                  {item.quantity}
                </span>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  className="h-8 w-8"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="text-right">
                <p className="font-bold">
                  R$ {(item.price * item.quantity).toFixed(2)}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(item.id, item.name)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 mt-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="border-t border-muted/30 pt-4 space-y-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total:</span>
            <span className="text-price">R$ {getTotalPrice().toFixed(2)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={onClose}>
              Continuar Comprando
            </Button>
            <Button 
              onClick={handleCheckout}
              className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary"
            >
              Finalizar Compra
            </Button>
          </div>
        </div>
      </DialogContent>
      
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)}
        onBack={() => {
          setIsCheckoutOpen(false);
          // Não abre o carrinho novamente automaticamente
        }}
      />
    </Dialog>
  );
};

export default CartModal;
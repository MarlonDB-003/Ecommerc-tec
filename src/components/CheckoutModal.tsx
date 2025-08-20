import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Smartphone, QrCode, ArrowLeft, Lock, Calendar } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
  singleProduct?: Product; // Para comprar apenas um produto específico
  includeCartItems?: boolean; // Para incluir os itens do carrinho junto com o produto único
}

const CheckoutModal = ({ isOpen, onClose, onBack, singleProduct, includeCartItems = false }: CheckoutModalProps) => {
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [installments, setInstallments] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [addressInfo, setAddressInfo] = useState({
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    country: "Brasil"
  });
  const { items, getTotalPrice, clearCart } = useCart();
  const { toast } = useToast();

  // Função para buscar CEP
  const fetchAddressFromCEP = async (cep: string) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setAddressInfo(prev => ({
          ...prev,
          street: data.logradouro,
          neighborhood: data.bairro,
          city: data.localidade,
          state: data.uf,
        }));
        toast({
          title: "CEP encontrado!",
          description: "Endereço preenchido automaticamente.",
        });
      } else {
        toast({
          title: "CEP não encontrado",
          description: "Verifique o CEP informado.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast({
        title: "Erro ao buscar CEP",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  // Função para formatar CEP
  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) {
      return numbers;
    }
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  // Handler para mudança do CEP
  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCEP = formatCEP(e.target.value);
    setAddressInfo({...addressInfo, cep: formattedCEP});
    
    // Busca automaticamente quando o CEP estiver completo
    const cleanCEP = formattedCEP.replace(/\D/g, '');
    if (cleanCEP.length === 8) {
      fetchAddressFromCEP(cleanCEP);
    }
  };

  // Determina quais itens mostrar no checkout
  const getCheckoutItems = () => {
    if (singleProduct && includeCartItems) {
      // Produto específico + itens do carrinho
      const singleProductItem = { ...singleProduct, quantity: 1 };
      // Verifica se o produto já está no carrinho para evitar duplicação
      const productInCart = items.find(item => item.id === singleProduct.id);
      
      if (productInCart) {
        // Se já está no carrinho, aumenta a quantidade
        return items.map(item => 
          item.id === singleProduct.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Se não está no carrinho, adiciona junto com os outros
        return [...items, singleProductItem];
      }
    } else if (singleProduct) {
      // Apenas o produto específico
      return [{ ...singleProduct, quantity: 1 }];
    } else {
      // Apenas os itens do carrinho
      return items;
    }
  };

  const checkoutItems = getCheckoutItems();
  const totalPrice = checkoutItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleProcessPayment = () => {
    toast({
      title: "Pagamento processado! (Mock)",
      description: "Esta é apenas uma simulação. O pagamento não foi realmente processado.",
    });
    // Limpa o carrinho se incluir itens do carrinho ou se não for compra única
    if (includeCartItems || !singleProduct) {
      clearCart();
    }
    onClose();
  };

  const paymentMethods = [
    {
      id: "credit-card",
      name: "Cartão de Crédito",
      icon: CreditCard,
      description: "Parcelamento em até 10x sem juros"
    },
    {
      id: "debit-card",
      name: "Cartão de Débito",
      icon: Calendar,
      description: "Pagamento à vista com desconto"
    },
    {
      id: "pix",
      name: "PIX",
      icon: QrCode,
      description: "Pagamento instantâneo"
    },
    {
      id: "boleto",
      name: "Boleto Bancário",
      icon: Smartphone,
      description: "Vencimento em 3 dias úteis"
    }
  ];

  // Função para calcular valor das parcelas
  const calculateInstallmentValue = (totalValue: number, installmentCount: number) => {
    return totalValue / installmentCount;
  };

  // Opções de parcelamento (1x até 10x)
  const installmentOptions = Array.from({ length: 10 }, (_, index) => {
    const count = index + 1;
    const value = calculateInstallmentValue(totalPrice, count);
    return {
      count,
      value,
      label: count === 1 
        ? `À vista - R$ ${value.toFixed(2)}`
        : `${count}x de R$ ${value.toFixed(2)} sem juros`
    };
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Finalizar Compra
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Resumo do Pedido */}
          <div className="bg-muted/30 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">Resumo do Pedido</h3>
            <div className="space-y-2">
              {checkoutItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} (x{item.quantity})</span>
                  <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="flex justify-between font-bold">
              <span>Total:</span>
              <span className="text-price">R$ {totalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Informações do Cliente */}
          <div className="space-y-4">
            <h3 className="font-semibold">Informações de Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                  placeholder="seu@email.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          {/* Informações de Endereço */}
          <div className="space-y-4">
            <h3 className="font-semibold">Endereço de Entrega</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cep">CEP</Label>
                <Input
                  id="cep"
                  value={addressInfo.cep}
                  onChange={handleCEPChange}
                  placeholder="00000-000"
                  maxLength={9}
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="street">Rua/Avenida</Label>
                <Input
                  id="street"
                  value={addressInfo.street}
                  onChange={(e) => setAddressInfo({...addressInfo, street: e.target.value})}
                  placeholder="Nome da rua, avenida, etc."
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={addressInfo.number}
                  onChange={(e) => setAddressInfo({...addressInfo, number: e.target.value})}
                  placeholder="123"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  value={addressInfo.complement}
                  onChange={(e) => setAddressInfo({...addressInfo, complement: e.target.value})}
                  placeholder="Apartamento, bloco, etc. (opcional)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input
                  id="neighborhood"
                  value={addressInfo.neighborhood}
                  onChange={(e) => setAddressInfo({...addressInfo, neighborhood: e.target.value})}
                  placeholder="Nome do bairro"
                />
              </div>
              <div>
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={addressInfo.city}
                  onChange={(e) => setAddressInfo({...addressInfo, city: e.target.value})}
                  placeholder="Nome da cidade"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={addressInfo.state}
                  onChange={(e) => setAddressInfo({...addressInfo, state: e.target.value})}
                  placeholder="Ex: SP, RJ, MG"
                  maxLength={2}
                />
              </div>
              <div>
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  value={addressInfo.country}
                  onChange={(e) => setAddressInfo({...addressInfo, country: e.target.value})}
                  placeholder="Brasil"
                />
              </div>
            </div>
          </div>

          {/* Métodos de Pagamento */}
          <div className="space-y-4">
            <h3 className="font-semibold">Método de Pagamento</h3>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/20 cursor-pointer">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Icon className="h-5 w-5 text-primary" />
                    <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-muted-foreground">{method.description}</div>
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          {/* Dados do Cartão de Crédito */}
          {paymentMethod === "credit-card" && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/10">
              <h4 className="font-medium">Dados do Cartão</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="card-number">Número do Cartão</Label>
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Validade</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/AA"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="card-name">Nome no Cartão</Label>
                  <Input
                    id="card-name"
                    placeholder="Nome como está no cartão"
                  />
                </div>
              </div>
              
              {/* Opções de Parcelamento */}
              <div className="mt-6">
                <h4 className="font-medium mb-3">Parcelamento</h4>
                <RadioGroup value={installments.toString()} onValueChange={(value) => setInstallments(parseInt(value))}>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                    {installmentOptions.map((option) => (
                      <div key={option.count} className="flex items-center space-x-2 p-2 hover:bg-muted/20 rounded">
                        <RadioGroupItem value={option.count.toString()} id={`installment-${option.count}`} />
                        <Label htmlFor={`installment-${option.count}`} className="flex-1 cursor-pointer text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
            </div>
          )}

          {/* Formulário de Cartão de Débito */}
          {paymentMethod === "debit-card" && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/10">
              <h4 className="font-medium">Dados do Cartão de Débito</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="debit-card-number">Número do Cartão</Label>
                  <Input
                    id="debit-card-number"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="debit-expiry">Validade</Label>
                    <Input
                      id="debit-expiry"
                      placeholder="MM/AA"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="debit-cvv">CVV</Label>
                    <Input
                      id="debit-cvv"
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="debit-card-name">Nome no Cartão</Label>
                  <Input
                    id="debit-card-name"
                    placeholder="Nome como está no cartão"
                  />
                </div>
              </div>
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  💰 Pagamento à vista no débito. Total: <strong>R$ {totalPrice.toFixed(2)}</strong>
                </p>
              </div>
            </div>
          )}

          {/* PIX Info */}
          {paymentMethod === "pix" && (
            <div className="p-4 border rounded-lg bg-muted/10 text-center">
              <QrCode className="h-16 w-16 mx-auto mb-3 text-primary" />
              <p className="text-sm text-muted-foreground">
                Após confirmar, você receberá um QR Code para pagamento via PIX
              </p>
            </div>
          )}

          {/* Boleto Info */}
          {paymentMethod === "boleto" && (
            <div className="p-4 border rounded-lg bg-muted/10">
              <p className="text-sm text-muted-foreground">
                O boleto será gerado após a confirmação do pedido. Vencimento em 3 dias úteis.
              </p>
            </div>
          )}

          {/* Disclaimer de Mock */}
          <div className="p-3 border border-orange-200 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>⚠️ Modo de Teste:</strong> Esta é apenas uma simulação. Nenhum pagamento real será processado.
            </p>
          </div>

          {/* Botões de Ação */}
          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button variant="outline" onClick={onBack}>
              {singleProduct ? "Voltar ao Produto" : "Voltar ao Carrinho"}
            </Button>
            <Button 
              onClick={handleProcessPayment}
              className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary-glow hover:to-primary"
            >
              Confirmar Pagamento (Mock)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
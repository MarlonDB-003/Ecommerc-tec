import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard, Smartphone, QrCode, ArrowLeft, Lock,
  Calendar, User, MapPin, Truck, CheckCircle, Check, Loader2, Package, Plus,
} from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { orderService, toApiPaymentMethod } from "@/services/orderService";
import { addressService, AddressDto } from "@/services/addressService";

// ── Shipping calculation from Manaus/AM ───────────────────────────────────────

// Zone matrix based on Correios table (origin: Manaus-AM)
const UF_ZONES: Record<string, number> = {
  AM: 1,
  RR: 2, PA: 2,
  RO: 3, AC: 3, TO: 3, AP: 3, MT: 3,
  MA: 4, PI: 4, CE: 4, RN: 4, PB: 4, PE: 4, AL: 4, SE: 4, BA: 4, GO: 4, DF: 4, MS: 4,
  MG: 5, ES: 5, RJ: 5, SP: 5, PR: 5, SC: 5, RS: 5,
};

// Approximate prices per zone for ~1kg package (based on Correios 2024 table)
const ZONE_TABLE: Record<number, { pac: number; sedex: number; sedex10: number }> = {
  1: { pac: 22.50,  sedex: 42.00,  sedex10: 65.00  },
  2: { pac: 32.80,  sedex: 58.50,  sedex10: 85.00  },
  3: { pac: 42.50,  sedex: 72.00,  sedex10: 102.00 },
  4: { pac: 52.90,  sedex: 88.00,  sedex10: 125.00 },
  5: { pac: 65.40,  sedex: 105.00, sedex10: 148.00 },
};

const PAC_DAYS: Record<number, string>    = { 1: "3–5",  2: "5–7",  3: "7–10", 4: "9–13",  5: "12–17" };
const SEDEX_DAYS: Record<number, string>  = { 1: "1–2",  2: "2–3",  3: "3–4",  4: "4–6",   5: "5–8"   };

const FREE_SHIPPING_THRESHOLD = 299;

interface ShippingOption {
  id: string;
  label: string;
  detail: string;
  price: number;
  isFree?: boolean;
}

function calculateShippingOptions(uf: string, subtotal: number): ShippingOption[] {
  const zone  = UF_ZONES[uf.toUpperCase()] ?? 5;
  const rates = ZONE_TABLE[zone];
  const pacDays    = PAC_DAYS[zone];
  const sedexDays  = SEDEX_DAYS[zone];

  const options: ShippingOption[] = [];

  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    options.push({ id: "gratis", label: "Frete Grátis", detail: `PAC — ${pacDays} dias úteis`, price: 0, isFree: true });
  }

  options.push(
    { id: "pac",      label: "PAC",       detail: `${pacDays} dias úteis`,              price: rates.pac      },
    { id: "sedex",    label: "SEDEX",     detail: `${sedexDays} dias úteis`,             price: rates.sedex    },
    { id: "sedex10",  label: "SEDEX 10",  detail: "Entrega até 10h do próximo dia útil", price: rates.sedex10  },
  );

  return options;
}

// ── Types ─────────────────────────────────────────────────────────────────────

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
  singleProduct?: Product;
  includeCartItems?: boolean;
}

const STEPS = [
  { id: "contato",     label: "Contato",     icon: User        },
  { id: "endereco",    label: "Endereço",    icon: MapPin      },
  { id: "entrega",     label: "Entrega",     icon: Truck       },
  { id: "pagamento",   label: "Pagamento",   icon: CreditCard  },
  { id: "confirmacao", label: "Confirmação", icon: CheckCircle },
] as const;

type StepId = typeof STEPS[number]["id"];

// ── Component ─────────────────────────────────────────────────────────────────

const CheckoutModal = ({ isOpen, onClose, onBack, singleProduct, includeCartItems = false }: CheckoutModalProps) => {
  const [step, setStep]                     = useState<StepId>("contato");
  const [paymentMethod, setPaymentMethod]   = useState("credit-card");
  const [installments, setInstallments]     = useState(1);
  const [shippingOption, setShippingOption] = useState<string>("");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [isCalcShipping, setIsCalcShipping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [customerInfo, setCustomerInfo] = useState({ name: "", email: "", phone: "" });
  const [addressInfo, setAddressInfo]   = useState({
    cep: "", street: "", number: "", complement: "",
    neighborhood: "", city: "", state: "", country: "Brasil",
  });
  const [savedAddresses, setSavedAddresses]   = useState<AddressDto[]>([]);
  const [addressMode, setAddressMode]         = useState<"saved" | "new">("new");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();

  // Pre-fill contact info and load saved addresses when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (user) {
      setCustomerInfo(p => ({
        ...p,
        name:  p.name  || user.displayName || "",
        email: p.email || user.email       || "",
      }));
    }

    addressService.getMyAddresses()
      .then(addresses => {
        setSavedAddresses(addresses);
        if (addresses.length > 0) {
          const def = addresses.find(a => a.isDefault) ?? addresses[0];
          setSelectedAddressId(def.id);
          setAddressMode("saved");
          setAddressInfo({
            cep: def.cep, street: def.street, number: def.number,
            complement: def.complement ?? "", neighborhood: def.neighborhood,
            city: def.city, state: def.state, country: "Brasil",
          });
        }
      })
      .catch(() => { /* silently ignore — user can still type address */ });
  }, [isOpen, user]);

  // ── Order items & totals ───────────────────────────────────────────────────

  const getCheckoutItems = () => {
    if (singleProduct && includeCartItems) {
      const inCart = items.find(i => i.id === singleProduct.id);
      return inCart
        ? items.map(i => i.id === singleProduct.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...items, { ...singleProduct, quantity: 1 }];
    }
    if (singleProduct) return [{ ...singleProduct, quantity: 1 }];
    return items;
  };

  const checkoutItems  = getCheckoutItems();
  const subtotal       = checkoutItems.reduce((t, i) => t + i.price * i.quantity, 0);
  const selectedShipping = shippingOptions.find(o => o.id === shippingOption);
  const totalPrice     = subtotal + (selectedShipping?.price ?? 0);

  // ── Step navigation ────────────────────────────────────────────────────────

  const currentIndex = STEPS.findIndex(s => s.id === step);
  const isFirst      = currentIndex === 0;
  const isLast       = currentIndex === STEPS.length - 1;

  // Calculate shipping when entering the delivery step
  useEffect(() => {
    if (step !== "entrega" || !addressInfo.state) return;

    setIsCalcShipping(true);
    setShippingOption("");

    // Simulate slight network delay for better UX
    const timer = setTimeout(() => {
      const opts = calculateShippingOptions(addressInfo.state, subtotal);
      setShippingOptions(opts);
      setShippingOption(opts[0]?.id ?? "");
      setIsCalcShipping(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [step, addressInfo.state, subtotal]);

  // ── CEP helpers ────────────────────────────────────────────────────────────

  const formatCEP = (v: string) => {
    const n = v.replace(/\D/g, "");
    return n.length <= 5 ? n : `${n.slice(0, 5)}-${n.slice(5, 8)}`;
  };

  const fetchCEP = async (cep: string) => {
    const clean = cep.replace(/\D/g, "");
    if (clean.length !== 8) return;
    try {
      const res  = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setAddressInfo(p => ({
          ...p,
          street: data.logradouro,
          neighborhood: data.bairro,
          city: data.localidade,
          state: data.uf,
        }));
        toast({ title: "CEP encontrado!", description: "Endereço preenchido automaticamente." });
      } else {
        toast({ title: "CEP não encontrado", description: "Verifique o CEP informado.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Erro ao buscar CEP", description: "Tente novamente mais tarde.", variant: "destructive" });
    }
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setAddressInfo(p => ({ ...p, cep: formatted }));
    if (formatted.replace(/\D/g, "").length === 8) fetchCEP(formatted);
  };

  // ── Validation ─────────────────────────────────────────────────────────────

  const validateStep = (): boolean => {
    if (step === "contato") {
      if (!customerInfo.name.trim() || !customerInfo.email.trim() || !customerInfo.phone.trim()) {
        toast({ title: "Preencha todos os campos", description: "Nome, e-mail e telefone são obrigatórios.", variant: "destructive" });
        return false;
      }
    }
    if (step === "endereco") {
      if (addressMode === "saved" && !selectedAddressId) {
        toast({ title: "Selecione um endereço", variant: "destructive" });
        return false;
      }
      if (addressMode === "new" && (!addressInfo.cep || !addressInfo.street || !addressInfo.number || !addressInfo.city || !addressInfo.state)) {
        toast({ title: "Preencha o endereço", description: "CEP, rua, número, cidade e estado são obrigatórios.", variant: "destructive" });
        return false;
      }
    }
    if (step === "entrega" && !shippingOption) {
      toast({ title: "Selecione uma opção de entrega", variant: "destructive" });
      return false;
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setStep(STEPS[currentIndex + 1].id);
  };

  const goBack = () => {
    if (isFirst) { onBack(); return; }
    setStep(STEPS[currentIndex - 1].id);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await orderService.create({
        items: checkoutItems.map(i => ({ productId: i.id, quantity: i.quantity })),
        customerInfo: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
        },
        addressInfo: {
          cep: addressInfo.cep,
          street: addressInfo.street,
          number: addressInfo.number,
          complement: addressInfo.complement || null,
          neighborhood: addressInfo.neighborhood,
          city: addressInfo.city,
          state: addressInfo.state,
        },
        paymentMethod: toApiPaymentMethod(paymentMethod),
        installments: paymentMethod === "credit-card" ? installments : 1,
      });
      toast({ title: "Pedido realizado!", description: "Acompanhe em Meus Pedidos." });

      // Auto-save new address for future checkouts
      if (addressMode === "new") {
        addressService.create({
          cep: addressInfo.cep,
          street: addressInfo.street,
          number: addressInfo.number,
          complement: addressInfo.complement || null,
          neighborhood: addressInfo.neighborhood,
          city: addressInfo.city,
          state: addressInfo.state,
        }).catch(() => { /* silently ignore */ });
      }

      if (includeCartItems || !singleProduct) clearCart();
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao finalizar pedido";
      toast({ title: "Erro ao finalizar pedido", description: message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Step indicator ─────────────────────────────────────────────────────────

  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-6 px-1">
      {STEPS.map((s, idx) => {
        const done    = idx < currentIndex;
        const current = idx === currentIndex;
        const Icon    = s.icon;
        return (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors text-xs font-bold
                ${done    ? "border-primary bg-primary text-white"
                : current ? "border-primary bg-background text-primary"
                :           "border-muted-foreground/30 bg-muted text-muted-foreground/50"}`}>
                {done ? <Check className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
              </div>
              <span className={`text-[10px] font-medium hidden sm:block
                ${current ? "text-primary" : done ? "text-primary/70" : "text-muted-foreground/50"}`}>
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 mb-4 transition-colors ${done ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  // ── Payment ────────────────────────────────────────────────────────────────

  const paymentMethods = [
    { id: "credit-card", name: "Cartão de Crédito", icon: CreditCard, description: "Parcelamento em até 10x sem juros" },
    { id: "debit-card",  name: "Cartão de Débito",  icon: Calendar,   description: "Pagamento à vista com desconto"   },
    { id: "pix",         name: "PIX",               icon: QrCode,     description: "Pagamento instantâneo"            },
    { id: "boleto",      name: "Boleto Bancário",   icon: Smartphone,  description: "Vencimento em 3 dias úteis"       },
  ];

  const installmentOptions = Array.from({ length: 10 }, (_, i) => {
    const count = i + 1;
    const value = totalPrice / count;
    return {
      count,
      label: count === 1
        ? `À vista — R$ ${value.toFixed(2)}`
        : `${count}x de R$ ${value.toFixed(2)} sem juros`,
    };
  });

  // ── Step content ───────────────────────────────────────────────────────────

  const renderStep = () => {
    switch (step) {

      case "contato":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input id="name" value={customerInfo.name}
                  onChange={e => setCustomerInfo(p => ({ ...p, name: e.target.value }))}
                  placeholder="Seu nome completo" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail *</Label>
                <Input id="email" type="email" value={customerInfo.email}
                  onChange={e => setCustomerInfo(p => ({ ...p, email: e.target.value }))}
                  placeholder="seu@email.com" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefone *</Label>
              <Input id="phone" value={customerInfo.phone}
                onChange={e => setCustomerInfo(p => ({ ...p, phone: e.target.value }))}
                placeholder="(92) 99999-9999" />
            </div>
          </div>
        );

      case "endereco":
        return (
          <div className="space-y-4">
            {/* Saved addresses */}
            {savedAddresses.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Endereços salvos
                </p>
                {savedAddresses.map(addr => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => {
                      setSelectedAddressId(addr.id);
                      setAddressMode("saved");
                      setAddressInfo({
                        cep: addr.cep, street: addr.street, number: addr.number,
                        complement: addr.complement ?? "", neighborhood: addr.neighborhood,
                        city: addr.city, state: addr.state, country: "Brasil",
                      });
                    }}
                    className={`w-full text-left p-3 border rounded-lg text-sm transition-colors
                      ${addressMode === "saved" && selectedAddressId === addr.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/30 border-border"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {addr.label && <p className="font-medium">{addr.label}</p>}
                        <p className={addr.label ? "text-muted-foreground" : "font-medium"}>
                          {addr.street}, {addr.number}
                          {addr.complement ? ` — ${addr.complement}` : ""}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {addr.neighborhood} · {addr.city}/{addr.state} · {addr.cep}
                        </p>
                      </div>
                      {addr.isDefault && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full shrink-0">
                          Padrão
                        </span>
                      )}
                    </div>
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setAddressMode("new");
                    setSelectedAddressId(null);
                    setAddressInfo({ cep: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "", country: "Brasil" });
                  }}
                  className={`w-full text-left p-3 border rounded-lg text-sm transition-colors flex items-center gap-2
                    ${addressMode === "new"
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/30 border-border"}`}
                >
                  <Plus className="h-4 w-4 text-muted-foreground" />
                  <span>Usar novo endereço</span>
                </button>

                {addressMode === "new" && <Separator />}
              </div>
            )}

            {/* Address form — shown when mode is "new" or no saved addresses exist */}
            {addressMode === "new" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="cep">CEP *</Label>
                    <Input id="cep" value={addressInfo.cep} onChange={handleCEPChange}
                      placeholder="00000-000" maxLength={9} />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <Label htmlFor="street">Rua / Avenida *</Label>
                    <Input id="street" value={addressInfo.street}
                      onChange={e => setAddressInfo(p => ({ ...p, street: e.target.value }))}
                      placeholder="Nome da rua, avenida..." />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="number">Número *</Label>
                    <Input id="number" value={addressInfo.number}
                      onChange={e => setAddressInfo(p => ({ ...p, number: e.target.value }))}
                      placeholder="123" />
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <Label htmlFor="complement">Complemento</Label>
                    <Input id="complement" value={addressInfo.complement}
                      onChange={e => setAddressInfo(p => ({ ...p, complement: e.target.value }))}
                      placeholder="Apto, bloco... (opcional)" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="neighborhood">Bairro *</Label>
                    <Input id="neighborhood" value={addressInfo.neighborhood}
                      onChange={e => setAddressInfo(p => ({ ...p, neighborhood: e.target.value }))}
                      placeholder="Nome do bairro" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="city">Cidade *</Label>
                    <Input id="city" value={addressInfo.city}
                      onChange={e => setAddressInfo(p => ({ ...p, city: e.target.value }))}
                      placeholder="Nome da cidade" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="state">Estado *</Label>
                    <Input id="state" value={addressInfo.state}
                      onChange={e => setAddressInfo(p => ({ ...p, state: e.target.value }))}
                      placeholder="AM" maxLength={2} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="country">País</Label>
                    <Input id="country" value={addressInfo.country}
                      onChange={e => setAddressInfo(p => ({ ...p, country: e.target.value }))}
                      placeholder="Brasil" />
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case "entrega":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4 shrink-0" />
              <span>
                CD Manaus/AM → <strong className="text-foreground">{addressInfo.street}, {addressInfo.number} — {addressInfo.city}/{addressInfo.state}</strong>
              </span>
            </div>

            {isCalcShipping ? (
              <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm">Calculando frete para {addressInfo.cep}...</p>
              </div>
            ) : (
              <>
                {subtotal >= FREE_SHIPPING_THRESHOLD && (
                  <div className="px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600 text-sm font-medium">
                    Parabéns! Você ganhou frete grátis neste pedido.
                  </div>
                )}

                <RadioGroup value={shippingOption} onValueChange={setShippingOption} className="space-y-2">
                  {shippingOptions.map(opt => (
                    <label key={opt.id}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors
                        ${shippingOption === opt.id ? "border-primary bg-primary/5" : "hover:bg-muted/30"}`}>
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value={opt.id} id={opt.id} />
                        <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="font-medium text-sm">{opt.label}</p>
                          <p className="text-xs text-muted-foreground">{opt.detail}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-semibold shrink-0 ${opt.price === 0 ? "text-green-600" : ""}`}>
                        {opt.price === 0 ? "Grátis" : `R$ ${opt.price.toFixed(2)}`}
                      </span>
                    </label>
                  ))}
                </RadioGroup>

                <p className="text-xs text-muted-foreground text-center">
                  Preços estimados com base na tabela Correios 2024 a partir de Manaus/AM.
                </p>
              </>
            )}
          </div>
        );

      case "pagamento":
        return (
          <div className="space-y-4">
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
              {paymentMethods.map(m => {
                const Icon = m.icon;
                return (
                  <label key={m.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors
                      ${paymentMethod === m.id ? "border-primary bg-primary/5" : "hover:bg-muted/30"}`}>
                    <RadioGroupItem value={m.id} id={m.id} />
                    <Icon className="h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.description}</p>
                    </div>
                  </label>
                );
              })}
            </RadioGroup>

            {(paymentMethod === "credit-card" || paymentMethod === "debit-card") && (
              <div className="space-y-3 p-4 border rounded-lg bg-muted/10">
                {paymentMethod === "credit-card" && (
                  <div>
                    <Label className="text-sm mb-2 block">Parcelamento</Label>
                    <RadioGroup value={installments.toString()} onValueChange={v => setInstallments(parseInt(v))}>
                      <div className="grid grid-cols-1 gap-1 max-h-36 overflow-y-auto pr-1">
                        {installmentOptions.map(opt => (
                          <div key={opt.count} className="flex items-center gap-2 p-1.5 hover:bg-muted/20 rounded">
                            <RadioGroupItem value={opt.count.toString()} id={`inst-${opt.count}`} />
                            <Label htmlFor={`inst-${opt.count}`} className="text-sm cursor-pointer">{opt.label}</Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  </div>
                )}
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 pt-1">
                  <Lock className="h-3 w-3 shrink-0" />
                  Os dados do cartão serão inseridos com segurança na etapa de pagamento do gateway.
                </p>
              </div>
            )}

            {paymentMethod === "pix" && (
              <div className="p-4 border rounded-lg bg-muted/10 text-center space-y-2">
                <QrCode className="h-14 w-14 mx-auto text-primary" />
                <p className="text-sm text-muted-foreground">Após confirmar, um QR Code PIX será gerado para pagamento.</p>
              </div>
            )}

            {paymentMethod === "boleto" && (
              <div className="p-4 border rounded-lg bg-muted/10">
                <p className="text-sm text-muted-foreground">O boleto será gerado após a confirmação. Vencimento em 3 dias úteis.</p>
              </div>
            )}
          </div>
        );

      case "confirmacao":
        return (
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-sm">Itens do Pedido</h4>
              {checkoutItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                  <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>R$ {subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-sm">
                <span>Frete ({selectedShipping?.label})</span>
                <span className={selectedShipping?.price === 0 ? "text-green-600" : ""}>
                  {selectedShipping?.price === 0 ? "Grátis" : `R$ ${selectedShipping?.price.toFixed(2)}`}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-primary">R$ {totalPrice.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3 border rounded-lg space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contato</p>
              <p className="text-sm">{customerInfo.name} · {customerInfo.email} · {customerInfo.phone}</p>
            </div>

            <div className="p-3 border rounded-lg space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Endereço de Entrega</p>
              <p className="text-sm">{addressInfo.street}, {addressInfo.number}{addressInfo.complement ? ` — ${addressInfo.complement}` : ""}</p>
              <p className="text-sm">{addressInfo.neighborhood} · {addressInfo.city}/{addressInfo.state} · {addressInfo.cep}</p>
            </div>

            <div className="p-3 border rounded-lg space-y-1">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pagamento</p>
              <p className="text-sm">
                {paymentMethods.find(m => m.id === paymentMethod)?.name}
                {paymentMethod === "credit-card" && installments > 1 ? ` — ${installments}x de R$ ${(totalPrice / installments).toFixed(2)}` : ""}
              </p>
            </div>

            <div className="p-3 border rounded-lg bg-muted/20">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 shrink-0" />
                Ao confirmar, seu pedido será registrado e você poderá acompanhá-lo em <strong>Meus Pedidos</strong>.
              </p>
            </div>
          </div>
        );
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={goBack} className="h-8 w-8 shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Finalizar Compra
            </DialogTitle>
          </div>
        </DialogHeader>

        <StepIndicator />

        <div className="mb-2">
          <h3 className="font-semibold text-base">{STEPS[currentIndex].label}</h3>
        </div>

        <div className="min-h-[220px]">
          {renderStep()}
        </div>

        <div className="flex gap-3 pt-4 border-t mt-4">
          <Button variant="outline" onClick={goBack} className="flex-1">
            {isFirst ? (singleProduct ? "Voltar ao Produto" : "Voltar ao Carrinho") : "Voltar"}
          </Button>
          {isLast ? (
            <Button onClick={handleConfirm} className="flex-1 bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />Processando...</>
              ) : "Confirmar Pedido"}
            </Button>
          ) : (
            <Button onClick={goNext} className="flex-1 bg-primary hover:bg-primary/90" disabled={step === "entrega" && isCalcShipping}>
              Continuar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;

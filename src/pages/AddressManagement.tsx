import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, Trash2, Plus, ArrowLeft, Loader2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { addressService, AddressDto, CreateAddressPayload } from "@/services/addressService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// ── CEP helpers ────────────────────────────────────────────────────────────────

const formatCEP = (v: string) => {
  const n = v.replace(/\D/g, "");
  return n.length <= 5 ? n : `${n.slice(0, 5)}-${n.slice(5, 8)}`;
};

// ── AddressCard ────────────────────────────────────────────────────────────────

function AddressCard({
  address,
  onSetDefault,
  onDelete,
  isLoading,
}: {
  address: AddressDto;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}) {
  return (
    <div className={`border rounded-xl p-4 bg-card space-y-3 ${address.isDefault ? "border-primary" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-2 bg-muted rounded-lg shrink-0">
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-semibold text-sm">
                {address.label ?? `${address.city}/${address.state}`}
              </p>
              {address.isDefault && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  Padrão
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {address.street}, {address.number}
              {address.complement ? ` — ${address.complement}` : ""}
            </p>
            <p className="text-sm text-muted-foreground">
              {address.neighborhood} · {address.city}/{address.state} · CEP {address.cep}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex items-center gap-2">
        {!address.isDefault && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 text-xs"
            disabled={isLoading}
            onClick={() => onSetDefault(address.id)}
          >
            <Star className="h-3.5 w-3.5" />
            Definir como padrão
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 text-xs text-destructive hover:text-destructive ml-auto"
          disabled={isLoading}
          onClick={() => onDelete(address.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Excluir
        </Button>
      </div>
    </div>
  );
}

// ── AddressForm ────────────────────────────────────────────────────────────────

const EMPTY_FORM: CreateAddressPayload = {
  label: "", cep: "", street: "", number: "",
  complement: "", neighborhood: "", city: "", state: "",
};

function AddressForm({
  onSave,
  isSaving,
}: {
  onSave: (data: CreateAddressPayload) => void;
  isSaving: boolean;
}) {
  const [form, setForm] = useState<CreateAddressPayload>(EMPTY_FORM);
  const { toast } = useToast();

  const set = (field: keyof CreateAddressPayload) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm(p => ({ ...p, [field]: e.target.value }));

  const handleCEPChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCEP(e.target.value);
    setForm(p => ({ ...p, cep: formatted }));
    if (formatted.replace(/\D/g, "").length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${formatted.replace(/\D/g, "")}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setForm(p => ({
            ...p,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
          }));
          toast({ title: "CEP encontrado!", description: "Endereço preenchido automaticamente." });
        }
      } catch {
        // ignore
      }
    }
  };

  const handleSubmit = () => {
    if (!form.cep || !form.street || !form.number || !form.city || !form.state) {
      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
      return;
    }
    onSave({
      ...form,
      label: form.label?.trim() || null,
      complement: form.complement?.trim() || null,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="label">Nome do endereço (opcional)</Label>
        <Input
          id="label" value={form.label ?? ""} onChange={set("label")}
          placeholder="Ex: Casa, Trabalho..." maxLength={50}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="cep">CEP *</Label>
          <Input id="cep" value={form.cep} onChange={handleCEPChange}
            placeholder="00000-000" maxLength={9} />
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="street">Rua / Avenida *</Label>
          <Input id="street" value={form.street} onChange={set("street")}
            placeholder="Nome da rua, avenida..." />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="number">Número *</Label>
          <Input id="number" value={form.number} onChange={set("number")} placeholder="123" />
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="complement">Complemento</Label>
          <Input id="complement" value={form.complement ?? ""} onChange={set("complement")}
            placeholder="Apto, bloco... (opcional)" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="neighborhood">Bairro *</Label>
          <Input id="neighborhood" value={form.neighborhood} onChange={set("neighborhood")}
            placeholder="Nome do bairro" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="city">Cidade *</Label>
          <Input id="city" value={form.city} onChange={set("city")}
            placeholder="Nome da cidade" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="state">Estado *</Label>
        <Input id="state" value={form.state} onChange={set("state")}
          placeholder="AM" maxLength={2} className="uppercase w-24" />
      </div>

      <Button onClick={handleSubmit} disabled={isSaving} className="w-full">
        {isSaving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Salvando...</> : "Salvar Endereço"}
      </Button>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

const AddressManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);

  const fetchAddresses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await addressService.getMyAddresses();
      setAddresses(data);
    } catch {
      toast({ title: "Erro ao carregar endereços", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchAddresses();
  }, [user, fetchAddresses, navigate]);

  const handleSetDefault = async (id: string) => {
    setIsActionLoading(true);
    try {
      await addressService.setDefault(id);
      setAddresses(prev =>
        prev.map(a => ({ ...a, isDefault: a.id === id }))
      );
      toast({ title: "Endereço padrão atualizado" });
    } catch {
      toast({ title: "Erro ao atualizar endereço padrão", variant: "destructive" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setIsActionLoading(true);
    try {
      await addressService.delete(id);
      const remaining = addresses.filter(a => a.id !== id);
      const wasDefault = addresses.find(a => a.id === id)?.isDefault;
      setAddresses(
        wasDefault && remaining.length > 0
          ? remaining.map((a, i) => ({ ...a, isDefault: i === 0 }))
          : remaining
      );
      toast({ title: "Endereço removido" });
    } catch {
      toast({ title: "Erro ao remover endereço", variant: "destructive" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleSave = async (data: CreateAddressPayload) => {
    setIsSaving(true);
    try {
      const created = await addressService.create(data);
      setAddresses(prev => {
        if (prev.length === 0) return [created];
        return [created, ...prev];
      });
      setShowAddDialog(false);
      toast({ title: "Endereço salvo com sucesso" });
    } catch {
      toast({ title: "Erro ao salvar endereço", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Meus Endereços</h1>
            {!isLoading && (
              <p className="text-sm text-muted-foreground">
                {addresses.length} endereço{addresses.length !== 1 ? "s" : ""} cadastrado{addresses.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          <Button onClick={() => setShowAddDialog(true)} size="sm" className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : addresses.length > 0 ? (
          <div className="space-y-3">
            {addresses.map(addr => (
              <AddressCard
                key={addr.id}
                address={addr}
                onSetDefault={handleSetDefault}
                onDelete={handleDelete}
                isLoading={isActionLoading}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <Home className="h-16 w-16 text-muted-foreground/30" />
            <p className="text-lg font-semibold">Nenhum endereço cadastrado</p>
            <p className="text-sm text-muted-foreground">
              Seus endereços de entrega aparecerão aqui.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar endereço
            </Button>
          </div>
        )}
      </main>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Endereço</DialogTitle>
          </DialogHeader>
          <AddressForm onSave={handleSave} isSaving={isSaving} />
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AddressManagement;

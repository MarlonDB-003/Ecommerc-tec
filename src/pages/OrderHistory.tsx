import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ChevronDown, ChevronUp, ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  orderService,
  OrderDto,
  OrderPagedResult,
  PAYMENT_METHOD_LABELS,
  ORDER_STATUS_LABELS,
} from "@/services/orderService";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PAGE_SIZE = 8;

const STATUS_VARIANT: Record<string, string> = {
  Pending:    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  Processing: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Shipped:    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  Delivered:  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Cancelled:  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function OrderCard({ order }: { order: OrderDto }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border rounded-xl overflow-hidden bg-card">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 p-2 bg-muted rounded-lg">
            <Package className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-sm">Pedido #{order.id.slice(0, 8).toUpperCase()}</p>
            <p className="text-xs text-muted-foreground">{formatDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_VARIANT[order.status] ?? "bg-muted text-muted-foreground"}`}>
            {ORDER_STATUS_LABELS[order.status] ?? order.status}
          </span>
          <p className="font-bold text-primary whitespace-nowrap">
            R$ {order.totalAmount.toFixed(2)}
          </p>
          <button
            onClick={() => setExpanded(p => !p)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Expandir pedido"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Expandable details */}
      {expanded && (
        <>
          <Separator />
          <div className="p-4 space-y-4 text-sm">
            {/* Items */}
            <div>
              <p className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-2">Itens</p>
              <div className="space-y-1.5">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <span className="text-muted-foreground">{item.productName} × {item.quantity}</span>
                    <span>R$ {item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Delivery + Payment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-1">Endereço de Entrega</p>
                <p>{order.addressStreet}, {order.addressNumber}{order.addressComplement ? ` — ${order.addressComplement}` : ""}</p>
                <p className="text-muted-foreground">{order.addressNeighborhood} · {order.addressCity}/{order.addressState}</p>
                <p className="text-muted-foreground">CEP {order.addressCep}</p>
              </div>
              <div>
                <p className="font-semibold text-xs uppercase tracking-wide text-muted-foreground mb-1">Pagamento</p>
                <p>{PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
                {order.paymentMethod === "CreditCard" && order.installments > 1 && (
                  <p className="text-muted-foreground">
                    {order.installments}x de R$ {(order.totalAmount / order.installments).toFixed(2)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PaginationControls({
  page, totalPages, onChange,
}: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <Button
        variant="outline" size="sm"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
      >
        Anterior
      </Button>

      {pages.map((p, idx) =>
        p === "..." ? (
          <span key={`dot-${idx}`} className="px-2 text-muted-foreground">…</span>
        ) : (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="sm"
            onClick={() => onChange(p as number)}
            className="w-9"
          >
            {p}
          </Button>
        )
      )}

      <Button
        variant="outline" size="sm"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
      >
        Próxima
      </Button>
    </div>
  );
}

const OrderHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [result, setResult] = useState<OrderPagedResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  const fetchOrders = useCallback(async (p: number) => {
    setIsLoading(true);
    try {
      const data = await orderService.getMyOrders(p, PAGE_SIZE);
      setResult(data);
    } catch {
      toast({ title: "Erro ao carregar pedidos", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchOrders(page);
  }, [user, page, fetchOrders, navigate]);

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Meus Pedidos</h1>
            {result && (
              <p className="text-sm text-muted-foreground">
                {result.totalCount} pedido{result.totalCount !== 1 ? "s" : ""} encontrado{result.totalCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : result && result.items.length > 0 ? (
          <>
            <div className="space-y-3">
              {result.items.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
            <PaginationControls
              page={page}
              totalPages={result.totalPages}
              onChange={handlePageChange}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/30" />
            <p className="text-lg font-semibold">Nenhum pedido ainda</p>
            <p className="text-sm text-muted-foreground">Seus pedidos aparecerão aqui após a compra.</p>
            <Button onClick={() => navigate("/")}>Ver produtos</Button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default OrderHistory;

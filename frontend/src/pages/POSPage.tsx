import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Search, Plus, Minus, Trash2, ShoppingCart, X } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { useCartStore } from "../store/cartStore";
import { productService } from "../services/productService";
import { saleService } from "../services/saleService";
import { formatCOP } from "../utils/format";
import { showToast } from "../components/ui/Toast";
import type { Product } from "../types";

const POSPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [paymentModal, setPaymentModal] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [receiptSale, setReceiptSale] = useState<any>(null);

  const {
    items,
    discount,
    taxRate,
    customerId,
    addItem,
    removeItem,
    updateQuantity,
    setDiscount,
    setTaxRate,
    clearCart,
    getSubtotal,
    getTaxAmount,
    getTotal,
  } = useCartStore();

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const { data: products, isLoading } = useQuery({
    queryKey: ["products-pos", debouncedQuery],
    queryFn: () =>
      debouncedQuery
        ? productService.search(debouncedQuery)
        : productService.getAll(),
  });

  const createSaleMutation = useMutation({
    mutationFn: saleService.create,
    onSuccess: (sale) => {
      setReceiptSale(sale);
      clearCart();
      setPaymentModal(false);
      showToast("success", `Venta ${sale.invoiceNumber} creada exitosamente`);
    },
    onError: (err: any) => {
      showToast(
        "error",
        err?.response?.data?.message ?? "Error al procesar venta",
      );
    },
  });

  const handleAddProduct = (product: Product) => {
    if (product.stock <= 0) {
      showToast("warning", "Producto sin stock disponible");
      return;
    }
    addItem({
      productId: product.id,
      productName: product.name,
      unitPrice: product.salePrice,
      quantity: 1,
      discount: 0,
      imageUrl: product.imageUrl,
      icon: product.categoryIcon,
    });
  };

  const handleConfirmSale = () => {
    const total = getTotal();
    const paid = parseFloat(amountPaid) || total;
    if (paid < total && paymentMethod === "CASH") {
      showToast("error", "El monto pagado es insuficiente");
      return;
    }

    createSaleMutation.mutate({
      customerId: customerId ?? undefined,
      discount,
      taxRate,
      paymentMethod,
      amountPaid: paid,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        discount: i.discount,
      })),
    });
  };

  const subtotal = getSubtotal();
  const taxAmount = getTaxAmount();
  const total = getTotal();
  const change = Math.max(0, (parseFloat(amountPaid) || 0) - total);

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Products Panel */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-white/5">
        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Buscar producto o código de barras..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <Spinner />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {products?.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleAddProduct(product)}
                  disabled={product.stock <= 0}
                  className="card p-3 text-left hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed group"
                >
                  <div className="text-2xl mb-2">
                    {product.categoryIcon ?? "📦"}
                  </div>
                  <p className="text-xs font-medium text-slate-200 line-clamp-2 mb-1">
                    {product.name}
                  </p>
                  <p className="font-mono text-sm font-bold text-indigo-400">
                    {formatCOP(product.salePrice)}
                  </p>
                  <div className="mt-1">
                    <Badge
                      color={
                        product.stock <= 0
                          ? "red"
                          : product.stock <= product.minStock
                            ? "yellow"
                            : "green"
                      }
                    >
                      {product.stock} uds
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cart Panel */}
      <div className="w-80 flex flex-col bg-[#0f0f1a]">
        <div className="px-4 py-3.5 border-b border-white/5 flex items-center gap-2">
          <ShoppingCart size={16} className="text-indigo-400" />
          <span className="text-sm font-semibold text-slate-200">Carrito</span>
          <Badge color="indigo" className="ml-auto">
            {items.length}
          </Badge>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-600">
              <ShoppingCart size={32} className="mb-2 opacity-30" />
              <p className="text-xs">Carrito vacío</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((item) => (
                <div key={item.productId} className="card p-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-xs text-slate-200 flex-1 line-clamp-2">
                      {item.productName}
                    </p>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-slate-600 hover:text-red-400 shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity - 1)
                        }
                        className="w-6 h-6 bg-white/5 hover:bg-white/10 rounded text-slate-300 flex items-center justify-center"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="font-mono text-xs text-slate-100 w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.productId, item.quantity + 1)
                        }
                        className="w-6 h-6 bg-white/5 hover:bg-white/10 rounded text-slate-300 flex items-center justify-center"
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                    <span className="font-mono text-xs text-emerald-400">
                      {formatCOP(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="px-4 py-3 border-t border-white/5 space-y-2">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Descuento $"
              value={discount || ""}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="number"
              placeholder="IVA %"
              value={taxRate || ""}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              className="w-20 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="font-mono">{formatCOP(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-red-400">
                <span>Descuento</span>
                <span className="font-mono">-{formatCOP(discount)}</span>
              </div>
            )}
            {taxRate > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>IVA ({taxRate}%)</span>
                <span className="font-mono">{formatCOP(taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-slate-100 pt-1 border-t border-white/10">
              <span>TOTAL</span>
              <span className="font-mono text-indigo-400">
                {formatCOP(total)}
              </span>
            </div>
          </div>

          <Button
            onClick={() => setPaymentModal(true)}
            disabled={items.length === 0}
            size="lg"
            className="w-full mt-2"
          >
            Cobrar
          </Button>
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModal && (
        <Modal
          title="Procesar Pago"
          onClose={() => setPaymentModal(false)}
          size="sm"
        >
          <div className="space-y-4">
            <div className="card p-4 text-center">
              <p className="text-xs text-slate-400 mb-1">Total a cobrar</p>
              <p className="font-mono text-3xl font-bold text-indigo-400">
                {formatCOP(total)}
              </p>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-2">
                Método de pago
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["CASH", "CARD", "TRANSFER", "MIXED"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setPaymentMethod(m)}
                    className={`py-2 rounded-lg text-xs font-medium transition-all ${
                      paymentMethod === m
                        ? "bg-indigo-500 text-white"
                        : "bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    {
                      {
                        CASH: "💵 Efectivo",
                        CARD: "💳 Tarjeta",
                        TRANSFER: "🏦 Transferencia",
                        MIXED: "🔀 Mixto",
                      }[m]
                    }
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Monto recibido"
              type="number"
              placeholder={String(total)}
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
            />

            {parseFloat(amountPaid) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Cambio</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {formatCOP(change)}
                </span>
              </div>
            )}

            <Button
              onClick={handleConfirmSale}
              loading={createSaleMutation.isPending}
              size="lg"
              className="w-full"
            >
              Confirmar Venta
            </Button>
          </div>
        </Modal>
      )}

      {/* Receipt Modal */}
      {receiptSale && (
        <Modal
          title="Venta Completada"
          onClose={() => setReceiptSale(null)}
          size="sm"
        >
          <div className="space-y-3">
            <div className="card p-4 text-center">
              <p className="text-emerald-400 font-semibold text-sm mb-1">
                ✓ Venta exitosa
              </p>
              <p className="font-mono text-lg font-bold text-slate-100">
                {receiptSale.invoiceNumber}
              </p>
              <p className="font-mono text-2xl font-bold text-indigo-400 mt-2">
                {formatCOP(receiptSale.total)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={() => window.print()}
              >
                Imprimir
              </Button>
              <Button
                size="sm"
                className="flex-1"
                onClick={() => setReceiptSale(null)}
              >
                Nueva Venta
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default POSPage;

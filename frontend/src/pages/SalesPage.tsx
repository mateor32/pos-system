import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Eye, XCircle, Printer } from "lucide-react";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";
import { Modal } from "../components/ui/Modal";
import { saleService } from "../services/saleService";
import { formatCOP, formatDate } from "../utils/format";
import { showToast } from "../components/ui/Toast";
import type { Sale, SaleStatus, PaymentMethod } from "../types";
import { useAuthStore } from "../store/authStore";

const statusColors: Record<SaleStatus, "green" | "red" | "yellow"> = {
  COMPLETED: "green",
  CANCELLED: "red",
  REFUNDED: "yellow",
};

const methodLabels: Record<PaymentMethod, string> = {
  CASH: "💵 Efectivo",
  CARD: "💳 Tarjeta",
  TRANSFER: "🏦 Transfer.",
  MIXED: "🔀 Mixto",
};

const SalesPage: React.FC = () => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: sales, isLoading } = useQuery({
    queryKey: ["sales", fromDate, toDate],
    queryFn: () =>
      saleService.getAll(fromDate || undefined, toDate || undefined),
  });

  const cancelMutation = useMutation({
    mutationFn: saleService.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      setSelectedSale(null);
      showToast("success", "Venta cancelada correctamente");
    },
    onError: (e: any) =>
      showToast("error", e?.response?.data?.message ?? "Error al cancelar"),
  });

  const canCancel = user?.role === "ADMIN" || user?.role === "MANAGER";

  return (
    <div className="p-6 fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-100">
          Historial de Ventas
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {sales?.length ?? 0} registros
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div>
          <label className="text-xs text-slate-500 block mb-1">Desde</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500 block mb-1">Hasta</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  # Factura
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Cajero
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Método
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center">
                    <Spinner />
                  </td>
                </tr>
              ) : (
                sales?.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b border-white/5 hover:bg-white/2 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-indigo-400">
                      {sale.invoiceNumber}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {formatDate(sale.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {sale.customerName ?? (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {sale.userName}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-slate-100">
                      {formatCOP(sale.total)}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-slate-300">
                      {methodLabels[sale.paymentMethod] ?? sale.paymentMethod}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge color={statusColors[sale.status]}>
                        {sale.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedSale(sale)}
                        className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sale Detail Modal */}
      {selectedSale && (
        <Modal
          title={`Venta ${selectedSale.invoiceNumber}`}
          onClose={() => setSelectedSale(null)}
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="card p-3">
                <p className="text-xs text-slate-500 mb-1">Fecha</p>
                <p className="text-slate-200">
                  {formatDate(selectedSale.createdAt)}
                </p>
              </div>
              <div className="card p-3">
                <p className="text-xs text-slate-500 mb-1">Estado</p>
                <Badge color={statusColors[selectedSale.status]}>
                  {selectedSale.status}
                </Badge>
              </div>
              <div className="card p-3">
                <p className="text-xs text-slate-500 mb-1">Cliente</p>
                <p className="text-slate-200">
                  {selectedSale.customerName ?? "Consumidor final"}
                </p>
              </div>
              <div className="card p-3">
                <p className="text-xs text-slate-500 mb-1">Cajero</p>
                <p className="text-slate-200">{selectedSale.userName}</p>
              </div>
            </div>

            {/* Items */}
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-2 text-slate-400">Producto</th>
                  <th className="text-center py-2 text-slate-400">Cant.</th>
                  <th className="text-right py-2 text-slate-400">Precio</th>
                  <th className="text-right py-2 text-slate-400">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedSale.items.map((item, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-2 text-slate-300">{item.productName}</td>
                    <td className="py-2 text-center text-slate-400">
                      {item.quantity}
                    </td>
                    <td className="py-2 text-right font-mono text-slate-400">
                      {formatCOP(item.unitPrice)}
                    </td>
                    <td className="py-2 text-right font-mono text-slate-200">
                      {formatCOP(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="space-y-1 text-xs text-right">
              <div className="flex justify-end gap-4 text-slate-400">
                <span>Subtotal:</span>
                <span className="font-mono w-28">
                  {formatCOP(selectedSale.subtotal)}
                </span>
              </div>
              {selectedSale.discount > 0 && (
                <div className="flex justify-end gap-4 text-red-400">
                  <span>Descuento:</span>
                  <span className="font-mono w-28">
                    -{formatCOP(selectedSale.discount)}
                  </span>
                </div>
              )}
              {selectedSale.taxAmount > 0 && (
                <div className="flex justify-end gap-4 text-slate-400">
                  <span>IVA ({selectedSale.taxRate}%):</span>
                  <span className="font-mono w-28">
                    {formatCOP(selectedSale.taxAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-end gap-4 text-base font-bold text-slate-100 pt-1 border-t border-white/10">
                <span>TOTAL:</span>
                <span className="font-mono w-28 text-indigo-400">
                  {formatCOP(selectedSale.total)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              {canCancel && selectedSale.status === "COMPLETED" && (
                <Button
                  variant="danger"
                  onClick={() => cancelMutation.mutate(selectedSale.id)}
                  loading={cancelMutation.isPending}
                >
                  <XCircle size={14} /> Cancelar venta
                </Button>
              )}
              <Button variant="ghost" onClick={() => window.print()}>
                <Printer size={14} /> Imprimir
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SalesPage;

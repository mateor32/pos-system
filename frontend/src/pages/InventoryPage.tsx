import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  TrendingDown,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { productService } from "../services/productService";
import { categoryService } from "../services/otherServices";
import { formatCOP } from "../utils/format";
import { showToast } from "../components/ui/Toast";
import type { Product } from "../types";

const emptyForm = {
  name: "",
  barcode: "",
  description: "",
  costPrice: "",
  salePrice: "",
  stock: "",
  minStock: "5",
  imageUrl: "",
  categoryId: "",
  active: true,
};

const InventoryPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [adjustForm, setAdjustForm] = useState({
    quantity: "",
    type: "IN",
    reason: "",
  });

  const queryClient = useQueryClient();

  const { data: products, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: productService.getAll,
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setShowForm(false);
      setForm(emptyForm);
      showToast("success", "Producto creado correctamente");
    },
    onError: (e: any) =>
      showToast("error", e?.response?.data?.message ?? "Error al crear"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      productService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditProduct(null);
      showToast("success", "Producto actualizado");
    },
    onError: (e: any) =>
      showToast("error", e?.response?.data?.message ?? "Error al actualizar"),
  });

  const deleteMutation = useMutation({
    mutationFn: productService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      showToast("success", "Producto desactivado");
    },
    onError: () => showToast("error", "Error al eliminar"),
  });

  const adjustMutation = useMutation({
    mutationFn: ({ id, qty, type, reason }: any) =>
      productService.adjustStock(id, qty, type, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setAdjustProduct(null);
      showToast("success", "Stock ajustado correctamente");
    },
    onError: (e: any) =>
      showToast(
        "error",
        e?.response?.data?.message ?? "Error al ajustar stock",
      ),
  });

  const filtered =
    products?.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode ?? "").includes(search),
    ) ?? [];

  const totalInventoryValue = filtered.reduce(
    (sum, p) => sum + p.costPrice * p.stock,
    0,
  );
  const totalSaleValue = filtered.reduce(
    (sum, p) => sum + p.salePrice * p.stock,
    0,
  );

  const openEdit = (product: Product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      barcode: product.barcode ?? "",
      description: product.description ?? "",
      costPrice: String(product.costPrice),
      salePrice: String(product.salePrice),
      stock: String(product.stock),
      minStock: String(product.minStock),
      imageUrl: product.imageUrl ?? "",
      categoryId: String(product.categoryId ?? ""),
      active: product.active,
    });
  };

  const handleSubmit = () => {
    const data = {
      name: form.name,
      barcode: form.barcode || undefined,
      description: form.description || undefined,
      costPrice: parseFloat(form.costPrice),
      salePrice: parseFloat(form.salePrice),
      stock: parseInt(form.stock) || 0,
      minStock: parseInt(form.minStock) || 5,
      imageUrl: form.imageUrl || undefined,
      categoryId: form.categoryId ? parseInt(form.categoryId) : undefined,
      active: form.active,
    };
    if (editProduct) {
      updateMutation.mutate({ id: editProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const stockBadge = (p: Product) => {
    if (p.stock <= 0) return <Badge color="red">Agotado</Badge>;
    if (p.stock <= p.minStock) return <Badge color="yellow">Stock bajo</Badge>;
    return <Badge color="green">OK</Badge>;
  };

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Inventario</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {filtered.length} productos
          </p>
        </div>
        <Button
          onClick={() => {
            setEditProduct(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
        >
          <Plus size={16} /> Nuevo producto
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          type="text"
          placeholder="Buscar por nombre o código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Producto
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Costo
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Precio
                </th>
                <th className="text-center px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Stock
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
                  <td colSpan={7} className="py-8 text-center">
                    <Spinner />
                  </td>
                </tr>
              ) : (
                filtered.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-white/5 hover:bg-white/2 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {product.categoryIcon ?? "📦"}
                        </span>
                        <div>
                          <p className="font-medium text-slate-200">
                            {product.name}
                          </p>
                          {product.barcode && (
                            <p className="text-xs text-slate-500 font-mono">
                              {product.barcode}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {product.categoryName ? (
                        <Badge color="blue">{product.categoryName}</Badge>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">
                      {formatCOP(product.costPrice)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-indigo-400">
                      {formatCOP(product.salePrice)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-mono font-bold">
                        {product.stock}
                      </span>
                      <span className="text-slate-500 text-xs">
                        {" "}
                        / {product.minStock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {stockBadge(product)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setAdjustProduct(product)}
                          className="p-1.5 text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded transition-colors"
                          title="Ajustar stock"
                        >
                          <TrendingDown size={14} />
                        </button>
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(product.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Footer */}
        <div className="flex gap-6 px-4 py-3 border-t border-white/5 bg-white/2 text-xs text-slate-400">
          <span>
            Valor inventario (costo):{" "}
            <span className="font-mono text-slate-200">
              {formatCOP(totalInventoryValue)}
            </span>
          </span>
          <span>
            Valor inventario (venta):{" "}
            <span className="font-mono text-emerald-400">
              {formatCOP(totalSaleValue)}
            </span>
          </span>
        </div>
      </div>

      {/* Product Form Modal */}
      {(showForm || editProduct) && (
        <Modal
          title={editProduct ? "Editar Producto" : "Nuevo Producto"}
          onClose={() => {
            setShowForm(false);
            setEditProduct(null);
          }}
          size="lg"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input
                label="Nombre"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <Input
              label="Código de barras"
              value={form.barcode}
              onChange={(e) => setForm({ ...form, barcode: e.target.value })}
            />
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
                Categoría
              </label>
              <select
                value={form.categoryId}
                onChange={(e) =>
                  setForm({ ...form, categoryId: e.target.value })
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Sin categoría</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Precio costo"
              type="number"
              value={form.costPrice}
              onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
            />
            <Input
              label="Precio venta"
              type="number"
              value={form.salePrice}
              onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
            />
            <Input
              label="Stock inicial"
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            />
            <Input
              label="Stock mínimo"
              type="number"
              value={form.minStock}
              onChange={(e) => setForm({ ...form, minStock: e.target.value })}
            />
            <div className="col-span-2">
              <Input
                label="Descripción"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="ghost"
              onClick={() => {
                setShowForm(false);
                setEditProduct(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editProduct ? "Guardar cambios" : "Crear producto"}
            </Button>
          </div>
        </Modal>
      )}

      {/* Stock Adjust Modal */}
      {adjustProduct && (
        <Modal
          title={`Ajustar stock — ${adjustProduct.name}`}
          onClose={() => setAdjustProduct(null)}
          size="sm"
        >
          <div className="space-y-4">
            <div className="card p-3 text-center">
              <p className="text-xs text-slate-400">Stock actual</p>
              <p className="font-mono text-2xl font-bold text-slate-100">
                {adjustProduct.stock} uds
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-2">
                Tipo de ajuste
              </label>
              <div className="flex gap-2">
                {["IN", "OUT", "ADJUSTMENT"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setAdjustForm({ ...adjustForm, type: t })}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                      adjustForm.type === t
                        ? "bg-indigo-500 text-white"
                        : "bg-white/5 text-slate-400 hover:bg-white/10"
                    }`}
                  >
                    {
                      {
                        IN: "+ Entrada",
                        OUT: "- Salida",
                        ADJUSTMENT: "= Ajuste",
                      }[t]
                    }
                  </button>
                ))}
              </div>
            </div>
            <Input
              label={
                adjustForm.type === "ADJUSTMENT"
                  ? "Nuevo stock total"
                  : "Cantidad"
              }
              type="number"
              value={adjustForm.quantity}
              onChange={(e) =>
                setAdjustForm({ ...adjustForm, quantity: e.target.value })
              }
            />
            <Input
              label="Motivo"
              value={adjustForm.reason}
              onChange={(e) =>
                setAdjustForm({ ...adjustForm, reason: e.target.value })
              }
              placeholder="Ej: Inventario físico, daño en mercancía..."
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setAdjustProduct(null)}>
                Cancelar
              </Button>
              <Button
                onClick={() =>
                  adjustMutation.mutate({
                    id: adjustProduct.id,
                    qty: parseInt(adjustForm.quantity),
                    type: adjustForm.type,
                    reason: adjustForm.reason,
                  })
                }
                loading={adjustMutation.isPending}
              >
                Aplicar ajuste
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default InventoryPage;

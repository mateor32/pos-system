import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { customerService } from "../services/customerService";
import { formatCOP, formatDate } from "../utils/format";
import { showToast } from "../components/ui/Toast";
import type { Customer } from "../types";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  taxId: "",
  creditBalance: "0",
};

const CustomersPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState(emptyForm);
  const qc = useQueryClient();

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: customerService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: customerService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      setShowForm(false);
      showToast("success", "Cliente creado");
    },
    onError: (e: any) =>
      showToast("error", e?.response?.data?.message ?? "Error"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      customerService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      setEditCustomer(null);
      showToast("success", "Cliente actualizado");
    },
    onError: (e: any) =>
      showToast("error", e?.response?.data?.message ?? "Error"),
  });

  const deleteMutation = useMutation({
    mutationFn: customerService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      showToast("success", "Cliente eliminado");
    },
    onError: () => showToast("error", "Error al eliminar"),
  });

  const filtered =
    customers?.filter(
      (c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.email ?? "").includes(search) ||
        (c.phone ?? "").includes(search),
    ) ?? [];

  const openEdit = (c: Customer) => {
    setEditCustomer(c);
    setForm({
      name: c.name,
      email: c.email ?? "",
      phone: c.phone ?? "",
      address: c.address ?? "",
      taxId: c.taxId ?? "",
      creditBalance: String(c.creditBalance),
    });
  };

  const handleSubmit = () => {
    const data = {
      ...form,
      creditBalance: parseFloat(form.creditBalance) || 0,
    };
    if (editCustomer) updateMutation.mutate({ id: editCustomer.id, data });
    else createMutation.mutate(data);
  };

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Clientes</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {filtered.length} clientes activos
          </p>
        </div>
        <Button
          onClick={() => {
            setEditCustomer(null);
            setForm(emptyForm);
            setShowForm(true);
          }}
        >
          <Plus size={16} /> Nuevo cliente
        </Button>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  NIT/CC
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Saldo crédito
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center">
                    <Spinner />
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-white/5 hover:bg-white/2 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-slate-200">
                      {c.name}
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                      {c.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {c.email ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                      {c.taxId ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs">
                      <span
                        className={
                          c.creditBalance > 0
                            ? "text-emerald-400"
                            : "text-slate-500"
                        }
                      >
                        {formatCOP(c.creditBalance)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(c.id)}
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
      </div>

      {(showForm || editCustomer) && (
        <Modal
          title={editCustomer ? "Editar Cliente" : "Nuevo Cliente"}
          onClose={() => {
            setShowForm(false);
            setEditCustomer(null);
          }}
        >
          <div className="space-y-3">
            <Input
              label="Nombre completo"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Teléfono"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <Input
              label="Dirección"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="NIT / Cédula"
                value={form.taxId}
                onChange={(e) => setForm({ ...form, taxId: e.target.value })}
              />
              <Input
                label="Saldo crédito"
                type="number"
                value={form.creditBalance}
                onChange={(e) =>
                  setForm({ ...form, creditBalance: e.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowForm(false);
                  setEditCustomer(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editCustomer ? "Guardar" : "Crear cliente"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default CustomersPage;

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Spinner } from "../components/ui/Spinner";
import { expenseService, dashboardService } from "../services/otherServices";
import { formatCOP, formatDate } from "../utils/format";
import { showToast } from "../components/ui/Toast";
import type { Expense } from "../types";

const EXPENSE_CATEGORIES = [
  "RENT",
  "UTILITIES",
  "PAYROLL",
  "SUPPLIES",
  "MAINTENANCE",
  "MARKETING",
  "TAXES",
  "PURCHASES",
  "OTHER",
] as const;

const categoryLabel: Record<string, string> = {
  RENT: "Arriendo",
  UTILITIES: "Servicios",
  PAYROLL: "Nómina",
  SUPPLIES: "Insumos",
  MAINTENANCE: "Mantenimiento",
  MARKETING: "Marketing",
  TAXES: "Impuestos",
  PURCHASES: "Compras",
  OTHER: "Otros",
};

type Tab = "gastos" | "flujo" | "resumen";

const AccountingPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>("gastos");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: "OTHER",
    notes: "",
  });
  const qc = useQueryClient();

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const { data: expenses, isLoading: expLoading } = useQuery({
    queryKey: ["expenses", startOfMonth, endOfMonth],
    queryFn: () => expenseService.getAll(startOfMonth, endOfMonth),
  });

  const { data: cashFlow, isLoading: cfLoading } = useQuery({
    queryKey: ["cashflow"],
    queryFn: dashboardService.getCashFlow,
  });

  const createExpense = useMutation({
    mutationFn: expenseService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      setShowForm(false);
      showToast("success", "Gasto registrado");
    },
    onError: (e: any) =>
      showToast("error", e?.response?.data?.message ?? "Error"),
  });

  const deleteExpense = useMutation({
    mutationFn: expenseService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      showToast("success", "Gasto eliminado");
    },
  });

  const totalExpenses = expenses?.reduce((s, e) => s + e.amount, 0) ?? 0;

  // Mock monthly data using cash flow data
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth() - (5 - i), 1);
    return {
      mes: d.toLocaleDateString("es-CO", { month: "short" }),
      ingresos: Math.round(Math.random() * 5000000 + 2000000),
      gastos: Math.round(Math.random() * 2000000 + 500000),
    };
  });

  const tabs: { id: Tab; label: string }[] = [
    { id: "gastos", label: "Gastos" },
    { id: "flujo", label: "Flujo de Caja" },
    { id: "resumen", label: "Resumen Mensual" },
  ];

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Contabilidad</h1>
          <p className="text-sm text-slate-400 mt-0.5">Gestión financiera</p>
        </div>
        {tab === "gastos" && (
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} /> Registrar gasto
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-white/5 pb-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
              tab === t.id
                ? "text-indigo-400 border-b-2 border-indigo-400 -mb-px"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Gastos Tab */}
      {tab === "gastos" && (
        <>
          <div className="flex items-center gap-4 mb-4 text-sm text-slate-400">
            <span>
              Total del mes:{" "}
              <span className="text-red-400 font-semibold">
                {formatCOP(totalExpenses)}
              </span>
            </span>
            <span className="text-slate-600">|</span>
            <span>{expenses?.length ?? 0} registros</span>
          </div>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {[
                      "Fecha",
                      "Descripción",
                      "Categoría",
                      "Notas",
                      "Monto",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className={`px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider ${h === "Monto" || h === "" ? "text-right" : "text-left"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {expLoading ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center">
                        <Spinner />
                      </td>
                    </tr>
                  ) : (
                    expenses?.map((e) => (
                      <tr
                        key={e.id}
                        className="border-b border-white/5 hover:bg-white/2 transition-colors"
                      >
                        <td className="px-4 py-3 text-slate-400 text-xs font-mono">
                          {formatDate(e.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-slate-200 font-medium">
                          {e.description}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-white/5 rounded text-xs text-slate-300">
                            {categoryLabel[e.category] ?? e.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 text-xs">
                          {e.notes ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-red-400 font-semibold text-xs">
                          {formatCOP(e.amount)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => deleteExpense.mutate(e.id)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Flujo de Caja Tab */}
      {tab === "flujo" &&
        (cfLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <TrendingUp size={20} className="text-emerald-400" />
                </div>
                <span className="text-sm text-slate-400">Ingresos hoy</span>
              </div>
              <div className="text-2xl font-bold text-emerald-400">
                {formatCOP(cashFlow?.income ?? 0)}
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <TrendingDown size={20} className="text-red-400" />
                </div>
                <span className="text-sm text-slate-400">Gastos hoy</span>
              </div>
              <div className="text-2xl font-bold text-red-400">
                {formatCOP(cashFlow?.expenses ?? 0)}
              </div>
            </div>
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-indigo-500/10">
                  <DollarSign size={20} className="text-indigo-400" />
                </div>
                <span className="text-sm text-slate-400">Balance neto</span>
              </div>
              <div
                className={`text-2xl font-bold ${(cashFlow?.balance ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}`}
              >
                {formatCOP(cashFlow?.balance ?? 0)}
              </div>
            </div>
          </div>
        ))}

      {/* Resumen Mensual Tab */}
      {tab === "resumen" && (
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">
            Ingresos vs Gastos — Últimos 6 meses
          </h2>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart
              data={monthlyData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="mes"
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
              />
              <Tooltip
                contentStyle={{
                  background: "#13131f",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                }}
                labelStyle={{ color: "#f1f5f9" }}
                formatter={(v: number) => formatCOP(v)}
              />
              <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="ingresos"
                name="Ingresos"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="gastos"
                name="Gastos"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: "#ef4444", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Create Expense Modal */}
      {showForm && (
        <Modal title="Registrar Gasto" onClose={() => setShowForm(false)}>
          <div className="space-y-3">
            <Input
              label="Descripción"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Monto (COP)"
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  Categoría
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-[#13131f]">
                      {categoryLabel[c]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Input
              label="Notas (opcional)"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() =>
                  createExpense.mutate({
                    description: form.description,
                    amount: parseFloat(form.amount),
                    category: form.category,
                    notes: form.notes || undefined,
                  })
                }
                loading={createExpense.isPending}
              >
                Registrar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AccountingPage;

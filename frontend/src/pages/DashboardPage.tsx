import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  ShoppingBag,
  BarChart2,
  DollarSign,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { StatCard } from "../components/ui/StatCard";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { dashboardService } from "../services/otherServices";
import { formatCOP } from "../utils/format";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444"];

const DashboardPage: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardService.getStats,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">Resumen del día</p>
      </div>

      {/* Low stock alert */}
      {(stats?.lowStockCount ?? 0) > 0 && (
        <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <AlertTriangle size={16} className="text-yellow-400 shrink-0" />
          <span className="text-sm text-yellow-300">
            <span className="font-semibold">
              {stats?.lowStockCount} productos
            </span>{" "}
            con stock bajo o agotado
          </span>
          <a
            href="/inventory"
            className="ml-auto text-xs text-yellow-400 hover:underline"
          >
            Ver inventario →
          </a>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={<DollarSign size={18} />}
          label="Ventas hoy"
          value={formatCOP(stats?.salesToday)}
          color="indigo"
        />
        <StatCard
          icon={<ShoppingBag size={18} />}
          label="Transacciones"
          value={String(stats?.transactionsToday ?? 0)}
          color="emerald"
        />
        <StatCard
          icon={<BarChart2 size={18} />}
          label="Ticket promedio"
          value={formatCOP(stats?.avgTicket)}
          color="yellow"
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Ganancia hoy"
          value={formatCOP(stats?.profitToday)}
          color={(stats?.profitToday ?? 0) >= 0 ? "emerald" : "red"}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        {/* Bar Chart */}
        <div className="card p-5 xl:col-span-2">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">
            Ventas — últimos 7 días
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.last7Days ?? []}>
              <XAxis
                dataKey="date"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: "#13131f",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                }}
                labelStyle={{ color: "#f1f5f9", fontSize: 12 }}
                formatter={(v: number) => [formatCOP(v), "Total"]}
              />
              <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">
            Métodos de pago
          </h3>
          {(stats?.paymentStats?.length ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={stats?.paymentStats ?? []}
                  dataKey="total"
                  nameKey="method"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                >
                  {stats?.paymentStats?.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  formatter={(v) => (
                    <span style={{ color: "#94a3b8", fontSize: 11 }}>{v}</span>
                  )}
                />
                <Tooltip
                  contentStyle={{
                    background: "#13131f",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                  }}
                  formatter={(v: number) => [formatCOP(v), "Total"]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-slate-500 text-sm">
              Sin datos hoy
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="card p-5">
        <h3 className="text-sm font-semibold text-slate-200 mb-4">
          Top productos del día
        </h3>
        {(stats?.topProducts?.length ?? 0) > 0 ? (
          <div className="flex flex-col gap-2">
            {stats?.topProducts?.map((p, i) => (
              <div
                key={p.productId}
                className="flex items-center gap-4 py-2 border-b border-white/5 last:border-0"
              >
                <span className="w-6 h-6 bg-indigo-500/15 text-indigo-400 rounded-full text-xs flex items-center justify-center font-bold shrink-0">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm text-slate-200">
                  {p.productName}
                </span>
                <Badge color="blue">{p.quantitySold} uds</Badge>
                <span className="font-mono text-sm text-emerald-400">
                  {formatCOP(p.totalRevenue)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Sin ventas registradas hoy</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Receipt,
  Users,
  BookOpen,
  Settings,
  LogOut,
  Store,
} from "lucide-react";
import clsx from "clsx";
import { useAuthStore } from "../../store/authStore";

const navItems = [
  { to: "/", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
  { to: "/pos", icon: <ShoppingCart size={18} />, label: "Punto de Venta" },
  { to: "/inventory", icon: <Package size={18} />, label: "Inventario" },
  { to: "/sales", icon: <Receipt size={18} />, label: "Ventas" },
  { to: "/customers", icon: <Users size={18} />, label: "Clientes" },
  { to: "/accounting", icon: <BookOpen size={18} />, label: "Contabilidad" },
  { to: "/settings", icon: <Settings size={18} />, label: "Configuración" },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-60 h-screen bg-[#0f0f1a] border-r border-white/5 flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Store size={16} className="text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-slate-100">POS System</span>
            <p className="text-[10px] text-slate-500">Punto de Venta</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150",
                isActive
                  ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/25"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-7 h-7 bg-indigo-500/20 rounded-full flex items-center justify-center text-xs font-bold text-indigo-400">
            {user?.fullName?.charAt(0) ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">
              {user?.fullName}
            </p>
            <p className="text-[10px] text-slate-500">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-all duration-150"
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

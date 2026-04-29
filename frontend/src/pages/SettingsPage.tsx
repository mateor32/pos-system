import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Modal } from "../components/ui/Modal";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { categoryService } from "../services/otherServices";
import { authService } from "../services/authService";
import { showToast } from "../components/ui/Toast";
import type { Category } from "../types";

type Tab = "negocio" | "usuarios" | "categorias";

const ROLE_COLORS: Record<string, "blue" | "purple" | "green"> = {
  ADMIN: "purple",
  MANAGER: "blue",
  CASHIER: "green",
};

const SettingsPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>("categorias");
  const [catForm, setCatForm] = useState({
    name: "",
    color: "#6366f1",
    icon: "",
  });
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [showCatForm, setShowCatForm] = useState(false);
  const [userForm, setUserForm] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    role: "CASHIER",
  });
  const [showUserForm, setShowUserForm] = useState(false);
  const qc = useQueryClient();

  const { data: categories, isLoading: catLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getAll,
  });

  const createCat = useMutation({
    mutationFn: categoryService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setShowCatForm(false);
      showToast("success", "Categoría creada");
    },
    onError: (e: any) =>
      showToast("error", e?.response?.data?.message ?? "Error"),
  });

  const updateCat = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      categoryService.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setEditCat(null);
      showToast("success", "Categoría actualizada");
    },
    onError: (e: any) =>
      showToast("error", e?.response?.data?.message ?? "Error"),
  });

  const deleteCat = useMutation({
    mutationFn: categoryService.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      showToast("success", "Categoría eliminada");
    },
    onError: () => showToast("error", "Error al eliminar"),
  });

  const registerUser = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      setShowUserForm(false);
      showToast("success", "Usuario creado");
    },
    onError: (e: any) =>
      showToast("error", e?.response?.data?.message ?? "Error"),
  });

  const openEditCat = (c: Category) => {
    setEditCat(c);
    setCatForm({
      name: c.name,
      color: c.color ?? "#6366f1",
      icon: c.icon ?? "",
    });
    setShowCatForm(true);
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "categorias", label: "Categorías" },
    { id: "usuarios", label: "Usuarios" },
    { id: "negocio", label: "Negocio" },
  ];

  return (
    <div className="p-6 fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-100">Configuración</h1>
          <p className="text-sm text-slate-400 mt-0.5">Gestión del sistema</p>
        </div>
        {tab === "categorias" && (
          <Button
            onClick={() => {
              setEditCat(null);
              setCatForm({ name: "", color: "#6366f1", icon: "" });
              setShowCatForm(true);
            }}
          >
            <Plus size={16} /> Nueva categoría
          </Button>
        )}
        {tab === "usuarios" && (
          <Button onClick={() => setShowUserForm(true)}>
            <Plus size={16} /> Nuevo usuario
          </Button>
        )}
      </div>

      <div className="flex gap-1 mb-6 border-b border-white/5">
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

      {/* Categorías */}
      {tab === "categorias" && (
        <div className="card overflow-hidden">
          {catLoading ? (
            <div className="py-8 flex justify-center">
              <Spinner />
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {categories?.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-white/2 transition-colors"
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: c.color ?? "#6366f1" }}
                  />
                  <span className="text-slate-200 font-medium flex-1">
                    {c.name}
                  </span>
                  {c.icon && (
                    <span className="text-slate-500 text-xs">{c.icon}</span>
                  )}
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditCat(c)}
                      className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteCat.mutate(c.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Usuarios */}
      {tab === "usuarios" && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["Usuario", "Nombre completo", "Rol", "Estado"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Users shown here are seeded; real app would fetch from API */}
                {[
                  {
                    username: "admin",
                    fullName: "Administrador",
                    role: "ADMIN",
                    active: true,
                  },
                  {
                    username: "gerente",
                    fullName: "Gerente General",
                    role: "MANAGER",
                    active: true,
                  },
                  {
                    username: "cajero",
                    fullName: "Cajero Principal",
                    role: "CASHIER",
                    active: true,
                  },
                ].map((u) => (
                  <tr
                    key={u.username}
                    className="border-b border-white/5 hover:bg-white/2 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-300">
                      {u.username}
                    </td>
                    <td className="px-4 py-3 text-slate-200 font-medium">
                      {u.fullName}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={ROLE_COLORS[u.role] ?? "gray"}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color="green">Activo</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Negocio */}
      {tab === "negocio" && (
        <div className="card p-6 max-w-lg space-y-4">
          <Input label="Nombre del negocio" defaultValue="Mi Tienda POS" />
          <Input
            label="NIT / RUT"
            defaultValue=""
            placeholder="900.123.456-7"
          />
          <Input label="Dirección" defaultValue="" />
          <Input label="Teléfono" defaultValue="" />
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">
              Moneda
            </label>
            <select
              disabled
              className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-300 focus:outline-none opacity-60"
            >
              <option>COP — Peso Colombiano</option>
            </select>
          </div>
          <Input label="IVA por defecto (%)" type="number" defaultValue="19" />
          <Input
            label="Mensaje en recibo"
            defaultValue="¡Gracias por su compra!"
          />
          <div className="pt-2">
            <Button
              onClick={() => showToast("success", "Configuración guardada")}
            >
              Guardar cambios
            </Button>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCatForm && (
        <Modal
          title={editCat ? "Editar Categoría" : "Nueva Categoría"}
          size="sm"
          onClose={() => {
            setShowCatForm(false);
            setEditCat(null);
          }}
        >
          <div className="space-y-3">
            <Input
              label="Nombre"
              value={catForm.name}
              onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
            />
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={catForm.color}
                  onChange={(e) =>
                    setCatForm({ ...catForm, color: e.target.value })
                  }
                  className="w-10 h-9 rounded cursor-pointer border border-white/10 bg-transparent"
                />
                <span className="text-xs font-mono text-slate-400">
                  {catForm.color}
                </span>
              </div>
            </div>
            <Input
              label="Ícono (emoji)"
              value={catForm.icon}
              onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
              placeholder="🛒"
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowCatForm(false);
                  setEditCat(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                onClick={() =>
                  editCat
                    ? updateCat.mutate({ id: editCat.id, data: catForm })
                    : createCat.mutate(catForm)
                }
                loading={createCat.isPending || updateCat.isPending}
              >
                {editCat ? "Guardar" : "Crear"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* User Modal */}
      {showUserForm && (
        <Modal
          title="Nuevo Usuario"
          size="sm"
          onClose={() => setShowUserForm(false)}
        >
          <div className="space-y-3">
            <Input
              label="Nombre completo"
              value={userForm.fullName}
              onChange={(e) =>
                setUserForm({ ...userForm, fullName: e.target.value })
              }
            />
            <Input
              label="Usuario"
              value={userForm.username}
              onChange={(e) =>
                setUserForm({ ...userForm, username: e.target.value })
              }
            />
            <Input
              label="Email"
              type="email"
              value={userForm.email}
              onChange={(e) =>
                setUserForm({ ...userForm, email: e.target.value })
              }
            />
            <Input
              label="Contraseña"
              type="password"
              value={userForm.password}
              onChange={(e) =>
                setUserForm({ ...userForm, password: e.target.value })
              }
            />
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Rol
              </label>
              <select
                value={userForm.role}
                onChange={(e) =>
                  setUserForm({ ...userForm, role: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="CASHIER" className="bg-[#13131f]">
                  Cajero
                </option>
                <option value="MANAGER" className="bg-[#13131f]">
                  Gerente
                </option>
                <option value="ADMIN" className="bg-[#13131f]">
                  Administrador
                </option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowUserForm(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => registerUser.mutate(userForm)}
                loading={registerUser.isPending}
              >
                Crear usuario
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SettingsPage;

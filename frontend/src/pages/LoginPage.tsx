import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Store } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/authService";
import { showToast } from "../components/ui/Toast";
import { ToastContainer } from "../components/ui/Toast";

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    setLoading(true);
    setError("");
    try {
      const user = await authService.login(username, password);
      setAuth(user);
      navigate("/");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Credenciales inválidas";
      setError(msg);
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <ToastContainer />
      <div className="w-full max-w-sm fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center mb-4 shadow-glow">
            <Store size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">POS System</h1>
          <p className="text-sm text-slate-400 mt-1">Ingresa a tu cuenta</p>
        </div>

        {/* Form */}
        <div className="card p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Usuario"
              type="text"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <div className="px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                {error}
              </div>
            )}
            <Button type="submit" loading={loading} size="lg" className="mt-2">
              Ingresar
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          admin / admin123 · cajero / cajero123
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

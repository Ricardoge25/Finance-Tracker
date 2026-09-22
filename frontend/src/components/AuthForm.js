'use client';

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, CheckCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AuthForm({ initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  function switchMode(newMode) {
    setMode(newMode);
    setError("");
    setSuccessMessage("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (mode === "register") {
        await apiFetch("/auth/register", {
          method: "POST",
          body: JSON.stringify({ fullName, email, password }),
        });
        setSuccessMessage("Cuenta creada. Ahora inicia sesión.");
        setMode("login");
        setPassword("");
      } else {
        const data = await apiFetch("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });
        login(data.token, data.user);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#070A0F] flex flex-col lg:flex-row">

      {/* Panel izquierdo - marketing */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-10 xl:p-16 2xl:p-24 relative overflow-hidden"
        style={{
          background:
            "radial-gradient(circle at 25% 35%, rgba(45,212,191,0.18), transparent 55%), linear-gradient(180deg, #0B0F17 0%, #070A0F 100%)",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-[#2DD4BF] flex items-center justify-center font-bold text-slate-950 text-xl">
            ❖
          </div>
          <span className="text-xl font-bold text-white tracking-wide">moneta.</span>
        </div>

        <div className="space-y-5 xl:space-y-6 max-w-md xl:max-w-lg">
          <div className="flex items-center gap-2 text-[11px] xl:text-xs font-semibold text-[#2DD4BF] tracking-wider uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]" />
            Tu dinero, a tu manera
          </div>
          <h1 className="text-3xl xl:text-5xl 2xl:text-6xl font-black text-white leading-tight">
            Una vida financiera más{" "}
            <span className="text-[#2DD4BF]">intencional.</span>
          </h1>
          <p className="text-slate-400 text-sm xl:text-lg">
            Organiza, entiende y haz crecer tu dinero desde un solo lugar diseñado para ti.
          </p>

          <div className="space-y-3 pt-2">
            {["Visión clara de tus finanzas", "Tus datos, siempre protegidos", "Decisiones mejores cada día"].map((text) => (
              <div key={text} className="flex items-center gap-3 text-sm xl:text-base text-slate-300">
                <CheckCircle2 className="w-4 h-4 xl:w-5 xl:h-5 text-[#2DD4BF] flex-shrink-0" />
                {text}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs xl:text-sm text-slate-500">
          <ShieldCheck className="w-4 h-4 text-[#2DD4BF]" />
          Privacidad por diseño
        </div>
      </div>

      {/* Panel derecho - formulario */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-20">
        <div className="w-full max-w-sm xl:max-w-md 2xl:max-w-lg">
          <p className="text-[11px] xl:text-xs font-semibold text-[#2DD4BF] tracking-wider uppercase mb-2">
            {mode === "login" ? "Bienvenido de nuevo" : "Crea tu cuenta"}
          </p>
          <h2 className="text-xl xl:text-3xl font-bold text-white mb-2">
            {mode === "login" ? "Tu dinero te espera." : "Empecemos hoy mismo."}
          </h2>
          <p className="text-sm xl:text-base text-slate-400 mb-6 xl:mb-8">
            {mode === "login"
              ? "Entra para continuar tomando mejores decisiones."
              : "Organiza tus finanzas desde el primer día."}
          </p>

          <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 mb-6 xl:mb-8">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 py-2 xl:py-2.5 rounded-lg text-sm xl:text-base font-semibold transition-all ${
                mode === "login" ? "bg-slate-800 text-white" : "text-slate-500"
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`flex-1 py-2 xl:py-2.5 rounded-lg text-sm xl:text-base font-semibold transition-all ${
                mode === "register" ? "bg-slate-800 text-white" : "text-slate-500"
              }`}
            >
              Crear cuenta
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-lg">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 xl:space-y-5">
            {mode === "register" && (
              <div>
                <label className="block text-xs xl:text-sm font-medium text-slate-400 mb-1.5">Nombre completo</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 xl:py-3 text-sm xl:text-base text-slate-100 focus:outline-none focus:border-[#2DD4BF]"
                  placeholder="Juan Pérez"
                />
              </div>
            )}

            <div>
              <label className="block text-xs xl:text-sm font-medium text-slate-400 mb-1.5">Correo electrónico</label>
              <div className="relative">
                <Mail className="w-4 h-4 xl:w-5 xl:h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 xl:pl-12 pr-4 py-2.5 xl:py-3 text-sm xl:text-base text-slate-100 focus:outline-none focus:border-[#2DD4BF]"
                  placeholder="tu@correo.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs xl:text-sm font-medium text-slate-400 mb-1.5">Contraseña</label>
              <div className="relative">
                <Lock className="w-4 h-4 xl:w-5 xl:h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 xl:pl-12 pr-10 py-2.5 xl:py-3 text-sm xl:text-base text-slate-100 focus:outline-none focus:border-[#2DD4BF]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4 xl:w-5 xl:h-5" /> : <Eye className="w-4 h-4 xl:w-5 xl:h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2DD4BF] hover:bg-[#26b8a5] text-slate-950 font-bold py-2.5 xl:py-3.5 rounded-xl text-sm xl:text-base transition-all disabled:opacity-50 mt-2"
            >
              {loading
                ? (mode === "login" ? "Ingresando..." : "Creando cuenta...")
                : (mode === "login" ? "Entrar a mi cuenta" : "Crear mi cuenta")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
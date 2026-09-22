'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, ArrowLeftRight, Tags, Settings, LogOut, X, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Cuentas", href: "/accounts", icon: Wallet },
  { name: "Transacciones", href: "/transactions", icon: ArrowLeftRight },
  { name: "Categorías", href: "/categories", icon: Tags },
];

function SidebarContent({ onNavigate }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <>
      <div>
        <p className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">
          Menú Principal
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm md:text-base font-medium transition-all ${
                  isActive
                    ? "bg-accent text-slate-950 font-semibold shadow-lg shadow-accent/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-950/60"
                } cursor-pointer`}
              >
                <Icon className="w-4 md:w-5 h-4 md:h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div>
        <Link
          href="/settings"
          className="flex items-center gap-2 md:gap-3 px-3 py-2.5 rounded-xl text-sm md:text-base font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 mb-3 md:mb-4 transition-all"
        >
          <Settings className="w-4 md:w-5 h-4 md:h-5" />
          Ajustes
        </Link>

        <div className="flex items-center justify-between p-2 md:p-3 rounded-xl bg-slate-900/50 border border-slate-800/50">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-6 md:w-9 h-6 md:h-9 rounded-full bg-amber-300 text-amber-950 font-bold flex items-center justify-center text-xs md:text-base shrink-0">
              {user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : "US"}
            </div>
            <div className="truncate">
              <p className="text-xs md:text-sm font-semibold text-white truncate">{user?.fullName || "Usuario"}</p>
              <p className="text-xs md:text-sm text-slate-500 truncate">{user?.email || "correo@ejemplo.com"}</p>
            </div>
          </div>
          <button
            onClick={logout} 
            className="text-slate-500 hover:text-rose-400 p-1 rounded-md transition-colors cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* DESKTOP: siempre visible, fijo en el flujo normal */}
      <aside className="hidden lg:flex w-64 bg-[#0B0F17] text-slate-300 flex-col justify-between p-4 border-r border-slate-800/60 h-screen sticky top-0 overflow-y-auto">
        <div className="flex items-center gap-2 px-3 py-4 mb-6">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold text-slate-950 text-xl">
            <Sparkles size={18} />
          </div>
          <span className="text-2xl font-bold text-white tracking-wide">
            Moneta<span className="text-accent">.</span>
          </span>
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <SidebarContent />
        </div>
      </aside>

      {/* MOBILE: drawer superpuesto, oculto por completo cuando isOpen es false */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-40 w-48 bg-[#0B0F17] text-slate-300 flex flex-col justify-between p-4 border-r border-slate-800/60 overflow-y-auto transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-3 py-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center font-bold text-slate-950">
              <Sparkles size={16} />
            </div>
            <span className="text-lg font-bold text-white tracking-wide">
              Moneta<span className="text-accent">.</span>
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <SidebarContent onNavigate={onClose} />
        </div>
      </aside>
    </>
  );
}
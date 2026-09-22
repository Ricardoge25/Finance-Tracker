'use client';

import { useEffect, useState } from "react";
import { Search, Bell } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const COLORS = ["#2DD4BF", "#A855F7", "#F97316", "#3B82F6", "#64748B", "#EAB308", "#EC4899"];

export default function DashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [metricsData, historyData] = await Promise.all([
          apiFetch("/api/dashboard/metrics"),
          apiFetch("/api/dashboard/history?days=30"),
        ]);
        setMetrics(metricsData);

        const startingPoint =
          metricsData.totalBalance -
          historyData.reduce((sum, d) => sum + parseFloat(d.net_change), 0);

        const withBalance = historyData.map((day) => ({
          date: formatShortDate(day.day),
          balance: startingPoint + parseFloat(day.cumulative_change),
        }));

        setHistory(withBalance);
      } catch (err) {
        console.error("Error cargando dashboard:", err);
        setError("No se pudieron cargar las métricas del dashboard.");
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  function formatShortDate(isoDate) {
    return new Date(isoDate).toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
  }

  function formatCurrency(val) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(val || 0);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-fondo">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-fondo min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("es-CO", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="flex-1 bg-fondo text-slate-100 min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] md:text-xs text-slate-400 capitalize">{today}</p>
          <h1 className="text-base lg:text-2xl font-bold text-white flex items-center gap-2">
            Buenos días, {user?.fullName?.split(" ")[0] || "Usuario"}{" "}
            <span className="inline-block text-sm md:text-xl px-1.5 py-0.5 rounded text-slate-400 font-normal">👋🏼</span>
          </h1>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button className="p-1.5 md:p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors">
            <Search className="w-3 md:w-4 h-3 md:h-4" />
          </button>
          <button className="p-1.5 md:p-2.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors relative">
            <Bell className="w-3 md:w-4 h-3 md:h-4" />
            <span className="w-1 h-1 rounded-full bg-accent absolute top-1 right-1 md:top-2 md:right-2" />
          </button>
          <div className="w-6 md:w-9 h-6 md:h-9 rounded-full bg-amber-200 text-amber-950 font-bold flex items-center justify-center text-xs md:text-sm border border-amber-300">
            {user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : "US"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 lg:gap-5">
        <div className="bg-primary border border-slate-800/80 rounded-2xl p-3 md:p-5">
          <p className="text-[10px] md:text-sm text-slate-400 font-medium">Patrimonio total</p>
          <p className="text-lg md:text-2xl lg:text-3xl font-extrabold text-white mt-3">{formatCurrency(metrics?.totalBalance)}</p>
        </div>
        <div className="bg-primary border border-slate-800/80 rounded-2xl p-3 md:p-5">
          <p className="text-[10px] md:text-sm text-slate-400 font-medium">Ingresos del mes</p>
          <p className="text-lg md:text-2xl lg:text-3xl font-extrabold text-white mt-3">{formatCurrency(metrics?.monthlyIncome)}</p>
        </div>
        <div className="bg-primary border border-slate-800/80 rounded-2xl p-3 md:p-5">
          <p className="text-[10px] md:text-sm text-slate-400 font-medium">Gastos del mes</p>
          <p className="text-lg md:text-2xl lg:text-3xl font-extrabold text-white mt-3">{formatCurrency(metrics?.monthlyExpenses)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-5">
        <div className="lg:col-span-2 bg-primary border border-slate-800/80 rounded-2xl p-5">
          <h3 className="text-base md:text-lg font-semibold text-slate-200">Flujo de dinero</h3>
          <p className="text-xs text-slate-500 mb-4">Últimos 30 días</p>
          <div className="h-56 sm:h-64 w-full">
            {history.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                Aún no hay suficientes datos para mostrar el flujo.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#475569" fontSize={11} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "8px" }} />
                  <Area type="monotone" dataKey="balance" stroke="#2DD4BF" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-primary border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base md:text-lg font-semibold text-slate-200">Distribución de gastos</h3>
            <p className="text-xs text-slate-500">Este mes</p>
          </div>

          {!metrics?.categoryDistribution?.length ? (
            <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
              Sin gastos este mes.
            </div>
          ) : (
            <>
              <div className="h-48 my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.categoryDistribution}
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="total"
                      nameKey="category_name"
                    >
                      {metrics.categoryDistribution.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#0F172A", borderColor: "#334155", borderRadius: "8px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {metrics.categoryDistribution.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-slate-400 truncate">{cat.category_name}</span>
                    </div>
                    <span className="font-semibold text-slate-200 shrink-0 ml-2">{formatCurrency(cat.total)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-fondo border border-slate-800/80 rounded-2xl p-5">
        <h3 className="text-lg font-semibold text-slate-200 mb-4">Transacciones recientes</h3>
        {!metrics?.recentTransactions?.length ? (
          <p className="text-slate-500 text-sm">No hay transacciones recientes.</p>
        ) : (
          <div className="space-y-3">
            {metrics.recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{tx.description || tx.category_name}</p>
                  <p className="text-xs text-slate-500 truncate">
                    {tx.category_name} · {new Date(tx.transaction_date).toLocaleDateString("es-CO")}
                  </p>
                </div>
                <span className={`text-sm font-bold shrink-0 ${tx.type === "INGRESO" ? "text-emerald-400" : "text-rose-400"}`}>
                  {tx.type === "INGRESO" ? "+" : "-"}{formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
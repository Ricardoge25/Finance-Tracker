'use client';

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import Modal from "@/components/Modal";

const ACCOUNT_TYPES = ["AHORROS", "CORRIENTE", "EFECTIVO", "INVERSIÓN"];
const CURRENCIES = ["COP", "USD", "EUR"];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "", type: "AHORROS", balance: "", currency: "COP",
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadAccounts() {
    try {
      setLoading(true);
      const data = await apiFetch("/api/accounts");
      setAccounts(data);
      setError(null);
    } catch (err) {
      console.error("Error cargando cuentas:", err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      await apiFetch("/api/accounts", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          balance: parseFloat(formData.balance) || 0,
        }),
      });
      setIsModalOpen(false);
      setFormData({ name: "", type: "AHORROS", balance: "", currency: "COP" });
      loadAccounts();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar esta cuenta? Esta acción no se puede deshacer.")) return;

    try {
      await apiFetch(`/api/accounts/${id}`, { method: "DELETE" });
      loadAccounts();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2DD4BF]" />
      </div>
    );
  }

  return (
    <div className="bg-[#070A0F] min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white">Mis Cuentas</h1>
          <p className="text-sm text-slate-400">Balance general de tus fuentes de dinero</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#2DD4BF] hover:bg-[#26b8a5] text-slate-950 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-[#2DD4BF]/10 flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Nueva Cuenta
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {!error && accounts.length === 0 ? (
        <div className="bg-[#0D121F] rounded-2xl border border-slate-800/80 p-12 text-center">
          <p className="text-slate-400 text-sm">No hay cuentas registradas todavía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-[#0D121F] border border-slate-800/80 hover:border-slate-700 p-6 rounded-2xl transition-all shadow-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#2DD4BF]/5 rounded-bl-full pointer-events-none group-hover:bg-[#2DD4BF]/10 transition-all" />

              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2DD4BF] bg-[#2DD4BF]/10 px-2.5 py-1 rounded-md border border-[#2DD4BF]/20">
                    {acc.currency}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">{acc.name}</h3>
                </div>
                <button
                  onClick={() => handleDelete(acc.id)}
                  className="text-slate-600 hover:text-rose-400 transition-colors p-1"
                  title="Eliminar cuenta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                {acc.type}
              </span>

              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Balance Disponible</p>
                <p className={`text-2xl font-black mt-1 ${acc.balance < 0 ? "text-rose-400" : "text-white"}`}>
                  ${acc.balance.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva Cuenta">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Nombre</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-[#2DD4BF]"
              placeholder="Cuenta Bancolombia"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Tipo</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-[#2DD4BF]"
            >
              {ACCOUNT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Balance Inicial</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.balance}
              onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-[#2DD4BF]"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Moneda</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-[#2DD4BF]"
            >
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#2DD4BF] hover:bg-[#26b8a5] text-slate-950 font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 mt-2"
          >
            {submitting ? "Creando..." : "Crear Cuenta"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
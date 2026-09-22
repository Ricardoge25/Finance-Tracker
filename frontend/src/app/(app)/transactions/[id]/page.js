'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ArrowUpRight, ArrowDownLeft, RotateCcw } from "lucide-react";
import { apiFetch } from "@/lib/api";
import Modal from "@/components/Modal";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    accountId: "", categoryId: "", type: "GASTO", amount: "", description: "",
    transactionDate: new Date().toISOString().slice(0, 10),
  });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadAll() {
    try {
      setLoading(true);
      const [txs, accs, cats] = await Promise.all([
        apiFetch("/api/transactions"),
        apiFetch("/api/accounts"),
        apiFetch("/api/categories"),
      ]);
      setTransactions(txs);
      setAccounts(accs);
      setCategories(cats);
      setError(null);
    } catch (err) {
      console.error("Error cargando transacciones:", err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const filteredCategories = categories.filter((c) => c.type === formData.type);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      await apiFetch("/api/transactions", {
        method: "POST",
        body: JSON.stringify({
          ...formData,
          accountId: parseInt(formData.accountId),
          categoryId: parseInt(formData.categoryId),
          amount: parseFloat(formData.amount),
        }),
      });
      setIsModalOpen(false);
      setFormData({
        accountId: "", categoryId: "", type: "GASTO", amount: "", description: "",
        transactionDate: new Date().toISOString().slice(0, 10),
      });
      loadAll();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReverse(id) {
    const reason = prompt("Motivo de la reversión (obligatorio):");
    if (!reason || reason.trim() === "") return;

    try {
      await apiFetch(`/api/transactions/${id}/reverse`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      loadAll();
    } catch (err) {
      alert(err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="bg-fondo min-h-screen p-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Transacciones</h1>
          <p className="text-sm text-slate-400">Historial completo de tus movimientos</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-accent hover:bg-second-accent text-slate-950 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-accent/10 flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-3" />
          Nueva Transacción
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {!error && transactions.length === 0 ? (
        <div className="bg-primary rounded-2xl border border-slate-800/80 p-12 text-center">
          <p className="text-slate-400 text-sm">No hay transacciones registradas todavía.</p>
        </div>
      ) : (
        <div className="bg-primary border border-slate-800/80 rounded-2xl overflow-hidden">
          {transactions.map((tx) => {
            const isReversal = tx.reversed_transaction_id !== null;
            const wasReversed = transactions.some((t) => t.reversed_transaction_id === tx.id);
            const isIncome = tx.type === "INGRESO";

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between px-6 py-4 border-b border-slate-800/60 last:border-0 hover:bg-slate-900/40 transition-colors"
              >
                <Link href={`/transactions/${tx.id}`} className="flex items-center gap-4 flex-1 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isIncome ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {tx.description || tx.category_name}
                      {isReversal && (
                        <span className="ml-2 text-[10px] font-semibold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                          REVERSIÓN
                        </span>
                      )}
                      {wasReversed && (
                        <span className="ml-2 text-[10px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                          REVERTIDA
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {tx.category_name} · {tx.account_name} ·{" "}
                      {new Date(tx.transaction_date).toLocaleDateString("es-CO")}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-4 shrink-0">
                  <span className={`text-sm font-bold ${isIncome ? "text-emerald-400" : "text-rose-400"}`}>
                    {isIncome ? "+" : "-"}${Number(tx.amount).toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                  </span>

                  {!isReversal && !wasReversed && (
                    <button
                      onClick={() => handleReverse(tx.id)}
                      className="text-slate-500 hover:text-amber-400 transition-colors p-1.5 rounded-lg hover:bg-slate-800"
                      title="Revertir transacción"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva Transacción">
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "INGRESO", categoryId: "" })}
              className={`py-2 rounded-xl text-sm font-semibold transition-all ${
                formData.type === "INGRESO"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-slate-950 text-slate-500 border border-slate-800"
              } cursor-pointer`}
            >
              Ingreso
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: "GASTO", categoryId: "" })}
              className={`py-2 rounded-xl text-sm font-semibold transition-all ${
                formData.type === "GASTO"
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                  : "bg-slate-950 text-slate-500 border border-slate-800"
              } cursor-pointer`}
            >
              Gasto
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Cuenta</label>
            <select
              required
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="">Selecciona una cuenta</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Categoría</label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-accent cursor-pointer"
            >
              <option value="">Selecciona una categoría</option>
              {filteredCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Monto</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-accent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Descripción (opcional)</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-accent"
              placeholder="Ej. Almuerzo con el equipo"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Fecha</label>
            <input
              type="date"
              required
              value={formData.transactionDate}
              onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-accent"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent hover:bg-second-accent text-slate-950 font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 mt-2 cursor-pointer"
          >
            {submitting ? "Guardando..." : "Crear Transacción"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
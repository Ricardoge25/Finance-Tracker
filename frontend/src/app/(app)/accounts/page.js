'use client';

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
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
  const [editingAccount, setEditingAccount] = useState(null);

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

  function openCreateModal() {
    setEditingAccount(null);

    setFormData({
      name: "",
      type: "AHORROS",
      balance: "",
      currency: "COP",
    });

    setFormError("");
    setIsModalOpen(true);
  }

  function openEditingModal(account) {
    setEditingAccount(account);

    setFormData({
      name: account.name,
      type: account.type,
      balance: String(account.balance),
      currency: account.currency,
    });

    setFormError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingAccount(null);
    setFormError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setFormError("");
    setSubmitting(true);

    try {
      const accountData = {
        ...formData,
        balance: parseFloat(formData.balance || 0,)
      };

      const url = editingAccount
        ? `/api/accounts/${editingAccount.id}`
        : "/api/accounts";

      const method = editingAccount ? "PUT" : "POST";

      await apiFetch(url, {
        method,
        body: JSON.stringify(accountData),
      });

      closeModal();

      setFormData({
        name: "",
        type: "AHORROS",
        balance: "",
        currency:"COP",
      });

      await loadAccounts();
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="bg-fondo min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white">Mis Cuentas</h1>
          <p className="text-sm text-slate-400">Balance general de tus fuentes de dinero</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-accent hover:bg-accent-hover text-slate-950 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-accent/10 flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 stroke-3" />
          Nueva Cuenta
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {!error && accounts.length === 0 ? (
        <div className="bg-primary rounded-2xl border border-slate-800/80 p-12 text-center">
          <p className="text-slate-400 text-sm">No hay cuentas registradas todavía.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-primary border border-slate-800/80 hover:border-slate-700 p-6 rounded-2xl transition-all shadow-xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-30 h-30 bg-accent/5 rounded-bl-full pointer-events-none group-hover:bg-accent/10 transition-all" />

              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-md border border-accent/20">
                    {acc.currency}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2">{acc.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditingModal(acc)}
                    className="text-slate-600 hover:text-accent transition-colors p-1"
                    title="Editar cuenta"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(acc.id)}
                    className="text-slate-600 hover:text-rose-400 transition-colors p-1"
                    title="Eliminar cuenta"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
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

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingAccount ? "Editar Cuenta" : "Nueva cuenta"}>
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-accent"
              placeholder="Cuenta Bancolombia"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Tipo</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-accent"
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
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-accent"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Moneda</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-accent"
            >
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent hover:bg-accent-hover text-slate-950 font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 mt-2"
          >
            {submitting ? editingAccount ? "Guardando..." : "Creando..." : editingAccount ? "Guardar cambios" : "Crear Cuenta"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, RotateCcw, Pencil, Wallet, Tag, Calendar, ArrowLeftRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import  Link  from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function TransactionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ description: "", categoryId: "" });
  const [editError, setEditError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const [tx, cats] = await Promise.all([
        apiFetch(`/api/transactions/${id}`),
        apiFetch("/api/categories"),
      ]);
      setTransaction(tx);
      setCategories(cats);
      setEditData({ description: tx.description || "", categoryId: tx.category_id || "" });
      setError(null);
    } catch (err) {
      setError("No se pudo cargar la transacción.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleReverse() {
    const reason = prompt("Motivo de la reversión (obligatorio):");
    if (!reason || reason.trim() === "") return;
    try {
      await apiFetch(`/api/transactions/${id}/reverse`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      router.push("/transactions");
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    setEditError("");
    setSaving(true);
    try {
      const payload = { description: editData.description };
      if (transaction.type !== "TRANSFERENCIA") {
        payload.categoryId = parseInt(editData.categoryId);
      }
      const updated = await apiFetch(`/api/transactions/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setTransaction(updated);
      setIsEditing(false);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="bg-fondo min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error || "Transacción no encontrada."}
        </div>
      </div>
    );
  }

  const isIncome = transaction.type === "INGRESO";
  const isTransfer = transaction.type === "TRANSFERENCIA";
  const isReversal = transaction.reversed_transaction_id !== null;
  const matchingCategories = categories.filter((c) => c.type === transaction.type);
  const initial = (transaction.description || transaction.category_name || "T").charAt(0).toUpperCase();

  return (
    <div className="bg-fondo min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">
      <Link
        href="/transactions"
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a transacciones
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Card principal */}
        <div className="lg:col-span-2 bg-primary border border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shrink-0 ${
                isTransfer ? "bg-blue-500/10 text-blue-400" : isIncome ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-400"
              }`}>
                {isTransfer ? <ArrowLeftRight className="w-5 h-5" /> : initial}
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
                  {isReversal ? "Reversión" : isTransfer ? "Transferencia" : isIncome ? "Ingreso" : "Gasto"}
                </p>
                <h2 className="text-lg font-bold text-white">
                  {transaction.description || transaction.category_name || "Movimiento"}
                </h2>
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-slate-500 hover:text-accent p-2 rounded-lg hover:bg-slate-900/60 transition-colors shrink-0 cursor-pointer"
                title="Editar"
              >
                <Pencil className="w-4 h-4" />
              </button>
            )}
          </div>

          {!isEditing && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Importe</p>
              <p className={`text-3xl sm:text-4xl font-black ${isTransfer ? "text-blue-400" : isIncome ? "text-emerald-400" : "text-rose-400"}`}>
                {isTransfer ? "" : isIncome ? "+" : "-"}${Number(transaction.amount).toLocaleString("es-CO", { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="space-y-4 pt-4 border-t border-slate-800/80">
              {editError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
                  {editError}
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Descripción</label>
                <input
                  type="text"
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-accent"
                />
              </div>
              {!isTransfer && (
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Categoría</label>
                  <select
                    value={editData.categoryId}
                    onChange={(e) => setEditData({ ...editData, categoryId: e.target.value })}
                    className="w-full appearance-none bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-accent"
                  >
                    {matchingCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <Select
                    value={editData.categoryId}
                    onChangeValue={(value) => setEditData({ ...editData, categoryId: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={editData.categoryId} />
                    </SelectTrigger>
                    <SelectContent>
                      {matchingCategories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <p className="text-xs text-slate-500">
                El monto, el tipo y las cuentas no se pueden editar directamente — usa "Revertir" si necesitas corregirlos.
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl transition-all">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="flex-1 bg-accent hover:bg-second-accent text-slate-950 font-bold py-2.5 rounded-xl transition-all disabled:opacity-50">
                  {saving ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-5 pt-4 border-t border-slate-800/80">
              <DetailItem icon={Calendar} label="Fecha" value={new Date(transaction.transaction_date).toLocaleString("es-CO")} />
              {isTransfer ? (
                <>
                  <DetailItem icon={Wallet} label="Origen" value={transaction.account_name} />
                  <DetailItem icon={Wallet} label="Destino" value={transaction.to_account_name} />
                </>
              ) : (
                <>
                  <DetailItem icon={Wallet} label="Cuenta" value={transaction.account_name} />
                  <DetailItem icon={Tag} label="Categoría" value={transaction.category_name} />
                </>
              )}
            </div>
          )}
        </div>

        {/* Columna lateral */}
        <div className="space-y-5">
          <div className="bg-primary border border-slate-800/80 rounded-2xl p-5">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-3">Estado</p>
            {isReversal ? (
              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm text-white font-semibold">Es una reversión</p>
                  <p className="text-xs text-slate-500 mt-1">{transaction.reversal_reason}</p>
                </div>
              </div>
              
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <p className="text-sm text-white">Movimiento activo</p>
              </div>
            )}
          </div>

          {!isReversal ? (
            <button
              onClick={handleReverse}
              className="w-full flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Revertir transacción
            </button>
          ) : (
            <Link 
              href={`/transactions/${transaction.reversed_transaction_id}`}
              className="w-full flex items-start justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-700 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer">
                <ArrowLeft className="w-4 h-4 mt-0.5" />
                Ver transacción original
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{label}</p>
        <p className="text-sm text-white mt-0.5">{value}</p>
      </div>
    </div>
  );
}
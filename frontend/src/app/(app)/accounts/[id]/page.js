'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, ArrowLeftRight } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function AccountDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [account, setAccount] = useState(null);
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [acc, txs] = await Promise.all([
          apiFetch(`/api/accounts/${id}`),
          apiFetch(`/api/accounts/${id}/transactions`),
        ]);
        setAccount(acc);
        setMovements(txs);
        setError(null);
      } catch (err) {
        setError("No se pudo cargar la cuenta.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  if (error || !account) {
    return (
      <div className="bg-fondo min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error || "Cuenta no encontrada."}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-fondo min-h-screen p-4 sm:p-6 lg:p-8 space-y-6">
      <button
        onClick={() => router.push("/accounts")}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a cuentas
      </button>

      <div className="bg-primary border border-slate-800/80 rounded-2xl p-6 sm:p-8">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-md border border-accent/20">
              {account.currency}
            </span>
            <h1 className="text-xl font-bold text-white mt-2">{account.name}</h1>
            <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 inline-block mt-2">
              {account.type}
            </span>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-slate-800/80">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Balance Disponible</p>
          <p className={`text-3xl font-black mt-1 ${account.balance < 0 ? "text-rose-400" : "text-white"}`}>
            ${account.balance.toLocaleString("es-CO", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Movimientos</h2>
        {movements.length === 0 ? (
          <div className="bg-primary rounded-2xl border border-slate-800/80 p-12 text-center text-slate-400 text-sm">
            Sin movimientos todavía
          </div>
        ) : (
          <div className="bg-primary border border-slate-800/80 rounded-2xl overflow-hidden">
            {movements.map((tx) => {
              const isTransfer = tx.type === "TRANSFERENCIA";
              const isIncomingTransfer = isTransfer && String(tx.to_account_id) === String(id);
              const isIncome = tx.type === "INGRESO" || isIncomingTransfer;

              return (
                <Link
                  key={tx.id}
                  href={`/transactions/${tx.id}`}
                  className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-slate-800/60 last:border-0 hover:bg-slate-900/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      isTransfer ? "bg-blue-500/10 text-blue-400" : isIncome ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                    }`}>
                      {isTransfer ? <ArrowLeftRight className="w-4 h-4" /> : isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {isTransfer
                          ? isIncomingTransfer ? `Desde: ${tx.account_name}` : `A: ${tx.to_account_name}`
                          : tx.description || tx.category_name
                        }
                      </p>
                      <p className="text-xs text-slate-500">{new Date(tx.transaction_date).toLocaleDateString("es-CO")}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-bold shrink-0 ${isIncome ? "text-emerald-400" : "text-rose-400"}`}>
                    {isIncome ? "+" : "-"}${Number(tx.amount).toLocaleString("es-CO", { minimumFractionDigits: 2 })}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
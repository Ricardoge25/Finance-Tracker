'use client';

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import Modal from "@/components/Modal";

const CATEGORY_TYPES = ["INGRESO", "GASTO"];
const PRESET_COLORS = ["#2DD4BF", "#ef4444", "#3b82f6", "#f97316", "#a855f7", "#eab308", "#ec4899"];

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", type: "GASTO", color: PRESET_COLORS[0] });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadCategories() {
    try {
      setLoading(true);
      const data = await apiFetch("/api/categories");
      setCategories(data);
      setError(null);
    } catch (err) {
      console.error("Error cargando categorías:", err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      await apiFetch("/api/categories", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setIsModalOpen(false);
      setFormData({ name: "", type: "GASTO", color: PRESET_COLORS[0] });
      loadCategories();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar esta categoría?")) return;

    try {
      await apiFetch(`/api/categories/${id}`, { method: "DELETE" });
      loadCategories();
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

  const ingresos = categories.filter((c) => c.type === "INGRESO");
  const gastos = categories.filter((c) => c.type === "GASTO");

  return (
    <div className="bg-[#070A0F] min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white">Categorías</h1>
          <p className="text-sm text-slate-400">Organiza tus ingresos y gastos por tipo</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#2DD4BF] hover:bg-[#26b8a5] text-slate-950 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-[#2DD4BF]/10 flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Nueva Categoría
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {!error && (
        <>
          <CategorySection title="Ingresos" items={ingresos} onDelete={handleDelete} />
          <CategorySection title="Gastos" items={gastos} onDelete={handleDelete} />
        </>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nueva Categoría">
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
              placeholder="Ej. Mascotas"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Tipo</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-[#2DD4BF]"
            >
              {CATEGORY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-full transition-all ${
                    formData.color === color ? "ring-2 ring-offset-2 ring-offset-[#0D121F] ring-white" : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#2DD4BF] hover:bg-[#26b8a5] text-slate-950 font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 mt-2"
          >
            {submitting ? "Creando..." : "Crear Categoría"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

function CategorySection({ title, items, onDelete }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">{title}</h2>
      {items.length === 0 ? (
        <div className="bg-[#0D121F] rounded-2xl border border-slate-800/80 p-6 text-center text-slate-500 text-sm">
          Sin categorías de este tipo todavía.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((cat) => (
            <div
              key={cat.id}
              className="bg-[#0D121F] border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-9 h-9 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color || "#64748b" }}
                />
                <span className="text-sm font-semibold text-white">{cat.name}</span>
              </div>
              <button
                onClick={() => onDelete(cat.id)}
                className="text-slate-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
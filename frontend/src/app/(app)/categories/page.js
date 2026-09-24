'use client';

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { apiFetch } from "@/lib/api";
import Modal from "@/components/Modal";

const CATEGORY_TYPES = ["INGRESO", "GASTO"];
const PRESET_COLORS = ["#2DD4BF", "#ef4444", "#3b82f6", "#f97316", "#a855f7", "#eab308", "#ec4899"];

const EMPTY_FORM = { name: "", type: "GASTO", color: PRESET_COLORS[0] };

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
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

  function openCreateModal() {
    setEditingCategory(null);
    setFormData(EMPTY_FORM);
    setFormError("");
    setIsModalOpen(true);
  }

  function openEditModal(cat) {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      type: cat.type,
      color: cat.color || PRESET_COLORS[0]
    });
    setFormError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setFormError("");
    setSubmitting(true);

    try {
      const categoryData = {
        ...formData,
      };

      const url = editingCategory
        ? `/api/categories/${editingCategory.id}`
        : "/api/categories";

      const method = editingCategory ? "PUT" : "POST";

      await apiFetch(url, {
        method,
        body: JSON.stringify(categoryData),
      });

      closeModal();

      setFormData({
        name: "",
        type: "GASTO",
        color: PRESET_COLORS[0],
      });

      await loadCategories();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar esta categoría? Esta acción no se puede deshacer.")) return;

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  const ingresos = categories.filter((c) => c.type === "INGRESO");
  const gastos = categories.filter((c) => c.type === "GASTO");

  return (
    <div className="bg-fondo min-h-screen p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-white">Categorías</h1>
          <p className="text-sm text-slate-400">Organiza tus ingresos y gastos por tipo</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-accent hover:bg-accent-hover text-slate-950 font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-accent/10 flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 stroke-3" />
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
          <CategorySection title="Ingresos" items={ingresos} onEdit={openEditModal} onDelete={handleDelete} />
          <CategorySection title="Gastos" items={gastos} onEdit={openEditModal} onDelete={handleDelete} />
        </>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCategory ? "Editar Categoría" : "Nueva Categoría"}>
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
              placeholder="Ej. Mascotas"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-400 mb-1">Tipo</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-accent"
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
                    formData.color === color ? "ring-2 ring-offset-2 ring-offset-primary ring-white" : ""
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-accent hover:bg-accent-hover text-slate-950 font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 mt-2"
          >
            {submitting ? editingCategory ? "Guardando..." : "Creando..." : editingCategory ? "Guardar cambios" : "Crear Categoría"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

function CategorySection({ title, items, onEdit, onDelete }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">{title}</h2>
      {items.length === 0 ? (
        <div className="bg-primary rounded-2xl border border-slate-800/80 p-6 text-center text-slate-500 text-sm">
          Sin categorías de este tipo todavía.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((cat) => (
            <div
              key={cat.id}
              className="bg-primary border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 flex items-center justify-between transition-all group"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-9 h-9 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color || "#64748b" }}
                />
                <span className="text-sm font-semibold text-white">{cat.name}</span>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => onEdit(cat)} className="text-slate-500 hover:text-accent p-1">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => onDelete(cat.id)} className="text-slate-400 hover:text-rose-400 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
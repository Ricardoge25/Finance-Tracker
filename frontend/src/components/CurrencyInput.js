'use client';

export default function CurrencyInput({ value, onChange, placeholder = "0" }) {
  function formatDisplay(rawValue) {
    if (!rawValue) return "";
    const numeric = rawValue.toString().replace(/\D/g, "");
    if (!numeric) return "";
    return new Intl.NumberFormat("es-CO").format(parseInt(numeric, 10));
  }

  function handleChange(e) {
    const digitsOnly = e.target.value.replace(/\D/g, "");
    onChange(digitsOnly ? parseInt(digitsOnly, 10) : "");
  }

  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
      <input
        type="text"
        inputMode="numeric"
        value={formatDisplay(value)}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-2.5 text-slate-100 focus:outline-none focus:border-accent"
      />
    </div>
  );
}
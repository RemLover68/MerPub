export default function TicketInput({ value, onChange }) {
  return (
    <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
      <span className="text-amber-600 text-lg">🔑</span>
      <div className="flex-1">
        <label className="block text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
          Ticket de autenticación
        </label>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Ej: F8537A18-6766-4DEF-9E59-426B4FEE2844"
          className="w-full text-sm font-mono bg-white border border-amber-200 rounded px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>
      <button
        type="button"
        onClick={() => onChange('F8537A18-6766-4DEF-9E59-426B4FEE2844')}
        className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-1.5 rounded font-medium transition-colors"
      >
        Usar demo
      </button>
    </div>
  )
}

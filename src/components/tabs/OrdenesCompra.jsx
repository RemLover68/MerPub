import { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import UrlDisplay from '../UrlDisplay'
import ResultsPanel from '../ResultsPanel'

const ESTADOS = [
  { value: '', label: 'Todos' },
  { value: 'Aceptada', label: 'Aceptada' },
  { value: 'Enviada', label: 'Enviada' },
  { value: 'Pendiente', label: 'Pendiente' },
  { value: 'Recepcionada', label: 'Recepcionada' },
  { value: 'Cancelada', label: 'Cancelada' },
]

function formatDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}${m}${y}`
}

export default function OrdenesCompra({ ticket }) {
  const { loading, error, data, rawUrl, call } = useApi()
  const [form, setForm] = useState({
    fecha: '',
    estado: '',
    codigo: '',
    CodigoOrganismo: '',
    CodigoProveedor: '',
    pagina: '1',
  })

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const submit = e => {
    e.preventDefault()
    const params = { ticket, pagina: form.pagina }
    if (form.fecha) params.fecha = formatDate(form.fecha)
    if (form.estado) params.estado = form.estado
    if (form.codigo) params.codigo = form.codigo
    if (form.CodigoOrganismo) params.CodigoOrganismo = form.CodigoOrganismo
    if (form.CodigoProveedor) params.CodigoProveedor = form.CodigoProveedor
    call('ordenesdecompra.json', params)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-800">Órdenes de Compra</h2>
        <p className="text-sm text-gray-500">Consulta órdenes de compra emitidas por organismos públicos.</p>
      </div>

      <form onSubmit={submit} className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Fecha</label>
          <input
            type="date"
            value={form.fecha}
            onChange={e => set('fecha', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Estado</label>
          <select
            value={form.estado}
            onChange={e => set('estado', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            {ESTADOS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Código OC</label>
          <input
            type="text"
            value={form.codigo}
            onChange={e => set('codigo', e.target.value)}
            placeholder="Ej: 750-1-LQ24"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Código organismo</label>
          <input
            type="text"
            value={form.CodigoOrganismo}
            onChange={e => set('CodigoOrganismo', e.target.value)}
            placeholder="Ej: 6945"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Código proveedor</label>
          <input
            type="text"
            value={form.CodigoProveedor}
            onChange={e => set('CodigoProveedor', e.target.value)}
            placeholder="Código interno"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Página</label>
          <input
            type="number"
            min="1"
            value={form.pagina}
            onChange={e => set('pagina', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="col-span-2 md:col-span-3 flex gap-2">
          <button
            type="submit"
            disabled={!ticket || loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            {loading ? 'Consultando...' : 'Consultar'}
          </button>
          <button
            type="button"
            onClick={() => setForm({ fecha: '', estado: '', codigo: '', CodigoOrganismo: '', CodigoProveedor: '', pagina: '1' })}
            className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Limpiar
          </button>
        </div>
      </form>

      <UrlDisplay url={rawUrl} />
      <ResultsPanel loading={loading} error={error} data={data} />
    </div>
  )
}

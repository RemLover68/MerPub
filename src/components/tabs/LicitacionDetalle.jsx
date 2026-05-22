import { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import UrlDisplay from '../UrlDisplay'
import ResultsPanel from '../ResultsPanel'

export default function LicitacionDetalle({ ticket }) {
  const { loading, error, data, rawUrl, call } = useApi()
  const [codigo, setCodigo] = useState('')

  const submit = e => {
    e.preventDefault()
    call('licitaciones.json', { ticket, codigo })
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-800">Detalle de Licitación</h2>
        <p className="text-sm text-gray-500">
          Obtén información completa de una licitación específica ingresando su código único.
        </p>
      </div>

      <form onSubmit={submit} className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 mb-1">Código de licitación</label>
          <input
            type="text"
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
            placeholder="Ej: 1234-56-LR24"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          type="submit"
          disabled={!ticket || !codigo || loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors h-10"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      <UrlDisplay url={rawUrl} />
      <ResultsPanel loading={loading} error={error} data={data} />
    </div>
  )
}

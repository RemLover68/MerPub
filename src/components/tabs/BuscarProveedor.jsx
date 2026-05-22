import { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import UrlDisplay from '../UrlDisplay'
import ResultsPanel from '../ResultsPanel'

export default function BuscarProveedor({ ticket }) {
  const { loading, error, data, rawUrl, call } = useApi()
  const [rut, setRut] = useState('')

  const submit = e => {
    e.preventDefault()
    call('Empresas/BuscarProveedor', { ticket, rutempresaproveedor: rut })
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-800">Buscar Proveedor</h2>
        <p className="text-sm text-gray-500">
          Obtén el código interno de un proveedor a partir de su RUT. Úsalo en otros endpoints como
          <code className="bg-gray-100 px-1 rounded mx-1 text-xs">CodigoProveedor</code>.
        </p>
      </div>

      <form onSubmit={submit} className="flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-gray-600 mb-1">RUT empresa proveedor</label>
          <input
            type="text"
            value={rut}
            onChange={e => setRut(e.target.value)}
            placeholder="Ej: 70.017.820-k"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <p className="text-xs text-gray-400 mt-1">Incluir puntos, guión y dígito verificador</p>
        </div>
        <button
          type="submit"
          disabled={!ticket || !rut || loading}
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

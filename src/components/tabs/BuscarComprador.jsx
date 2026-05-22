import { useApi } from '../../hooks/useApi'
import UrlDisplay from '../UrlDisplay'
import ResultsPanel from '../ResultsPanel'

export default function BuscarComprador({ ticket }) {
  const { loading, error, data, rawUrl, call } = useApi()

  const submit = e => {
    e.preventDefault()
    call('Empresas/BuscarComprador', { ticket })
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-gray-800">Buscar Comprador (Organismos Públicos)</h2>
        <p className="text-sm text-gray-500">
          Obtén el listado de todos los organismos públicos registrados en Mercado Público con sus códigos internos.
          Úsalos como <code className="bg-gray-100 px-1 rounded mx-1 text-xs">CodigoOrganismo</code> en otros endpoints.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
        Este endpoint no requiere filtros adicionales. Devuelve el listado completo de organismos compradores.
      </div>

      <form onSubmit={submit}>
        <button
          type="submit"
          disabled={!ticket || loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
        >
          {loading ? 'Consultando...' : 'Obtener organismos'}
        </button>
      </form>

      <UrlDisplay url={rawUrl} />
      <ResultsPanel loading={loading} error={error} data={data} />
    </div>
  )
}

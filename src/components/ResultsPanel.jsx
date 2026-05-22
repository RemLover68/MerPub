import { useState } from 'react'

function flattenObject(obj, prefix = '') {
  if (obj === null || obj === undefined) return {}
  if (typeof obj !== 'object') return { [prefix]: obj }
  return Object.entries(obj).reduce((acc, [key, val]) => {
    const newKey = prefix ? `${prefix}.${key}` : key
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      Object.assign(acc, flattenObject(val, newKey))
    } else {
      acc[newKey] = Array.isArray(val) ? JSON.stringify(val) : val
    }
    return acc
  }, {})
}

function TableView({ items }) {
  if (!items || items.length === 0) return <p className="text-gray-500 text-sm">Sin resultados</p>

  const flat = items.map(i => flattenObject(i))
  const allKeys = [...new Set(flat.flatMap(Object.keys))]

  return (
    <div className="overflow-auto max-h-96 rounded-lg border border-gray-200">
      <table className="min-w-full text-xs">
        <thead className="bg-gray-100 sticky top-0">
          <tr>
            {allKeys.map(k => (
              <th key={k} className="px-3 py-2 text-left font-semibold text-gray-600 whitespace-nowrap border-r border-gray-200 last:border-0">
                {k}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {flat.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              {allKeys.map(k => (
                <td key={k} className="px-3 py-1.5 text-gray-700 border-r border-gray-100 last:border-0 whitespace-nowrap max-w-xs truncate">
                  {row[k] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function JsonView({ data }) {
  return (
    <pre className="bg-gray-900 text-green-300 text-xs p-4 rounded-lg overflow-auto max-h-96 font-mono">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

export default function ResultsPanel({ loading, error, data }) {
  const [view, setView] = useState('table')

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-3 text-blue-600">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm font-medium">Consultando API...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700 font-semibold text-sm">Error al consultar</p>
        <p className="text-red-600 text-xs mt-1 font-mono">{error}</p>
      </div>
    )
  }

  if (!data) return null

  // Detect array of items to show in table
  const arrayKey = Object.keys(data).find(k => Array.isArray(data[k]))
  const items2 = arrayKey ? data[arrayKey] : null
  const total = data.Cantidad ?? data.cantidad ?? (items2 ? items2.length : null)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-green-600 font-semibold text-sm">✓ Respuesta recibida</span>
          {total !== null && (
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
              {total} resultado{total !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="flex gap-1">
          {['table', 'json'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`text-xs px-3 py-1 rounded font-medium transition-colors ${
                view === v ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {v === 'table' ? 'Tabla' : 'JSON'}
            </button>
          ))}
        </div>
      </div>

      {view === 'table' && items2 ? (
        <TableView items={items2} />
      ) : view === 'table' && !items2 ? (
        <TableView items={[data]} />
      ) : (
        <JsonView data={data} />
      )}
    </div>
  )
}

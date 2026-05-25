import { useState, useEffect } from 'react'
import { useScraper } from '../../hooks/useScraper'
import { pickDirectory, isSupported } from '../../utils/fileSystem'
import { buildDateRange, apiToIso } from '../../utils/dates'

function StatusBadge({ status }) {
  const map = {
    success: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
    pending: 'bg-gray-100 text-gray-500',
  }
  const labels = { success: '✓', error: '✗', pending: '…' }
  return (
    <span className={`inline-block text-xs px-1.5 py-0.5 rounded font-mono ${map[status] ?? map.pending}`}>
      {labels[status] ?? '?'}
    </span>
  )
}

function ProgressBar({ value, max }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className="w-full bg-gray-100 rounded-full h-2">
      <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function Scraper({ ticket }) {
  const { progress, running, stats, setDirHandle, dirHandle, loadProgress, start, stop } = useScraper()
  const [years, setYears] = useState(5)
  const [mode, setMode] = useState('scrape')
  const [dirName, setDirName] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  const supported = isSupported()

  const allDates = buildDateRange(years)
  const successCount = Object.values(progress).filter(d => d.status === 'success').length
  const errorCount = Object.values(progress).filter(d => d.status === 'error').length
  const unclosedCount = Object.values(progress).filter(d => d.hasUnclosed).length

  const handlePickDir = async () => {
    const dh = await pickDirectory()
    setDirHandle(dh)
    setDirName(dh.name)
    await loadProgress(dh)
  }

  const handleStart = () => {
    if (!dirHandle || !ticket) return
    start({ ticket, dirHandle, yearsBack: years, mode })
  }

  // Filtered list for display
  const displayDates = allDates.filter(d => {
    const entry = progress[d]
    if (filterStatus === 'all') return true
    if (filterStatus === 'success') return entry?.status === 'success'
    if (filterStatus === 'error') return entry?.status === 'error'
    if (filterStatus === 'pending') return !entry || entry.status === 'pending'
    if (filterStatus === 'unclosed') return entry?.hasUnclosed
    return true
  })

  if (!supported) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
        <strong>No compatible.</strong> El File System Access API requiere Chrome o Edge (no Firefox/Safari).
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-gray-800">Scraper histórico</h2>
        <p className="text-sm text-gray-500">
          Descarga todas las licitaciones por día y las guarda en archivos locales.
          Guarda el progreso para poder pausar y reanudar.
        </p>
      </div>

      {/* Config panel */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {/* Directory picker */}
        <div className="md:col-span-2 border border-gray-200 rounded-lg p-4 space-y-2">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Carpeta de destino</p>
          {dirName ? (
            <div className="flex items-center gap-2">
              <span className="text-green-600 text-sm">📁 {dirName}</span>
              <button type="button" onClick={handlePickDir} className="text-xs text-blue-500 hover:underline">Cambiar</button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handlePickDir}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Seleccionar carpeta…
            </button>
          )}
          <p className="text-xs text-gray-400">
            Se crearán archivos <code>licitaciones_DDMMAAAA.json</code>, <code>progress.json</code>
            y <code>changes_*.json</code>.
          </p>
        </div>

        {/* Options */}
        <div className="border border-gray-200 rounded-lg p-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Años hacia atrás</label>
            <select
              value={years}
              onChange={e => setYears(Number(e.target.value))}
              disabled={running}
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm bg-white"
            >
              {[1, 2, 3, 5, 7, 10].map(y => (
                <option key={y} value={y}>{y} {y === 1 ? 'año' : 'años'} ({y * 365} días)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Modo</label>
            <select
              value={mode}
              onChange={e => setMode(e.target.value)}
              disabled={running}
              className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm bg-white"
            >
              <option value="scrape">Scrape (solo días faltantes)</option>
              <option value="recheck">Re-chequear (días con no-cerradas)</option>
            </select>
            {mode === 'recheck' && (
              <p className="text-xs text-amber-600 mt-1">
                Consulta días con licitaciones aún abiertas y detecta cambios de estado.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      {Object.keys(progress).length > 0 && (
        <div className="grid grid-cols-4 gap-2 text-center">
          {[
            { label: 'Completados', value: successCount, color: 'text-green-600' },
            { label: 'Con errores', value: errorCount, color: 'text-red-600' },
            { label: 'Aún abiertos', value: unclosedCount, color: 'text-amber-600' },
            { label: 'Total días', value: allDates.length, color: 'text-gray-600' },
          ].map(s => (
            <div key={s.label} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Running progress */}
      {running && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-blue-700">
              Procesando día {stats.done + 1} de {stats.total}
              {stats.current && <span className="font-mono ml-2 text-blue-500">{apiToIso(stats.current)}</span>}
            </span>
            <span className="text-blue-500 text-xs">{stats.errors} errores</span>
          </div>
          <ProgressBar value={stats.done} max={stats.total} />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {!running ? (
          <button
            type="button"
            onClick={handleStart}
            disabled={!ticket || !dirHandle}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            {mode === 'recheck' ? '🔄 Re-chequear' : '▶ Iniciar scraping'}
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            ⏹ Pausar
          </button>
        )}
        {!ticket && <p className="text-xs text-amber-600 self-center">Necesitas ingresar tu ticket primero.</p>}
        {!dirHandle && ticket && <p className="text-xs text-gray-500 self-center">Selecciona una carpeta primero.</p>}
      </div>

      {/* Progress table */}
      {allDates.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Progreso por día</p>
            <div className="flex gap-1">
              {['all', 'success', 'error', 'pending', 'unclosed'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilterStatus(f)}
                  className={`text-xs px-2 py-1 rounded transition-colors ${
                    filterStatus === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {{ all: 'Todos', success: '✓ OK', error: '✗ Error', pending: 'Pendiente', unclosed: '⚡ Abiertas' }[f]}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-auto max-h-80 border border-gray-200 rounded-lg">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600">Fecha</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600">Estado</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600">Resultados</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600">Consultado</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600">Abiertas</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-600">Error</th>
                </tr>
              </thead>
              <tbody>
                {displayDates.slice(0, 500).map((date, i) => {
                  const entry = progress[date]
                  return (
                    <tr key={date} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-1.5 font-mono text-gray-700">{apiToIso(date)}</td>
                      <td className="px-3 py-1.5"><StatusBadge status={entry?.status ?? 'pending'} /></td>
                      <td className="px-3 py-1.5 text-gray-600">{entry?.count ?? '—'}</td>
                      <td className="px-3 py-1.5 text-gray-400">
                        {entry?.queriedAt ? new Date(entry.queriedAt).toLocaleString('es-CL') : '—'}
                      </td>
                      <td className="px-3 py-1.5">
                        {entry?.hasUnclosed ? <span className="text-amber-600">⚡ sí</span> : entry?.status === 'success' ? <span className="text-gray-400">no</span> : '—'}
                      </td>
                      <td className="px-3 py-1.5 text-red-500 font-mono">{entry?.error ?? ''}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {displayDates.length > 500 && (
              <p className="text-center text-xs text-gray-400 py-2">Mostrando 500 de {displayDates.length} días</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

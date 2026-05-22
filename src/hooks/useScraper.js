import { useState, useRef, useCallback } from 'react'
import { readJson, writeJson } from '../utils/fileSystem'
import { buildDateRange, apiToIso, today } from '../utils/dates'

const BASE = 'https://api.mercadopublico.cl/servicios/v1/publico'
const PROGRESS_FILE = 'progress.json'
const DELAY_MS = 1500 // ~0.67 req/s, safe para no trigger 429, well within 10k/day

// Estado de cada día en progress.json:
// { date, status: 'pending'|'success'|'error', queriedAt, count, error, hasUnclosed }

async function fetchDay(ticket, date, page = 1) {
  const url = `${BASE}/licitaciones.json?ticket=${ticket}&fecha=${date}&pagina=${page}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

async function fetchAllPages(ticket, date) {
  const first = await fetchDay(ticket, date, 1)
  const total = first.Cantidad ?? 0
  const items = [...(first.Listado ?? [])]

  const totalPages = Math.ceil(total / 10)
  for (let p = 2; p <= totalPages; p++) {
    const r = await fetchDay(ticket, date, p)
    items.push(...(r.Listado ?? []))
    await sleep(DELAY_MS)
  }
  return { total, items }
}

function hasUnclosedItems(items) {
  const closed = ['Cerrada', 'Adjudicada', 'Desierta', 'Revocada']
  return items.some(i => !closed.includes(i.Estado))
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

export function useScraper() {
  const [progress, setProgress] = useState({}) // date -> entry
  const [running, setRunning] = useState(false)
  const [dirHandle, setDirHandle] = useState(null)
  const [stats, setStats] = useState({ done: 0, errors: 0, total: 0, current: null })
  const stopRef = useRef(false)

  const loadProgress = useCallback(async (dh) => {
    const saved = await readJson(dh, PROGRESS_FILE)
    if (saved) {
      setProgress(saved)
      return saved
    }
    return {}
  }, [])

  const start = useCallback(async ({ ticket, dirHandle: dh, yearsBack = 5, mode = 'scrape' }) => {
    stopRef.current = false
    setRunning(true)

    const prog = await loadProgress(dh)
    const dates = buildDateRange(yearsBack)

    // In 'recheck' mode: only dates that have unclosed items and were previously scraped
    const toProcess = mode === 'recheck'
      ? dates.filter(d => prog[d]?.status === 'success' && prog[d]?.hasUnclosed)
      : dates.filter(d => prog[d]?.status !== 'success')

    setStats(s => ({ ...s, total: toProcess.length, done: 0, errors: 0 }))

    let currentProg = { ...prog }

    for (const date of toProcess) {
      if (stopRef.current) break

      setStats(s => ({ ...s, current: date }))

      try {
        const { items } = await fetchAllPages(ticket, date)
        const unclosed = hasUnclosedItems(items)
        const dataFile = `licitaciones_${date}.json`

        if (mode === 'recheck' && currentProg[date]?.status === 'success') {
          // Compare with existing
          const existing = await readJson(dh, dataFile)
          const existingIds = new Set((existing?.items ?? []).map(i => i.CodigoExterno))
          const changes = items.filter(i => {
            const old = (existing?.items ?? []).find(o => o.CodigoExterno === i.CodigoExterno)
            return !old || old.Estado !== i.Estado
          })

          if (changes.length > 0) {
            const changesFile = `changes_${date}_checked_${today()}.json`
            await writeJson(dh, changesFile, {
              originalDate: apiToIso(date),
              checkedAt: new Date().toISOString(),
              changes: changes.map(c => {
                const old = (existing?.items ?? []).find(o => o.CodigoExterno === c.CodigoExterno)
                return { code: c.CodigoExterno, name: c.Nombre, oldState: old?.Estado ?? 'nuevo', newState: c.Estado }
              }),
            })
          }
        }

        // Save/overwrite daily file
        await writeJson(dh, dataFile, {
          date: apiToIso(date),
          queriedAt: new Date().toISOString(),
          count: items.length,
          items,
        })

        currentProg[date] = {
          date,
          status: 'success',
          queriedAt: new Date().toISOString(),
          count: items.length,
          hasUnclosed: unclosed,
        }
        setStats(s => ({ ...s, done: s.done + 1 }))
      } catch (err) {
        currentProg[date] = {
          date,
          status: 'error',
          queriedAt: new Date().toISOString(),
          error: err.message,
        }
        setStats(s => ({ ...s, errors: s.errors + 1 }))
      }

      setProgress({ ...currentProg })
      await writeJson(dh, PROGRESS_FILE, currentProg)
      await sleep(DELAY_MS * 2) // extra delay entre días
    }

    setStats(s => ({ ...s, current: null }))
    setRunning(false)
  }, [loadProgress])

  const stop = useCallback(() => {
    stopRef.current = true
  }, [])

  return { progress, running, stats, dirHandle, setDirHandle, loadProgress, start, stop }
}

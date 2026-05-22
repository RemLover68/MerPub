import { useState, useCallback } from 'react'

const BASE_URL = 'https://api.mercadopublico.cl/servicios/v1/publico'

export function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [rawUrl, setRawUrl] = useState('')

  const call = useCallback(async (endpoint, params) => {
    setLoading(true)
    setError(null)
    setData(null)

    const query = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) query.set(k, v)
    })

    const url = `${BASE_URL}/${endpoint}?${query.toString()}`
    setRawUrl(url)

    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
      const json = await res.json()
      setData(json)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, data, rawUrl, call }
}

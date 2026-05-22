import { useState } from 'react'

export default function UrlDisplay({ url }) {
  const [copied, setCopied] = useState(false)

  if (!url) return null

  const copy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-gray-900 rounded-lg p-3 flex items-start gap-2">
      <span className="text-green-400 text-xs mt-0.5 shrink-0 font-mono">GET</span>
      <code className="text-green-300 text-xs font-mono break-all flex-1">{url}</code>
      <button
        onClick={copy}
        className="shrink-0 text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 rounded bg-gray-700 hover:bg-gray-600"
      >
        {copied ? '✓ Copiado' : 'Copiar'}
      </button>
    </div>
  )
}

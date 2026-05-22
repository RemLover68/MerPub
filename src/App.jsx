import { useState } from 'react'
import TicketInput from './components/TicketInput'
import Licitaciones from './components/tabs/Licitaciones'
import OrdenesCompra from './components/tabs/OrdenesCompra'
import BuscarProveedor from './components/tabs/BuscarProveedor'
import BuscarComprador from './components/tabs/BuscarComprador'
import LicitacionDetalle from './components/tabs/LicitacionDetalle'
import './index.css'

const TABS = [
  { id: 'licitaciones', label: 'Licitaciones', icon: '📋', component: Licitaciones },
  { id: 'detalle', label: 'Detalle Licitación', icon: '🔍', component: LicitacionDetalle },
  { id: 'ordenes', label: 'Órdenes de Compra', icon: '🛒', component: OrdenesCompra },
  { id: 'proveedor', label: 'Buscar Proveedor', icon: '🏢', component: BuscarProveedor },
  { id: 'comprador', label: 'Buscar Comprador', icon: '🏛️', component: BuscarComprador },
]

export default function App() {
  const [ticket, setTicket] = useState('')
  const [activeTab, setActiveTab] = useState('licitaciones')

  const ActiveComponent = TABS.find(t => t.id === activeTab)?.component

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-600 text-white rounded-xl p-2 text-xl font-bold leading-none select-none">MP</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-none m-0">API Mercado Público</h1>
              <p className="text-xs text-gray-500 mt-0.5 m-0">Explorer — api.mercadopublico.cl</p>
            </div>
          </div>
          <TicketInput value={ticket} onChange={setTicket} />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm border-blue-600'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {!ticket && (
            <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
              <span>⚠️</span>
              <span>Ingresa tu ticket de autenticación para hacer consultas. Puedes usar el ticket de demo.</span>
            </div>
          )}
          {ActiveComponent && <ActiveComponent ticket={ticket} />}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Datos provistos por{' '}
          <a href="https://api.mercadopublico.cl" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
            api.mercadopublico.cl
          </a>{' '}
          · ChileCompra · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}

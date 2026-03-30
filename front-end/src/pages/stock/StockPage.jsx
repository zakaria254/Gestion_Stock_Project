// src/pages/stock/StockPage.jsx
import { useState, useEffect } from 'react'
import DataTable from '../../components/tables/DataTable'
import { stockService } from '../../services/stockService'

export default function StockPage() {
  const [stockItems, setStockItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchStock()
  }, [])

  const fetchStock = async () => {
    setIsLoading(true)
    try {
      const data = await stockService.getAll()
      setStockItems(data)
    } catch (error) {
      showNotification('Erreur lors du chargement du stock', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // Statut rules:
  // - Stock > seuil → "Disponible"
  // - Stock <= seuil → "Faible"
  // - Stock = 0 → "Rupture"
  const getStatus = (stockActuel, seuilMinimum) => {
    if (stockActuel <= 0) return { label: 'Rupture', className: 'bg-red-100 text-red-800' }
    if (stockActuel <= seuilMinimum) return { label: 'Faible', className: 'bg-yellow-100 text-yellow-800' }
    return { label: 'Disponible', className: 'bg-green-100 text-green-800' }
  }

  const columns = [
    {
      key: 'articleNom',
      label: 'Article',
      render: (item) => <span className="font-medium text-foreground">{item.article?.nom || 'Article Inconnu'}</span>
    },
    {
      key: 'categorie',
      label: 'Catégorie',
      render: (item) => <span className="text-muted-foreground">{item.article?.categorie || '—'}</span>
    },
    {
      key: 'stockActuel',
      label: 'Stock Actuel',
      render: (item) => (
        <span className="font-semibold text-primary">
          {item.stock_actuel} {item.article?.unite || ''}
        </span>
      )
    },
    {
      key: 'seuilMinimum',
      label: 'Seuil Minimum',
      render: (item) => (
        <span className="text-muted-foreground">
          {item.seuil_minimun} {item.article?.unite || ''}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Statut',
      render: (item) => {
        const { label, className } = getStatus(item.stock_actuel, item.seuil_minimun)
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${className}`}>
            {label}
          </span>
        )
      }
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">État du Stock</h1>
          <p className="text-muted-foreground">Aperçu en temps réel des stocks d'articles basés sur les mouvements</p>
        </div>
      </div>

      {notification && (
        <div className={`p-4 rounded-lg ${notification.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
          {notification.message}
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Catégorie</label>
          <select 
            value={categoryFilter} 
            onChange={e => setCategoryFilter(e.target.value)}
            className="w-full h-10 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          >
            <option value="all">Toutes les catégories</option>
            {[...new Set(stockItems.map(item => item.article?.categorie).filter(Boolean))].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Statut</label>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="w-full h-10 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          >
            <option value="all">Tous les statuts</option>
            <option value="Disponible">Disponible</option>
            <option value="Faible">Faible</option>
            <option value="Rupture">Rupture</option>
          </select>
        </div>
      </div>

      <DataTable
        data={stockItems
          .map(item => ({
             ...item,
             searchKeywords: `${item.article?.nom || ''} ${item.article?.categorie || ''}`.toLowerCase()
          }))
          .filter(item => {
          if (categoryFilter !== 'all' && item.article?.categorie !== categoryFilter) return false
          if (statusFilter !== 'all' && getStatus(item.stock_actuel, item.seuil_minimun).label !== statusFilter) return false
          return true
        })}
        columns={columns}
        searchPlaceholder="Rechercher par article ou catégorie..."
        searchKeys={['searchKeywords']}
        pageSize={10}
      />
    </div>
  )
}

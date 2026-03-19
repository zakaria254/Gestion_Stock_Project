// src/pages/stock/StockMovementsPage.jsx
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import DataTable from '../../components/tables/DataTable'
import StockMovementForm from '../../components/forms/StockMovementForm'
import { stockMovementsService, articlesService } from '../../services/api'

export default function StockMovementsPage() {
  const [movements, setMovements] = useState([])
  const [articles, setArticles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedMovement, setSelectedMovement] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState(null)

  const [typeFilter, setTypeFilter] = useState('all')
  const [motifFilter, setMotifFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [movementsData, articlesData] = await Promise.all([
        stockMovementsService.getAll(),
        articlesService.getAll()
      ])
      
      // Map article name to movements for easier searching and sorting
      const enrichedMovements = movementsData.map(m => {
        const article = articlesData.find(a => a.id === m.articleId)
        return {
          ...m,
          articleNom: article ? article.nom : 'Article Inconnu',
          unite: article ? article.unite : ''
        }
      })
      
      // Sort by date DESC as default
      enrichedMovements.sort((a, b) => new Date(b.date) - new Date(a.date))
      
      setMovements(enrichedMovements)
      setArticles(articlesData)
    } catch (error) {
      showNotification('Erreur lors du chargement des mouvements de stock', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleCreate = () => {
    setSelectedMovement(null)
    setIsFormOpen(true)
  }

  const handleEdit = (movement) => {
    setSelectedMovement(movement)
    setIsFormOpen(true)
  }

  const handleDelete = async (movement) => {
    if (window.confirm(`Voulez-vous vraiment supprimer ce mouvement de stock ?`)) {
      try {
        await stockMovementsService.delete(Number(movement.id))
        setMovements(prev => prev.filter(m => m.id !== movement.id))
        showNotification('Mouvement supprimé avec succès')
      } catch (error) {
        showNotification('Erreur lors de la suppression', 'error')
      }
    }
  }

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      if (selectedMovement) {
        const updated = await stockMovementsService.update(Number(selectedMovement.id), formData)
        if (updated) {
          const article = articles.find(a => a.id === updated.articleId)
          const enrichedUpdated = {
            ...updated,
            articleNom: article ? article.nom : 'Article Inconnu',
            unite: article ? article.unite : ''
          }
          setMovements(prev => prev.map(m => m.id === selectedMovement.id ? enrichedUpdated : m).sort((a, b) => new Date(b.date) - new Date(a.date)))
          showNotification('Mouvement modifié avec succès')
        }
      } else {
        const newMovement = await stockMovementsService.create(formData)
        const article = articles.find(a => a.id === newMovement.articleId)
        const enrichedNew = {
          ...newMovement,
          articleNom: article ? article.nom : 'Article Inconnu',
          unite: article ? article.unite : ''
        }
        setMovements(prev => [enrichedNew, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)))
        showNotification('Mouvement créé avec succès')
      }
      setIsFormOpen(false)
    } catch (error) {
      showNotification('Erreur lors de l\'enregistrement', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'date',
      label: 'Date',
      render: (m) => {
        try {
          const d = new Date(m.date)
          return isNaN(d.getTime()) ? "-" : new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d)
        } catch {
          return "-"
        }
      }
    },
    {
      key: 'articleNom',
      label: 'Article',
      render: (m) => <span className="font-medium text-foreground">{m.articleNom}</span>
    },
    {
      key: 'type',
      label: 'Type',
      render: (m) => {
        const isEntree = m.type === 'ENTREE'
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${isEntree ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {isEntree ? 'Entrée' : 'Sortie'}
          </span>
        )
      }
    },
    {
      key: 'quantite',
      label: 'Quantité',
      render: (m) => (
        <span className={`font-semibold ${m.type === 'ENTREE' ? 'text-green-600' : 'text-red-600'}`}>
          {m.type === 'ENTREE' ? '+' : '-'}{m.quantite} {m.unite}
        </span>
      )
    },
    {
      key: 'motif',
      label: 'Motif',
      render: (m) => <span className="text-muted-foreground">{m.motif}</span>
    },
  ]

  const renderActions = (m) => (
    <>
      <button
        onClick={() => handleEdit(m)}
        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
        title="Modifier"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleDelete(m)}
        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        title="Supprimer"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </>
  )

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
          <h1 className="text-2xl font-bold text-foreground">Mouvements de Stock</h1>
          <p className="text-muted-foreground">Historique des entrées et sorties pour tous les articles</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouveau Mouvement
        </button>
      </div>

      {notification && (
        <div className={`p-4 rounded-lg ${notification.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
          {notification.message}
        </div>
      )}

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Du</label>
          <input 
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="w-full h-10 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Au</label>
          <input 
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="w-full h-10 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Type</label>
          <select 
            value={typeFilter} 
            onChange={e => setTypeFilter(e.target.value)}
            className="w-full h-10 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          >
            <option value="all">Tous les types</option>
            <option value="ENTREE">Entrée</option>
            <option value="SORTIE">Sortie</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Motif</label>
          <select 
            value={motifFilter} 
            onChange={e => setMotifFilter(e.target.value)}
            className="w-full h-10 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          >
            <option value="all">Tous les motifs</option>
            {[...new Set(movements.map(m => m.motif).filter(Boolean))].map(motif => (
              <option key={motif} value={motif}>{motif}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        data={movements.filter(m => {
          if (typeFilter !== 'all' && m.type !== typeFilter) return false
          if (motifFilter !== 'all' && m.motif !== motifFilter) return false
          if (dateFrom || dateTo) {
            const mDate = new Date(m.date)
            mDate.setHours(0, 0, 0, 0)
            if (dateFrom) {
              const from = new Date(dateFrom)
              from.setHours(0, 0, 0, 0)
              if (mDate < from) return false
            }
            if (dateTo) {
              const to = new Date(dateTo)
              to.setHours(23, 59, 59, 999)
              if (mDate > to) return false
            }
          }
          return true
        })}
        columns={columns}
        searchPlaceholder="Rechercher par article, type ou motif..."
        searchKeys={['articleNom', 'type', 'motif']}
        pageSize={10}
        renderActions={renderActions}
        emptyMessage="Aucun mouvement trouvé"
      />

      <StockMovementForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        movement={selectedMovement}
        articles={articles}
        isLoading={isSubmitting}
      />
    </div>
  )
}

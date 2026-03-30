// src/pages/production/ProductionLotsPage.jsx
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import DataTable from '../../components/tables/DataTable'
import ProductionLotForm from '../../components/forms/ProductionLotForm'
import { productionLotService } from '../../services/productionLotService'
import { articleService } from '../../services/articleService'

const STATUS_COLORS = {
  'AVAILABLE': 'bg-blue-100 text-blue-800',
  'IN_PROGRESS': 'bg-orange-100 text-orange-800',
  'COMPLETED': 'bg-green-100 text-green-800',
}

const STATUS_LABELS = {
  'AVAILABLE': 'Disponible',
  'IN_PROGRESS': 'En Cours',
  'COMPLETED': 'Terminé',
}

export default function ProductionLotsPage() {
  const [productionLots, setProductionLots] = useState([])
  const [articles, setArticles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedLot, setSelectedLot] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [lotsData, articlesData] = await Promise.all([
        productionLotService.getAll(),
        articleService.getAll()
      ])
      
      setProductionLots(Array.isArray(lotsData) ? lotsData : [])
      setArticles(Array.isArray(articlesData) ? articlesData : [])
    } catch (error) {
      toast.error('Erreur lors du chargement des données')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedLot(null)
    setIsFormOpen(true)
  }

  const handleEdit = (lot) => {
    setSelectedLot(lot)
    setIsFormOpen(true)
  }

  const handleDelete = async (lot) => {
    if (window.confirm(`Voulez-vous vraiment supprimer le lot ${lot.numero_lot} ?`)) {
      try {
        await productionLotService.delete(lot.id)
        setProductionLots(prev => prev.filter(p => p.id !== lot.id))
        toast.success(`Lot ${lot.numero_lot} supprimé avec succès`)
      } catch (error) {
        toast.error('Erreur lors de la suppression du lot')
      }
    }
  }

  const handleFormSubmit = async (formData, setBackendErrors) => {
    setIsSubmitting(true)
    try {
      if (selectedLot) {
        const updated = await productionLotService.update(selectedLot.id, formData)
        setProductionLots(prev => prev.map(p => p.id === selectedLot.id ? updated : p))
        toast.success('Lot modifié avec succès')
      } else {
        const newLot = await productionLotService.create(formData)
        setProductionLots(prev => [...prev, newLot])
        toast.success('Lot créé avec succès')
      }
      setIsFormOpen(false)
    } catch (error) {
      // Show backend validation errors on form fields
      if (setBackendErrors) {
        setBackendErrors(error)
      }
      const msg = error.response?.data?.message || 'Erreur lors de l\'enregistrement'
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'numero_lot',
      label: 'Numéro de Lot',
      render: (lot) => <span className="font-bold">{lot.numero_lot}</span>
    },
    {
      key: 'article_nom',
      label: 'Article',
      render: (lot) => {
        const article = articles.find(a => String(a.id) === String(lot.article_id))
        return <span className="font-medium">{article ? article.nom : lot.article?.nom || '—'}</span>
      }
    },
    {
      key: 'quantite',
      label: 'Quantité',
      render: (lot) => `${lot.quantite}`
    },
    {
      key: 'status',
      label: 'Statut',
      render: (lot) => {
        const status = lot.status || 'IN_PROGRESS'
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[status] || STATUS_COLORS.IN_PROGRESS}`}>
            {STATUS_LABELS[status] || status}
          </span>
        )
      }
    },
    {
      key: 'date_production',
      label: 'Date Production',
      render: (lot) => {
        const dateStr = lot.date_production
        if (!dateStr) return '—'
        return dateStr.split('T')[0] // formats YYYY-MM-DD if ISO
      }
    },
    {
      key: 'certificat_abattage',
      label: 'Certificat',
      render: (lot) => lot.certificat_abattage || '—'
    },
  ]

  const renderActions = (lot) => (
    <>
      <button
        onClick={() => handleEdit(lot)}
        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
        title="Modifier"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleDelete(lot)}
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
          <h1 className="text-2xl font-bold text-foreground">Gestion des Lots de Production</h1>
          <p className="text-muted-foreground">Suivi des lots de production et statuts</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouveau Lot
        </button>
      </div>

      <DataTable
        data={productionLots}
        columns={columns}
        searchPlaceholder="Rechercher un lot..."
        searchKeys={['numero_lot']}
        pageSize={10}
        renderActions={renderActions}
      />

      <ProductionLotForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        productionLot={selectedLot}
        isLoading={isSubmitting}
      />
    </div>
  )
}

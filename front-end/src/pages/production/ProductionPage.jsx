// src/pages/production/ProductionPage.jsx
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import DataTable from '../../components/tables/DataTable'
import ProductionForm from '../../components/forms/ProductionForm'
import { productionService, articlesService } from '../../services/api'

// Status rules required by user: EN_COURS, TERMINE, ANNULE
const STATUS_COLORS = {
  'EN_COURS': 'bg-blue-100 text-blue-800',
  'TERMINE': 'bg-green-100 text-green-800',
  'ANNULE': 'bg-red-100 text-red-800',
}

const STATUS_LABELS = {
  'EN_COURS': 'En Cours',
  'TERMINE': 'Terminé',
  'ANNULE': 'Annulé',
}

export default function ProductionPage() {
  const [productions, setProductions] = useState([])
  const [articles, setArticles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProduction, setSelectedProduction] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [prodData, articlesData] = await Promise.all([
        productionService.getAll(),
        articlesService.getAll()
      ])
      
      // Remap status if mock data has old statuses like 'IN_PROGRESS'
      const mappedProdData = prodData.map(p => {
        let mappedStatus = p.status
        if (p.status === 'IN_PROGRESS') mappedStatus = 'EN_COURS'
        if (p.status === 'COMPLETED' || p.status === 'AVAILABLE') mappedStatus = 'TERMINE'
        return { ...p, status: mappedStatus || 'EN_COURS' }
      })
      
      setProductions(mappedProdData)
      setArticles(articlesData)
    } catch (error) {
      showNotification('Erreur lors du chargement des productions', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleCreate = () => {
    setSelectedProduction(null)
    setIsFormOpen(true)
  }

  const handleEdit = (production) => {
    setSelectedProduction(production)
    setIsFormOpen(true)
  }

  const handleDelete = async (production) => {
    if (window.confirm(`Voulez-vous vraiment supprimer le lot ${production.numeroLot} ?`)) {
      try {
        await productionService.delete(Number(production.id))
        setProductions(prev => prev.filter(p => p.id !== production.id))
        showNotification('Lot de production supprimé avec succès')
      } catch (error) {
        showNotification('Erreur lors de la suppression', 'error')
      }
    }
  }

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      if (selectedProduction) {
        const updated = await productionService.update(Number(selectedProduction.id), formData)
        if (updated) {
          setProductions(prev => prev.map(p => p.id === selectedProduction.id ? updated : p))
          showNotification('Lot de production modifié avec succès')
        }
      } else {
        const newProduction = await productionService.create(formData)
        setProductions(prev => [...prev, newProduction])
        showNotification('Lot de production créé avec succès')
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
      key: 'numeroLot',
      label: 'ID Lot',
      render: (prod) => <span className="font-medium text-primary">{prod.numeroLot}</span>
    },
    {
      key: 'dateProduction',
      label: 'Date',
      render: (prod) => {
        const dateStr = prod.dateProduction
        if (!dateStr) return '-'
        return new Date(dateStr).toLocaleDateString('fr-FR')
      }
    },
    {
      key: 'articleNom',
      label: 'Article Produit',
      render: (prod) => {
        const article = articles.find(a => a.id === prod.articleId)
        return <span className="font-medium">{article ? article.nom : prod.articleNom}</span>
      }
    },
    {
      key: 'quantite',
      label: 'Quantité',
      render: (prod) => {
        const article = articles.find(a => a.id === prod.articleId)
        return `${prod.quantite} ${article?.unite || 'kg'}`
      }
    },
    {
      key: 'status',
      label: 'Statut',
      render: (prod) => {
        const status = prod.status || 'EN_COURS'
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[status] || STATUS_COLORS.EN_COURS}`}>
            {STATUS_LABELS[status] || status}
          </span>
        )
      }
    },
  ]

  const renderActions = (prod) => (
    <>
      {prod.status !== 'TERMINE' && (
        <button
          onClick={() => handleEdit(prod)}
          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
          title="Modifier"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}
      <button
        onClick={() => handleDelete(prod)}
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
          <h1 className="text-2xl font-bold text-foreground">Gestion de la Production</h1>
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

      {notification && (
        <div className={`p-4 rounded-lg ${notification.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
          {notification.message}
        </div>
      )}

      <DataTable
        data={productions}
        columns={columns}
        searchPlaceholder="Rechercher un lot..."
        searchKeys={['numeroLot', 'articleNom']}
        pageSize={10}
        renderActions={renderActions}
      />

      <ProductionForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        production={selectedProduction}
        articles={articles}
        isLoading={isSubmitting}
      />
    </div>
  )
}

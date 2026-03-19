// src/pages/articles/ArticlesPage.jsx
import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import DataTable from '../../components/tables/DataTable'
import ArticleForm from '../../components/forms/ArticleForm'
import { articlesService, stockService } from '../../services/api'

const STATUT_COLORS = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-red-100 text-red-800',
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState([])
  const [stockMap, setStockMap] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState(null)
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [articlesData, stockData] = await Promise.all([
        articlesService.getAll(),
        stockService.getAll()
      ])
      setArticles(articlesData)
      
      const stockMapping = {}
      stockData.forEach(s => {
        stockMapping[s.articleId] = s.quantiteDisponible
      })
      setStockMap(stockMapping)
    } catch (error) {
      showNotification('Erreur lors du chargement des articles', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleCreate = () => {
    setSelectedArticle(null)
    setIsFormOpen(true)
  }

  const handleEdit = (article) => {
    setSelectedArticle(article)
    setIsFormOpen(true)
  }

  const handleDelete = async (article) => {
    if (window.confirm(`Voulez-vous vraiment supprimer l'article ${article.nom} ?`)) {
      try {
        await articlesService.delete(Number(article.id))
        setArticles(prev => prev.filter(a => a.id !== article.id))
        showNotification('Article supprimé avec succès')
      } catch (error) {
        showNotification('Erreur lors de la suppression', 'error')
      }
    }
  }

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      if (selectedArticle) {
        const updated = await articlesService.update(Number(selectedArticle.id), formData)
        if (updated) {
          setArticles(prev => prev.map(a => a.id === selectedArticle.id ? updated : a))
          showNotification('Article modifié avec succès')
        }
      } else {
        const newArticle = await articlesService.create(formData)
        setArticles(prev => [...prev, newArticle])
        showNotification('Article créé avec succès')
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
      key: 'reference',
      label: 'Référence',
      render: (article) => <span className="font-medium">{article.reference}</span>
    },
    {
      key: 'nom',
      label: 'Nom',
    },
    {
      key: 'categorie',
      label: 'Catégorie',
      render: (article) => (
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-slate-100 text-slate-800">
          {article.categorie}
        </span>
      ),
    },
    {
      key: 'prix',
      label: 'Prix Unitaire',
      render: (article) => `${Number(article.prix).toFixed(2)} €`
    },
    {
      key: 'stock',
      label: 'Stock Actuel',
      render: (article) => {
        const qty = stockMap[article.id] || 0
        return (
          <span className={`font-medium ${qty > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {qty} {article.unite || 'kg'}
          </span>
        )
      }
    },
    {
      key: 'status',
      label: 'Statut',
      render: (article) => {
        const status = article.status || 'ACTIVE'
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUT_COLORS[status] || STATUT_COLORS.ACTIVE}`}>
            {status === 'ACTIVE' ? 'Actif' : 'Inactif'}
          </span>
        )
      }
    },
  ]

  const renderActions = (article) => (
    <>
      <button
        onClick={() => handleEdit(article)}
        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
        title="Modifier"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleDelete(article)}
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
          <h1 className="text-2xl font-bold text-foreground">Gestion des Articles</h1>
          <p className="text-muted-foreground">Catalogue des produits et stock</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouvel Article
        </button>
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
            {[...new Set(articles.map(item => item.categorie).filter(Boolean))].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        data={articles.filter(a => categoryFilter === 'all' || a.categorie === categoryFilter)}
        columns={columns}
        searchPlaceholder="Rechercher un article (nom, réf...)"
        searchKeys={['nom', 'reference', 'categorie']}
        pageSize={10}
        renderActions={renderActions}
        emptyMessage={articles.filter(a => categoryFilter === 'all' || a.categorie === categoryFilter).length === 0 && articles.length > 0 ? "Aucun résultat pour ce filtre" : "Aucun article trouvé"}
      />

      <ArticleForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        article={selectedArticle}
        isLoading={isSubmitting}
      />
    </div>
  )
}

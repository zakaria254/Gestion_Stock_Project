import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Toaster, toast } from 'sonner'
import DataTable from '../../components/tables/DataTable'
import ArticleForm from '../../components/forms/ArticleForm'
import { articleService } from '../../services/articleService'
import { stockService } from '../../services/api'

export default function ArticlesPage() {
  const [articles, setArticles] = useState([])
  const [stockMap, setStockMap] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [response, stockData] = await Promise.all([
        articleService.getAll(),
        stockService.getAll()
      ])
      
      const extractedArticles = Array.isArray(response) ? response : response?.data || []
      setArticles(Array.isArray(extractedArticles) ? extractedArticles : [])
      
      const stockMapping = {}
      stockData.forEach(s => {
        stockMapping[s.articleId] = s.quantiteDisponible
      })
      setStockMap(stockMapping)
    } catch (error) {
      toast.error('Erreur lors du chargement des articles')
    } finally {
      setIsLoading(false)
    }
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
        await articleService.delete(Number(article.id))
        setArticles(prev => prev.filter(a => a.id !== article.id))
        toast.success('Article supprimé avec succès')
      } catch (error) {
        toast.error('Erreur lors de la suppression')
      }
    }
  }

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      if (selectedArticle) {
        const updated = await articleService.update(Number(selectedArticle.id), formData)
        // If API doesn't return the full updated object, rely on refetching
        if (updated && updated.data) {
           setArticles(prev => prev.map(a => a.id === selectedArticle.id ? updated.data : a))
        } else {
           await fetchData()
        }
        toast.success('Article modifié avec succès')
      } else {
        const response = await articleService.create(formData)
        const newArticle = response?.data || response
        if (newArticle && newArticle.id) {
            setArticles(prev => [...prev, newArticle])
        } else {
            await fetchData()
        }
        toast.success('Article créé avec succès')
      }
      setIsFormOpen(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getCategoryBadge = (category) => {
    switch(category?.toLowerCase()) {
      case 'volaille': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'boeuf': return 'bg-red-100 text-red-800 border-red-200'
      case 'agneau': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'charcuterie': return 'bg-pink-100 text-pink-800 border-pink-200'
      default: return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  const columns = [
    {
      key: 'reference',
      label: 'Référence',
      render: (article) => <span className="font-bold">{article.reference}</span>
    },
    {
      key: 'nom',
      label: 'Nom',
    },
    {
      key: 'categorie',
      label: 'Catégorie',
      render: (article) => (
        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${getCategoryBadge(article.categorie)}`}>
          {article.categorie || 'Non catégorisé'}
        </span>
      ),
    },
    {
      key: 'prix',
      label: 'Prix Unitaire',
      render: (article) => `${Number(article.prix).toFixed(2)} MAD`
    },
    {
      key: 'stock',
      label: 'Stock Actuel',
      render: (article) => {
        const qty = stockMap[article.id] || 0
        return (
          <span>
            {qty} {article.unite || 'kg'}
          </span>
        )
      }
    },
    {
      key: 'status',
      label: 'Statut',
      render: (article) => {
        const qty = stockMap[article.id] || 0
        const isEnRupture = qty <= 0
        return (
          <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${isEnRupture ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {isEnRupture ? 'En rupture' : 'Actif'}
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

  if (!Array.isArray(articles)) return null;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors theme="light" />
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

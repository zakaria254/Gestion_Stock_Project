// src/components/forms/ProductionForm.jsx
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const STATUTS = [
  { value: 'EN_COURS', label: 'En Cours' },
  { value: 'TERMINE', label: 'Terminé' },
  { value: 'ANNULE', label: 'Annulé' },
]

export default function ProductionForm({ isOpen, onClose, onSubmit, production = null, articles = [], isLoading = false }) {
  const [formData, setFormData] = useState({
    articleId: '',
    quantite: '',
    dateProduction: new Date().toISOString().split('T')[0],
    status: 'EN_COURS',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (production) {
      setFormData({
        articleId: production.articleId || '',
        quantite: production.quantite || '',
        dateProduction: production.dateProduction || new Date().toISOString().split('T')[0],
        status: production.status || 'EN_COURS',
      })
    } else {
      setFormData({
        articleId: articles.length > 0 ? articles[0].id : '',
        quantite: '',
        dateProduction: new Date().toISOString().split('T')[0],
        status: 'EN_COURS',
      })
    }
    setErrors({})
  }, [production, isOpen, articles])

  const validate = () => {
    const newErrors = {}
    if (!formData.articleId) newErrors.articleId = 'Veuillez sélectionner un article'
    if (!formData.quantite) newErrors.quantite = 'La quantité est requise'
    else if (isNaN(Number(formData.quantite)) || Number(formData.quantite) <= 0) {
      newErrors.quantite = 'La quantité doit être supérieure à 0'
    }
    if (!formData.dateProduction) newErrors.dateProduction = 'La date est requise'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      const selectedArticle = articles.find(a => String(a.id) === String(formData.articleId))
      onSubmit({
        ...formData,
        articleId: Number(formData.articleId),
        quantite: Number(formData.quantite),
        articleNom: selectedArticle ? selectedArticle.nom : ''
      })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-card rounded-xl border border-border shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {production ? 'Modifier Lot de Production' : 'Nouveau Lot de Production'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Article Produit</label>
            <select
              name="articleId"
              value={formData.articleId}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.articleId ? 'border-destructive' : 'border-border'}`}
            >
              <option value="">Sélectionner un article...</option>
              {articles.map(article => (
                <option key={article.id} value={article.id}>
                  {article.nom} ({article.reference})
                </option>
              ))}
            </select>
            {errors.articleId && <p className="mt-1 text-xs text-destructive">{errors.articleId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Quantité Produite</label>
            <input
              type="number"
              min="0"
              step="any"
              name="quantite"
              value={formData.quantite}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.quantite ? 'border-destructive' : 'border-border'}`}
              placeholder="Ex: 150"
            />
            {errors.quantite && <p className="mt-1 text-xs text-destructive">{errors.quantite}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Date de Production</label>
            <input
              type="date"
              name="dateProduction"
              value={formData.dateProduction}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.dateProduction ? 'border-destructive' : 'border-border'}`}
            />
            {errors.dateProduction && <p className="mt-1 text-xs text-destructive">{errors.dateProduction}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Statut</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {STATUTS.map(statut => (
                <option key={statut.value} value={statut.value}>{statut.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Enregistrement...' : production ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

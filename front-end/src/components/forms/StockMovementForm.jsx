// src/components/forms/StockMovementForm.jsx
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { stockService } from '../../services/api'

const TYPES = [
  { value: 'ENTREE', label: 'Entrée ( + )' },
  { value: 'SORTIE', label: 'Sortie ( - )' },
]

const MOTIFS = [
  'Achat',
  'Vente',
  'Production',
  'Perte',
  'Ajustement d\'inventaire',
  'Retour client',
]

export default function StockMovementForm({ isOpen, onClose, onSubmit, movement = null, articles = [], isLoading = false }) {
  const [formData, setFormData] = useState({
    articleId: '',
    type: 'ENTREE',
    quantite: '',
    motif: 'Achat',
    date: new Date().toISOString().split('T')[0],
  })

  const [errors, setErrors] = useState({})
  const [currentStock, setCurrentStock] = useState(null)
  
  // Update the current stock when the article changes
  useEffect(() => {
    const fetchStock = async () => {
      if (formData.articleId) {
        try {
          const stockData = await stockService.getStock()
          const articleStock = stockData.find(s => s.articleId === Number(formData.articleId))
          setCurrentStock(articleStock ? articleStock.stockActuel : 0)
        } catch (error) {
          console.error("Error fetching stock", error)
          setCurrentStock(null)
        }
      } else {
        setCurrentStock(null)
      }
    }
    
    fetchStock()
  }, [formData.articleId])

  useEffect(() => {
    if (movement) {
      setFormData({
        articleId: movement.articleId || '',
        type: movement.type || 'ENTREE',
        quantite: movement.quantite || '',
        motif: movement.motif || 'Achat',
        date: movement.date || new Date().toISOString().split('T')[0],
      })
    } else {
      setFormData({
        articleId: articles.length > 0 ? articles[0].id : '',
        type: 'ENTREE',
        quantite: '',
        motif: 'Achat',
        date: new Date().toISOString().split('T')[0],
      })
    }
    setErrors({})
  }, [movement, isOpen, articles])

  const validate = () => {
    const newErrors = {}
    if (!formData.articleId) newErrors.articleId = 'Veuillez sélectionner un article'
    if (!formData.quantite) newErrors.quantite = 'La quantité est requise'
    else if (isNaN(Number(formData.quantite)) || Number(formData.quantite) <= 0) {
      newErrors.quantite = 'La quantité doit être supérieure à 0'
    }
    if (!formData.date) newErrors.date = 'La date est requise'
    if (!formData.motif) newErrors.motif = 'Le motif est requis'

    // Validation du stock pour les sorties
    if (formData.type === 'SORTIE' && !newErrors.quantite && currentStock !== null) {
      if (Number(formData.quantite) > currentStock) {
        let actualStockLimit = currentStock
        // Si on est en modification et qu'on modifie une sortie existante pour le même article, on rajoute l'ancienne quantité au stock actuel pour la validation
        if (movement && movement.type === 'SORTIE' && Number(movement.articleId) === Number(formData.articleId)) {
          actualStockLimit += Number(movement.quantite)
        }
        
        if (Number(formData.quantite) > actualStockLimit) {
          newErrors.quantite = `Stock insuffisant. Le stock actuel est de ${actualStockLimit}.`
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit({
        ...formData,
        articleId: Number(formData.articleId),
        quantite: Number(formData.quantite),
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
            {movement ? 'Modifier le Mouvement' : 'Nouveau Mouvement de Stock'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Article</label>
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
            {currentStock !== null && (
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                Stock actuel : <span className={currentStock > 0 ? 'text-green-600' : 'text-red-500'}>{currentStock}</span>
              </p>
            )}
            {errors.articleId && <p className="mt-1 text-xs text-destructive">{errors.articleId}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Type de Mouvement</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Quantité</label>
              <input
                type="number"
                min="0"
                step="any"
                name="quantite"
                value={formData.quantite}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.quantite ? 'border-destructive' : 'border-border'}`}
                placeholder="Ex: 50"
              />
              {errors.quantite && <p className="mt-1 text-xs text-destructive">{errors.quantite}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Motif</label>
            <select
              name="motif"
              value={formData.motif}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Sélectionner un motif...</option>
              {MOTIFS.map(motif => (
                <option key={motif} value={motif}>{motif}</option>
              ))}
            </select>
            {errors.motif && <p className="mt-1 text-xs text-destructive">{errors.motif}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.date ? 'border-destructive' : 'border-border'}`}
            />
            {errors.date && <p className="mt-1 text-xs text-destructive">{errors.date}</p>}
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
              {isLoading ? 'Enregistrement...' : movement ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

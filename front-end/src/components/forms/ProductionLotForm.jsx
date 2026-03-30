// src/components/forms/ProductionLotForm.jsx
import { useState, useEffect, useCallback } from 'react'
import { X, Loader2, RefreshCw } from 'lucide-react'
import { articleService } from '../../services/articleService'

const STATUTS = [
  { value: 'AVAILABLE', label: 'Disponible' },
  { value: 'IN_PROGRESS', label: 'En Cours' },
  { value: 'COMPLETED', label: 'Terminé' },
]

// Generate a lot number: LOT-YYYYMMDD-XXXX (18 chars, fits 10-20 rule)
function generateLotNumber() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let rand = ''
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `LOT-${y}${m}${d}-${rand}`
}

export default function ProductionLotForm({ isOpen, onClose, onSubmit, productionLot = null, isLoading = false }) {
  const [articles, setArticles] = useState([])
  const [isLoadingArticles, setIsLoadingArticles] = useState(false)
  const [formData, setFormData] = useState({
    numero_lot: '',
    article_id: '',
    quantite: '',
    date_production: new Date().toISOString().split('T')[0],
    status: 'IN_PROGRESS',
    certificat_abattage: '',
  })

  const [errors, setErrors] = useState({})

  // Fetch articles when form opens
  useEffect(() => {
    const fetchArticles = async () => {
      setIsLoadingArticles(true)
      try {
        const res = await articleService.getAll()
        setArticles(Array.isArray(res) ? res : [])
      } catch (error) {
        console.error("Error loading articles", error)
        setArticles([])
      } finally {
        setIsLoadingArticles(false)
      }
    }

    if (isOpen) {
      fetchArticles()
    }
  }, [isOpen])

  // Pre-fill form
  useEffect(() => {
    if (productionLot) {
      // Edit mode — use existing data
      setFormData({
        numero_lot: productionLot.numero_lot || '',
        article_id: productionLot.article_id ? String(productionLot.article_id) : '',
        quantite: productionLot.quantite != null ? String(productionLot.quantite) : '',
        date_production: productionLot.date_production ? productionLot.date_production.split('T')[0] : new Date().toISOString().split('T')[0],
        status: productionLot.status || 'IN_PROGRESS',
        certificat_abattage: productionLot.certificat_abattage || '',
      })
    } else {
      // Create mode — auto-generate lot number
      setFormData({
        numero_lot: generateLotNumber(),
        article_id: '',
        quantite: '',
        date_production: new Date().toISOString().split('T')[0],
        status: 'IN_PROGRESS',
        certificat_abattage: '',
      })
    }
    setErrors({})
  }, [productionLot, isOpen])

  const handleRefreshLotNumber = useCallback(() => {
    setFormData(prev => ({ ...prev, numero_lot: generateLotNumber() }))
    setErrors(prev => ({ ...prev, numero_lot: '' }))
  }, [])

  const validate = () => {
    const newErrors = {}
    if (!formData.numero_lot) {
      newErrors.numero_lot = 'Le numéro de lot est requis'
    } else if (formData.numero_lot.length < 10 || formData.numero_lot.length > 20) {
      newErrors.numero_lot = 'Le numéro de lot doit contenir entre 10 et 20 caractères'
    }

    if (!formData.article_id) newErrors.article_id = 'Veuillez sélectionner un article'
    
    if (!formData.quantite) {
      newErrors.quantite = 'La quantité est requise'
    } else if (isNaN(Number(formData.quantite)) || Number(formData.quantite) <= 0) {
      newErrors.quantite = 'La quantité doit être supérieure à 0'
    }
    
    if (!formData.date_production) newErrors.date_production = 'La date est requise'
    if (!formData.status) newErrors.status = 'Le statut est requis'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Accept backend 422 validation errors and display them on the form
  const setBackendErrors = (error) => {
    if (error.response && error.response.status === 422 && error.response.data?.errors) {
      const backendErrors = {}
      Object.entries(error.response.data.errors).forEach(([field, messages]) => {
        backendErrors[field] = Array.isArray(messages) ? messages[0] : messages
      })
      setErrors(prev => ({ ...prev, ...backendErrors }))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      const quantiteNum = parseFloat(formData.quantite)
      const payload = {
        numero_lot: formData.numero_lot,
        article_id: parseInt(formData.article_id, 10),
        quantite: quantiteNum.toFixed(2),
        status: formData.status,
        date_production: formData.date_production,
      }

      if (formData.certificat_abattage && formData.certificat_abattage.trim()) {
        payload.certificat_abattage = formData.certificat_abattage.trim()
      }

      onSubmit(payload, setBackendErrors)
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
            {productionLot ? 'Modifier Lot de Production' : 'Nouveau Lot de Production'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Numéro de Lot</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="numero_lot"
                value={formData.numero_lot}
                onChange={handleChange}
                maxLength={20}
                className={`flex-1 px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.numero_lot ? 'border-destructive' : 'border-border'}`}
                placeholder="Ex: LOT-20260330-A1B2"
              />
              {!productionLot && (
                <button
                  type="button"
                  onClick={handleRefreshLotNumber}
                  className="px-2.5 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  title="Générer un nouveau numéro"
                >
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            {errors.numero_lot && <p className="mt-1 text-xs text-destructive">{errors.numero_lot}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Article</label>
            <div className="relative">
              <select
                name="article_id"
                value={formData.article_id}
                onChange={handleChange}
                disabled={isLoadingArticles}
                className={`w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 ${errors.article_id ? 'border-destructive' : 'border-border'}`}
              >
                <option value="">Sélectionner un article...</option>
                {articles.map(article => (
                  <option key={article.id} value={article.id}>
                    {article.nom}
                  </option>
                ))}
              </select>
              {isLoadingArticles && (
                <div className="absolute right-8 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            {errors.article_id && <p className="mt-1 text-xs text-destructive">{errors.article_id}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Quantité</label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              name="quantite"
              value={formData.quantite}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.quantite ? 'border-destructive' : 'border-border'}`}
              placeholder="Ex: 150.00"
            />
            {errors.quantite && <p className="mt-1 text-xs text-destructive">{errors.quantite}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Date de Production</label>
            <input
              type="date"
              name="date_production"
              value={formData.date_production}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.date_production ? 'border-destructive' : 'border-border'}`}
            />
            {errors.date_production && <p className="mt-1 text-xs text-destructive">{errors.date_production}</p>}
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
            {errors.status && <p className="mt-1 text-xs text-destructive">{errors.status}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Certificat d'Abattage (Optionnel)</label>
            <input
              type="text"
              name="certificat_abattage"
              value={formData.certificat_abattage}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: CERT-001"
            />
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
              disabled={isLoading || isLoadingArticles}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isLoading ? 'Enregistrement...' : productionLot ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

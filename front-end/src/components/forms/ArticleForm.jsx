// src/components/forms/ArticleForm.jsx
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const CATEGORIES = [
  'Boeuf',
  'Veau',
  'Agneau',
  'Volaille',
  'Charcuterie'
]

const STATUTS = [
  { value: 'ACTIVE', label: 'Actif' },
  { value: 'INACTIVE', label: 'Inactif' },
]

export default function ArticleForm({ isOpen, onClose, onSubmit, article = null, isLoading = false }) {
  const [formData, setFormData] = useState({
    reference: '',
    nom: '',
    categorie: 'Boeuf',
    prix: '',
    unite: 'kg',
    status: 'ACTIVE'
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (article) {
      setFormData({
        reference: article.reference || '',
        nom: article.nom || '',
        categorie: article.categorie || 'Boeuf',
        prix: article.prix || '',
        unite: article.unite || 'kg',
        status: article.status || 'ACTIVE'
      })
    } else {
      setFormData({
        reference: '',
        nom: '',
        categorie: 'Boeuf',
        prix: '',
        unite: 'kg',
        status: 'ACTIVE'
      })
    }
    setErrors({})
  }, [article, isOpen])

  const validate = () => {
    const newErrors = {}
    if (!formData.reference.trim()) newErrors.reference = 'La référence est requise'
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis'
    if (!formData.prix) newErrors.prix = 'Le prix est requis'
    else if (isNaN(Number(formData.prix)) || Number(formData.prix) < 0) newErrors.prix = 'Le prix doit être un nombre positif'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit({
        ...formData,
        prix: Number(formData.prix)
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
            {article ? 'Modifier Article' : 'Nouvel Article'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Référence</label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.reference ? 'border-destructive' : 'border-border'}`}
              placeholder="Ex: ART-001"
            />
            {errors.reference && <p className="mt-1 text-xs text-destructive">{errors.reference}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nom de l'article</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.nom ? 'border-destructive' : 'border-border'}`}
              placeholder="Nom du produit"
            />
            {errors.nom && <p className="mt-1 text-xs text-destructive">{errors.nom}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Catégorie</label>
            <select
              name="categorie"
              value={formData.categorie}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Prix Unitaire (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="prix"
                value={formData.prix}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.prix ? 'border-destructive' : 'border-border'}`}
                placeholder="Ex: 12.50"
              />
              {errors.prix && <p className="mt-1 text-xs text-destructive">{errors.prix}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Unité</label>
              <input
                type="text"
                name="unite"
                value={formData.unite}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: kg"
              />
            </div>
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
              {isLoading ? 'Enregistrement...' : article ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

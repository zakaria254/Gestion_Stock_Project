import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export default function SupplierForm({ isOpen, onClose, onSubmit, supplier = null, isLoading = false }) {
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    contact: '',
    email: '',
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (supplier) {
      setFormData({
        nom: supplier.nom ? String(supplier.nom) : '',
        adresse: supplier.adresse ? String(supplier.adresse) : '',
        contact: supplier.contact ? String(supplier.contact) : '',
        email: supplier.email ? String(supplier.email) : '',
      })
    } else {
      setFormData({
        nom: '',
        adresse: '',
        contact: '',
        email: '',
      })
    }
    setErrors({})
  }, [supplier, isOpen])

  const validate = () => {
    const newErrors = {}
    
    // Required Nominations
    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis'
    } else if (formData.nom.length > 99) {
      newErrors.nom = 'Le nom ne peut pas dépasser 99 caractères'
    }

    if (!formData.adresse.trim()) {
      newErrors.adresse = 'L\'adresse est requise'
    } else if (formData.adresse.length > 255) {
      newErrors.adresse = 'L\'adresse ne peut pas dépasser 255 caractères'
    }

    // Optionals but restricted
    if (formData.contact && formData.contact.trim().length > 0) {
      if (formData.contact.length > 12 || formData.contact.length < 10) {
        newErrors.contact = 'Le contact doit contenir entre 10 et 12 caractères'
      }
    }

    if (formData.email && formData.email.trim().length > 0) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "L'email n'est pas un format valide"
      } else if (formData.email.length > 255) {
        newErrors.email = 'L\'email ne peut pas dépasser 255 caractères'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      // Clean up empty optional fields to null for backend mapping
      const submissionData = {
        ...formData,
        contact: formData.contact.trim() === '' ? null : formData.contact.trim(),
        email: formData.email.trim() === '' ? null : formData.email.trim()
      }
      onSubmit(submissionData)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear targeted error as user types
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
            {supplier ? 'Modifier Fournisseur' : 'Nouveau Fournisseur'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Nom du Fournisseur *</label>
            <input
              type="text"
              name="nom"
              maxLength={99}
              value={formData.nom}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.nom ? 'border-destructive' : 'border-border'}`}
              placeholder="Ex: Distribution Halal SARL"
            />
            {errors.nom && <p className="mt-1 text-xs text-destructive">{errors.nom}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Adresse *</label>
            <textarea
              name="adresse"
              rows={3}
              maxLength={255}
              value={formData.adresse}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none ${errors.adresse ? 'border-destructive' : 'border-border'}`}
              placeholder="Adresse complète"
            />
            {errors.adresse && <p className="mt-1 text-xs text-destructive">{errors.adresse}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Téléphone (Optionnel)</label>
              <input
                type="text"
                name="contact"
                maxLength={12}
                value={formData.contact}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.contact ? 'border-destructive' : 'border-border'}`}
                placeholder="Ex: 0600000000"
              />
              {errors.contact && <p className="mt-1 text-xs text-destructive">{errors.contact}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email (Optionnel)</label>
              <input
                type="email"
                name="email"
                maxLength={255}
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.email ? 'border-destructive' : 'border-border'}`}
                placeholder="contact@fournisseur.com"
              />
              {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
            </div>
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
              {isLoading ? 'Enregistrement...' : supplier ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

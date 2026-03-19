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
        nom: supplier.nom || '',
        adresse: supplier.adresse || '',
        contact: supplier.contact || '',
        email: supplier.email || '',
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
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis'
    if (!formData.adresse.trim()) newErrors.adresse = "L'adresse est requise"
    if (!formData.contact.trim()) newErrors.contact = 'Le contact est requis'
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      onSubmit(formData)
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card rounded-xl border border-border shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {supplier ? 'Modifier Fournisseur' : 'Nouveau Fournisseur'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Nom
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-background border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.nom ? 'border-destructive' : 'border-border'
              }`}
              placeholder="Nom du fournisseur"
            />
            {errors.nom && (
              <p className="mt-1 text-xs text-destructive">{errors.nom}</p>
            )}
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Adresse
            </label>
            <input
              type="text"
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-background border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.adresse ? 'border-destructive' : 'border-border'
              }`}
              placeholder="Adresse complète"
            />
            {errors.adresse && (
              <p className="mt-1 text-xs text-destructive">{errors.adresse}</p>
            )}
          </div>

          {/* Contact */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Contact
            </label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-background border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.contact ? 'border-destructive' : 'border-border'
              }`}
              placeholder="Numéro de téléphone"
            />
            {errors.contact && (
              <p className="mt-1 text-xs text-destructive">{errors.contact}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Email (optionnel)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-background border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.email ? 'border-destructive' : 'border-border'
              }`}
              placeholder="exemple@email.fr"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Actions */}
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

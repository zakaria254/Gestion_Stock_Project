// src/components/forms/SaleForm.jsx
import { useState, useEffect } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'
import { stockService } from '../../services/api'
import { SALE_STATUS } from '../../data/mockData'

export default function SaleForm({ isOpen, onClose, onSubmit, clients = [], articles = [], isLoading = false }) {
  const [formData, setFormData] = useState({
    clientId: '',
    adresseLivraison: '',
    dateLivraison: new Date().toISOString().split('T')[0],
  })

  // Cart system
  const [items, setItems] = useState([])
  const [currentArticleId, setCurrentArticleId] = useState('')
  const [currentQuantity, setCurrentQuantity] = useState('')
  
  // Real-time stock dictionary: { articleId: availableStockQuantity }
  const [stockMap, setStockMap] = useState({})
  
  const [errors, setErrors] = useState({})
  const [cartError, setCartError] = useState('')

  // Fetch true stock on mount or when opening
  useEffect(() => {
    if (isOpen) {
      const fetchStock = async () => {
        try {
          const stockData = await stockService.getStock()
          const newStockMap = {}
          stockData.forEach(s => {
            newStockMap[Number(s.articleId)] = s.stockActuel
          })
          setStockMap(newStockMap)
        } catch (error) {
          console.error("Error fetching stock mapping:", error)
        }
      }
      fetchStock()
    }
  }, [isOpen])

  // Reset form when opened fresh
  useEffect(() => {
    if (isOpen) {
      setFormData({
        clientId: clients.length > 0 ? clients[0].id : '',
        adresseLivraison: '',
        dateLivraison: new Date().toISOString().split('T')[0],
      })
      setItems([])
      setCurrentArticleId('')
      setCurrentQuantity('')
      setErrors({})
      setCartError('')
    }
  }, [isOpen, clients])

  // Auto-fill address when client changes
  useEffect(() => {
    if (formData.clientId) {
      const client = clients.find(c => String(c.id) === String(formData.clientId))
      if (client && !formData.adresseLivraison) {
        setFormData(prev => ({ ...prev, adresseLivraison: client.adresse }))
      }
    }
  }, [formData.clientId, clients, formData.adresseLivraison])

  const handleAddItem = () => {
    setCartError('')
    if (!currentArticleId || !currentQuantity) {
      setCartError('Veuillez sélectionner un article et une quantité.')
      return
    }

    const qty = Number(currentQuantity)
    if (isNaN(qty) || qty <= 0) {
      setCartError('La quantité doit être supérieure à 0.')
      return
    }

    // CHECK STOCK FRONTEND (Stock validation Mandatory)
    const availableStock = stockMap[Number(currentArticleId)] ?? 0
    
    // Check if item is already in cart, if so, we need to consider total qty
    const existingItemIndex = items.findIndex(i => String(i.articleId) === String(currentArticleId))
    const existingQty = existingItemIndex >= 0 ? items[existingItemIndex].quantite : 0
    const totalRequestedQty = existingQty + qty

    if (totalRequestedQty > availableStock) {
      setCartError(`Stock insuffisant pour cet article. Stock disponible: ${availableStock}`)
      return
    }

    const article = articles.find(a => String(a.id) === String(currentArticleId))
    if (!article) return

    if (existingItemIndex >= 0) {
      // Update existing row
      const newItems = [...items]
      newItems[existingItemIndex].quantite += qty
      newItems[existingItemIndex].total = newItems[existingItemIndex].quantite * newItems[existingItemIndex].prixUnitaire
      setItems(newItems)
    } else {
      // Add new row
      setItems([...items, {
        articleId: article.id,
        articleNom: article.nom,
        quantite: qty,
        prixUnitaire: article.prix,
        total: qty * article.prix
      }])
    }

    // Reset inputs
    setCurrentArticleId('')
    setCurrentQuantity('')
  }

  const handleRemoveItem = (index) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.clientId) newErrors.clientId = 'Veuillez sélectionner un client'
    if (!formData.adresseLivraison) newErrors.adresseLivraison = "L'adresse est requise"
    if (!formData.dateLivraison) newErrors.dateLivraison = 'La date de livraison est requise'
    if (items.length === 0) newErrors.items = 'Le panier ne peut pas être vide'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validate()) {
      const grandTotal = items.reduce((sum, item) => sum + item.total, 0)
      onSubmit({
        ...formData,
        clientId: Number(formData.clientId),
        total: grandTotal,
      }, items)
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

  const grandTotal = items.reduce((sum, item) => sum + item.total, 0)

  // Current article selected stock display
  const currentSelectedStock = currentArticleId ? (stockMap[Number(currentArticleId)] ?? 0) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-card rounded-xl border border-border shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <h2 className="text-lg font-semibold text-foreground">
            Nouvelle Vente
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-6">
          {/* General Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Client</label>
              <select
                name="clientId"
                value={formData.clientId}
                onChange={(e) => {
                  handleChange(e);
                  const client = clients.find(c => String(c.id) === e.target.value);
                  if (client) {
                    setFormData(prev => ({ ...prev, adresseLivraison: client.adresse }));
                  }
                }}
                className={`w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.clientId ? 'border-destructive' : 'border-border'}`}
              >
                <option value="">Sélectionner un client...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.nom} ({client.type})
                  </option>
                ))}
              </select>
              {errors.clientId && <p className="mt-1 text-xs text-destructive">{errors.clientId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Date de Livraison</label>
              <input
                type="date"
                name="dateLivraison"
                value={formData.dateLivraison}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.dateLivraison ? 'border-destructive' : 'border-border'}`}
              />
              {errors.dateLivraison && <p className="mt-1 text-xs text-destructive">{errors.dateLivraison}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Adresse de Livraison</label>
              <input
                type="text"
                name="adresseLivraison"
                value={formData.adresseLivraison}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.adresseLivraison ? 'border-destructive' : 'border-border'}`}
                placeholder="Adresse complète"
              />
              {errors.adresseLivraison && <p className="mt-1 text-xs text-destructive">{errors.adresseLivraison}</p>}
            </div>
          </div>

          <hr className="border-border" />

          {/* Cart System */}
          <div>
            <h3 className="text-md font-semibold text-foreground mb-3">Panier d'Articles</h3>
            
            <div className="flex items-end gap-3 mb-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Article</label>
                <select
                  value={currentArticleId}
                  onChange={(e) => setCurrentArticleId(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Sélectionner...</option>
                  {articles.map(article => (
                    <option key={article.id} value={article.id}>
                      {article.nom} - {article.prix}€/{article.unite}
                    </option>
                  ))}
                </select>
                {currentSelectedStock !== null && (
                  <p className={`mt-1 text-xs font-medium ${currentSelectedStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    Stock actuel: {currentSelectedStock}
                  </p>
                )}
              </div>
              <div className="w-24">
                <label className="block text-xs font-medium text-muted-foreground mb-1">Quantité</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={currentQuantity}
                  onChange={(e) => setCurrentQuantity(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Qté"
                />
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors flex items-center gap-1"
              >
                <Plus className="w-4 h-4" /> Ajouter
              </button>
            </div>

            {cartError && (
              <div className="mb-4 p-2 bg-red-50 text-destructive text-sm rounded-lg border border-red-200">
                {cartError}
              </div>
            )}
            {errors.items && items.length === 0 && (
              <div className="mb-4 text-destructive text-sm">
                {errors.items}
              </div>
            )}

            {/* Cart Data Table */}
            {items.length > 0 && (
              <div className="border border-border rounded-lg overflow-hidden relative">
                <table className="w-full text-sm text-left text-muted-foreground">
                  <thead className="text-xs text-foreground uppercase bg-muted">
                    <tr>
                      <th className="px-4 py-3">Article</th>
                      <th className="px-4 py-3">Prix Unitaire</th>
                      <th className="px-4 py-3">Quantité</th>
                      <th className="px-4 py-3">Sous-total</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{item.articleNom}</td>
                        <td className="px-4 py-3">{item.prixUnitaire.toFixed(2)}€</td>
                        <td className="px-4 py-3">{item.quantite}</td>
                        <td className="px-4 py-3 font-medium">{item.total.toFixed(2)}€</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-muted/30">
                      <td colSpan="3" className="px-4 py-3 text-right font-semibold text-foreground">TOTAL:</td>
                      <td className="px-4 py-3 font-bold text-primary text-lg">{grandTotal.toFixed(2)}€</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-border flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || items.length === 0}
            className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Création...' : 'Créer la commande'}
          </button>
        </div>
      </div>
    </div>
  )
}

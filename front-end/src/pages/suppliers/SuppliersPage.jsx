import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import DataTable from '../../components/tables/DataTable'
import SupplierForm from '../../components/forms/SupplierForm'
import { suppliersService } from '../../services/api'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    setIsLoading(true)
    try {
      const data = await suppliersService.getAll()
      setSuppliers(data)
    } catch (error) {
      showNotification('Erreur lors du chargement des fournisseurs', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleCreate = () => {
    setSelectedSupplier(null)
    setIsFormOpen(true)
  }

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier)
    setIsFormOpen(true)
  }

  const handleDelete = async (supplier) => {
    if (window.confirm(`Voulez-vous vraiment supprimer le fournisseur "${supplier.nom}" ?`)) {
      try {
        await suppliersService.delete(supplier.id)
        setSuppliers(prev => prev.filter(s => s.id !== supplier.id))
        showNotification('Fournisseur supprimé avec succès')
      } catch (error) {
        showNotification('Erreur lors de la suppression', 'error')
      }
    }
  }

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      if (selectedSupplier) {
        const updated = await suppliersService.update(selectedSupplier.id, formData)
        if (updated) {
          setSuppliers(prev => prev.map(s => s.id === selectedSupplier.id ? updated : s))
          showNotification('Fournisseur modifié avec succès')
        }
      } else {
        const newSupplier = await suppliersService.create(formData)
        setSuppliers(prev => [...prev, newSupplier])
        showNotification('Fournisseur créé avec succès')
      }
      setIsFormOpen(false)
    } catch (error) {
      showNotification("Erreur lors de l'enregistrement", 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'nom',
      label: 'Nom',
      render: (supplier) => (
        <span className="font-medium">{supplier.nom}</span>
      ),
    },
    {
      key: 'adresse',
      label: 'Adresse',
    },
    {
      key: 'contact',
      label: 'Contact',
    },
  ]

  const renderActions = (supplier) => (
    <>
      <button
        onClick={() => handleEdit(supplier)}
        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
        title="Modifier"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleDelete(supplier)}
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
          <h1 className="text-2xl font-bold text-foreground">Gestion des Fournisseurs</h1>
          <p className="text-muted-foreground">Gérer les fournisseurs et leurs informations</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouveau Fournisseur
        </button>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-lg ${
            notification.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-green-50 text-green-800 border border-green-200'
          }`}
        >
          {notification.message}
        </div>
      )}

      <DataTable
        data={suppliers}
        columns={columns}
        searchPlaceholder="Rechercher un fournisseur..."
        searchKeys={['nom', 'adresse', 'contact']}
        pageSize={10}
        renderActions={renderActions}
      />

      <SupplierForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        supplier={selectedSupplier}
        isLoading={isSubmitting}
      />
    </div>
  )
}

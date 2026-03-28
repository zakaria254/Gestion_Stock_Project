import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Toaster, toast } from 'sonner'
import DataTable from '../../components/tables/DataTable'
import SupplierForm from '../../components/forms/SupplierForm'
import { supplierService } from '../../services/supplierService'

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await supplierService.getAll()
      // Extract array robustly
      const extractedSuppliers = Array.isArray(response) ? response : response?.data || []
      setSuppliers(Array.isArray(extractedSuppliers) ? extractedSuppliers : [])
    } catch (error) {
      toast.error('Erreur lors du chargement des fournisseurs')
    } finally {
      setIsLoading(false)
    }
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
    if (window.confirm(`Voulez-vous vraiment supprimer le fournisseur ${supplier.nom} ?`)) {
      try {
        await supplierService.delete(Number(supplier.id))
        setSuppliers(prev => prev.filter(s => s.id !== supplier.id))
        toast.success('Fournisseur supprimé avec succès')
      } catch (error) {
        toast.error('Erreur lors de la suppression')
      }
    }
  }

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      if (selectedSupplier) {
        const updated = await supplierService.update(Number(selectedSupplier.id), formData)
        
        // Dynamically insert into table or fallback to refresh
        if (updated && updated.data) {
           setSuppliers(prev => prev.map(s => s.id === selectedSupplier.id ? updated.data : s))
        } else {
           await fetchData()
        }
        toast.success('Fournisseur modifié avec succès')
      } else {
        const response = await supplierService.create(formData)
        const newSupplier = response?.data || response
        
        if (newSupplier && newSupplier.id) {
            setSuppliers(prev => [newSupplier, ...prev])
        } else {
            await fetchData()
        }
        toast.success('Fournisseur créé avec succès')
      }
      setIsFormOpen(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'nom',
      label: 'Nom',
      render: (supplier) => <span className="font-bold">{supplier.nom}</span>
    },
    {
      key: 'adresse',
      label: 'Adresse',
      render: (supplier) => (
        <span className="text-sm truncate max-w-xs inline-block">
          {supplier.adresse}
        </span>
      )
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (supplier) => (
        <span className={supplier.contact ? 'font-mono text-sm' : 'text-slate-400 italic'}>
          {supplier.contact || 'N/A'}
        </span>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (supplier) => (
        <span className={supplier.email ? 'text-blue-600' : 'text-slate-400 italic'}>
          {supplier.email || '-'}
        </span>
      )
    }
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

  if (!Array.isArray(suppliers)) return null;

  return (
    <div className="space-y-6">
      {/* Toast provider styled lightly integrating exactly into dashboard */}
      <Toaster position="top-right" richColors theme="light" />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fournisseurs</h1>
          <p className="text-muted-foreground">Gérez vos contacts et adresses d'approvisionnement</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouveau Fournisseur
        </button>
      </div>

      <DataTable
        data={suppliers}
        columns={columns}
        searchPlaceholder="Rechercher par nom ou contact..."
        searchKeys={['nom', 'contact']}
        pageSize={10}
        renderActions={renderActions}
        emptyMessage={suppliers.length === 0 ? "Aucun fournisseur trouvé" : "Aucun résultat"}
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

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Toaster, toast } from 'sonner'
import DataTable from '../../components/tables/DataTable'
import ClientForm from '../../components/forms/ClientForm'
import { clientService } from '../../services/clientService'

const TYPE_COLORS = {
  'boutique': 'bg-blue-100 text-blue-800 border-blue-200',
  'entreprise': 'bg-purple-100 text-purple-800 border-purple-200',
  'vente_local': 'bg-amber-100 text-amber-800 border-amber-200',
}

const TYPE_LABELS = {
  'boutique': 'Boutique',
  'entreprise': 'Entreprise',
  'vente_local': 'Point de vente local',
}

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    setIsLoading(true)
    try {
      const response = await clientService.getAll()
      // Extract array robustly
      const extractedClients = Array.isArray(response) ? response : response?.data || []
      setClients(Array.isArray(extractedClients) ? extractedClients : [])
    } catch (error) {
      toast.error('Erreur lors du chargement des clients')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setSelectedClient(null)
    setIsFormOpen(true)
  }

  const handleEdit = (client) => {
    setSelectedClient(client)
    setIsFormOpen(true)
  }

  const handleDelete = async (client) => {
    if (window.confirm(`Voulez-vous vraiment supprimer le client "${client.nom}" ?`)) {
      try {
        await clientService.delete(Number(client.id))
        setClients(prev => prev.filter(c => c.id !== client.id))
        toast.success('Client supprimé avec succès')
      } catch (error) {
        toast.error('Erreur lors de la suppression')
      }
    }
  }

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      if (selectedClient) {
        const updated = await clientService.update(Number(selectedClient.id), formData)
        
        // Dynamically insert into table or fallback to refresh
        if (updated && updated.data) {
           setClients(prev => prev.map(c => c.id === selectedClient.id ? updated.data : c))
        } else {
           await fetchClients()
        }
        toast.success('Client modifié avec succès')
      } else {
        const response = await clientService.create(formData)
        const newClient = response?.data || response
        
        if (newClient && newClient.id) {
            setClients(prev => [newClient, ...prev])
        } else {
            await fetchClients()
        }
        toast.success('Client créé avec succès')
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
      render: (client) => <span className="font-bold">{client.nom}</span>
    },
    {
      key: 'adresse',
      label: 'Adresse',
      render: (client) => {
        const addressText = client.adresse || '';
        const isTruncated = addressText.length > 30;
        const displayText = isTruncated ? addressText.substring(0, 30) + '...' : addressText;
        
        return (
          <span 
            className="text-sm text-slate-600 cursor-help" 
            title={addressText}
          >
            {displayText}
          </span>
        )
      }
    },
    {
      key: 'contact',
      label: 'Contact',
      render: (client) => (
        <span className={client.contact ? 'font-mono text-sm' : 'text-slate-400 italic'}>
          {client.contact || 'N/A'}
        </span>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (client) => (
        <span className={client.email ? 'text-blue-600' : 'text-slate-400 italic'}>
          {client.email || '-'}
        </span>
      )
    },
    {
      key: 'type',
      label: 'Type',
      render: (client) => {
        const typeValue = client.type || 'boutique'
        return (
          <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${TYPE_COLORS[typeValue] || 'bg-slate-100 text-slate-800 border-slate-200'}`}>
            {TYPE_LABELS[typeValue] || 'Boutique'}
          </span>
        )
      },
    },
  ]

  const renderActions = (client) => (
    <>
      <button
        onClick={() => handleEdit(client)}
        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
        title="Modifier"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleDelete(client)}
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

  if (!Array.isArray(clients)) return null;

  return (
    <div className="space-y-6">
      <Toaster position="top-right" richColors theme="light" />
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des Clients</h1>
          <p className="text-muted-foreground">Gérer les clients et leurs informations</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouveau Client
        </button>
      </div>

      <DataTable
        data={clients}
        columns={columns}
        searchPlaceholder="Rechercher par nom ou contact..."
        searchKeys={['nom', 'contact']}
        pageSize={10}
        renderActions={renderActions}
        emptyMessage={clients.length === 0 ? "Aucun client trouvé" : "Aucun résultat"}
      />

      <ClientForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        client={selectedClient}
        isLoading={isSubmitting}
      />
    </div>
  )
}

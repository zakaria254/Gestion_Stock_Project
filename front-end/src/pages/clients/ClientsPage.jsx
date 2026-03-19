import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import DataTable from '../../components/tables/DataTable'
import ClientForm from '../../components/forms/ClientForm'
import { clientsService } from '../../services/api'

const TYPE_COLORS = {
  'Boutique': 'bg-blue-100 text-blue-800',
  'Entreprise': 'bg-purple-100 text-purple-800',
  'Point de vente local': 'bg-amber-100 text-amber-800',
}

export default function ClientsPage() {
  const [clients, setClients] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    setIsLoading(true)
    try {
      const data = await clientsService.getAll()
      setClients(data)
    } catch (error) {
      showNotification('Erreur lors du chargement des clients', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
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
        await clientsService.delete(client.id)
        setClients(prev => prev.filter(c => c.id !== client.id))
        showNotification('Client supprimé avec succès')
      } catch (error) {
        showNotification('Erreur lors de la suppression', 'error')
      }
    }
  }

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      if (selectedClient) {
        const updated = await clientsService.update(selectedClient.id, formData)
        if (updated) {
          setClients(prev => prev.map(c => c.id === selectedClient.id ? updated : c))
          showNotification('Client modifié avec succès')
        }
      } else {
        const newClient = await clientsService.create(formData)
        setClients(prev => [...prev, newClient])
        showNotification('Client créé avec succès')
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
      render: (client) => (
        <span className="font-medium">{client.nom}</span>
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
    {
      key: 'type',
      label: 'Type',
      render: (client) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${TYPE_COLORS[client.type] || 'bg-gray-100 text-gray-800'}`}>
          {client.type}
        </span>
      ),
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

  return (
    <div className="space-y-6">
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
        data={clients}
        columns={columns}
        searchPlaceholder="Rechercher un client..."
        searchKeys={['nom', 'adresse', 'contact', 'type']}
        pageSize={10}
        renderActions={renderActions}
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

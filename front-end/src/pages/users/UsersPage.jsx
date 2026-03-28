import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import DataTable from '../../components/tables/DataTable'
import UserForm from '../../components/forms/UserForm'
import { userService } from '../../services/userService'

const ROLE_LABELS = {
  admin: 'Administrateur',
  ventes: 'Ventes',
  stock: 'Stock',
}

const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-800',
  ventes: 'bg-blue-100 text-blue-800',
  stock: 'bg-amber-100 text-amber-800',
}

const STATUS_LABELS = {
  active: 'Actif',
  inactive: 'Inactif',
}

const STATUS_COLORS = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-red-100 text-red-800',
}

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleError = (error, defaultMsg) => {
    if (error?.response?.status === 403) {
      showNotification('Access denied', 'error')
    } else {
      showNotification(error?.response?.data?.message || defaultMsg, 'error')
    }
  }

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await userService.getAll()
      console.log('API Response:', response) // Added for debugging
      
      const extractedData = Array.isArray(response) ? response : response?.data || []
      const safeData = Array.isArray(extractedData) ? extractedData : []
      setUsers(safeData)
    } catch (error) {
      handleError(error, 'Erreur lors du chargement des utilisateurs')
    } finally {
      setIsLoading(false)
    }
  }

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleCreate = () => {
    setSelectedUser(null)
    setIsFormOpen(true)
  }

  const handleEdit = (user) => {
    setSelectedUser(user)
    setIsFormOpen(true)
  }

  const handleDelete = async (user) => {
    if (window.confirm(`Voulez-vous vraiment supprimer l'utilisateur ${user.prenom} ${user.nom} ?`)) {
      try {
        await userService.delete(user.id)
        setUsers(prev => prev.filter(u => u.id !== user.id))
        showNotification('Utilisateur supprimé avec succès')
      } catch (error) {
        handleError(error, 'Erreur lors de la suppression')
      }
    }
  }

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      if (selectedUser) {
        await userService.update(selectedUser.id, formData)
        await fetchUsers()
        showNotification('Utilisateur modifié avec succès')
      } else {
        await userService.create(formData)
        await fetchUsers()
        showNotification('Utilisateur créé avec succès')
      }
      setIsFormOpen(false)
    } catch (error) {
      handleError(error, 'Erreur lors de l\'enregistrement')
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = [
    {
      key: 'nom',
      label: 'Nom',
      render: (user) => (
        <span className="font-medium">{user.prenom} {user.nom}</span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
    },
    {
      key: 'role',
      label: 'Rôle',
      render: (user) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${ROLE_COLORS[user.role]}`}>
          {ROLE_LABELS[user.role]}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      render: (user) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[user.status]}`}>
          {STATUS_LABELS[user.status]}
        </span>
      ),
    },
  ]

  const renderActions = (user) => (
    <>
      <button
        onClick={() => handleEdit(user)}
        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
        title="Modifier"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={() => handleDelete(user)}
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

  if (!Array.isArray(users)) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gestion des Utilisateurs</h1>
          <p className="text-muted-foreground">Gérer les comptes employés</p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nouvel Utilisateur
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
        data={users}
        columns={columns}
        searchPlaceholder="Rechercher un utilisateur..."
        searchKeys={['nom', 'prenom', 'email']}
        pageSize={10}
        renderActions={renderActions}
      />

      <UserForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        user={selectedUser}
        isLoading={isSubmitting}
      />
    </div>
  )
}

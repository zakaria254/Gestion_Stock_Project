import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Key } from 'lucide-react'
import DataTable from '../../components/tables/DataTable'
import UserForm from '../../components/forms/UserForm'
import { usersService, generateAccessCode } from '../../services/api'
import { STATUS } from '../../data/mockData'
import { STATUS_LABELS } from '../../utils/utils'

const ROLE_LABELS = {
  ADMIN: 'Administrateur',
  SALES: 'Ventes',
  STOCK: 'Stock',
}

const ROLE_COLORS = {
  ADMIN: 'bg-purple-100 text-purple-800',
  SALES: 'bg-blue-100 text-blue-800',
  STOCK: 'bg-amber-100 text-amber-800',
}

const STATUS_COLORS = {
  [STATUS.ACTIVE]: 'bg-green-100 text-green-800',
  [STATUS.INACTIVE]: 'bg-red-100 text-red-800',
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

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const data = await usersService.getAll()
      setUsers(data)
    } catch (error) {
      showNotification('Erreur lors du chargement des utilisateurs', 'error')
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
        await usersService.delete(user.id)
        setUsers(prev => prev.filter(u => u.id !== user.id))
        showNotification('Utilisateur supprimé avec succès')
      } catch (error) {
        showNotification('Erreur lors de la suppression', 'error')
      }
    }
  }

  const handleGenerateCode = async (user) => {
    try {
      const newCode = generateAccessCode(user.role)
      const updated = await usersService.update(user.id, { accessCode: newCode })
      if (updated) {
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, accessCode: newCode } : u))
        showNotification(`Nouveau code généré : ${newCode}`)
      }
    } catch (error) {
      showNotification('Erreur lors de la génération du code', 'error')
    }
  }

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true)
    try {
      if (selectedUser) {
        const updated = await usersService.update(selectedUser.id, formData)
        if (updated) {
          setUsers(prev => prev.map(u => u.id === selectedUser.id ? updated : u))
          showNotification('Utilisateur modifié avec succès')
        }
      } else {
        const newUser = await usersService.create(formData)
        setUsers(prev => [...prev, newUser])
        showNotification(`Utilisateur créé avec succès. Code d'accès : ${newUser.accessCode}`)
      }
      setIsFormOpen(false)
    } catch (error) {
      showNotification('Erreur lors de l\'enregistrement', 'error')
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
        onClick={() => handleGenerateCode(user)}
        className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
        title="Générer un nouveau code d'accès"
      >
        <Key className="h-4 w-4" />
      </button>
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

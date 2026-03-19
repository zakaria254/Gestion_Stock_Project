import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard,
  Users,
  Truck,
  UserCheck,
  Package,
  Factory,
  Warehouse,
  ShoppingCart,
  FileText,
  ArrowRightLeft,
  X,
} from 'lucide-react'
import { cn } from '../../utils/utils'
import logo from '../../assets/logo.jpg'

const menuItems = [
  {
    label: 'Tableau de bord',
    icon: LayoutDashboard,
    path: '/dashboard',
    roles: ['ADMIN'],
  },
  {
    label: 'Utilisateurs',
    icon: Users,
    path: '/users',
    roles: ['ADMIN'],
  },
  {
    label: 'Fournisseurs',
    icon: Truck,
    path: '/suppliers',
    roles: ['ADMIN'],
  },
  {
    label: 'Clients',
    icon: UserCheck,
    path: '/clients',
    roles: ['ADMIN', 'SALES'],
  },
  {
    label: 'Articles',
    icon: Package,
    path: '/articles',
    roles: ['ADMIN', 'STOCK'],
  },
  {
    label: 'Production',
    icon: Factory,
    path: '/production',
    roles: ['ADMIN', 'STOCK'],
  },
  {
    label: 'Stock',
    icon: Warehouse,
    path: '/stock',
    roles: ['ADMIN', 'STOCK'],
  },
  {
    label: 'Mouv. Stock',
    icon: ArrowRightLeft,
    path: '/stock/movements',
    roles: ['ADMIN', 'STOCK'],
  },
  {
    label: 'Ventes',
    icon: ShoppingCart,
    path: '/sales',
    roles: ['ADMIN', 'SALES'],
  },
  {
    label: 'Factures',
    icon: FileText,
    path: '/invoices',
    roles: ['ADMIN', 'SALES'],
  },
]

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth()

  const userRole = user?.role?.toUpperCase()?.trim() || '';
  let normalizedRole = userRole;
  if (['VENTE', 'VENTES', 'VENDEUR', 'SALES'].includes(userRole)) normalizedRole = 'SALES';
  if (['STOCK', 'MAGASIN', 'MAGASINIER'].includes(userRole)) normalizedRole = 'STOCK';

  // Filtrer les items selon le rôle de l'utilisateur
  const visibleItems = menuItems.filter(item =>
    normalizedRole === 'ADMIN' || item.roles.includes(normalizedRole)
  )

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-0 flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="HOUATNOUR logo"
              className="h-10 w-10 rounded-xl object-cover shrink-0"
            />
            <div>
              <h1 className="font-bold text-sm text-card-foreground tracking-wide uppercase">HOUATNOUR</h1>
              <p className="text-[10px] text-muted-foreground uppercase opacity-70">Gestion de Stock</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {visibleItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              end={item.path === '/stock'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="block">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border mt-auto bg-card">
          <div className="px-4 py-3 rounded-xl bg-muted">
            <p className="text-xs text-muted-foreground">Connecté en tant que</p>
            <p className="text-sm font-medium text-card-foreground truncate">
              {user?.prenom} {user?.nom}
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
              {user?.role}
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}

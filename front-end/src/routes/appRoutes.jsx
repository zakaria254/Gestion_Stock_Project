import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/layout/DashboardLayout'
import LoginPage from '../pages/login/LoginPage'
import DashboardPage from '../pages/dashboard/DashboardPage'
import UsersPage from '../pages/users/UsersPage'
import ClientsPage from '../pages/clients/ClientsPage'
import SuppliersPage from '../pages/suppliers/SuppliersPage'
import ArticlesPage from "../pages/articles/ArticlesPage"
import ProductionLotsPage from "../pages/production/ProductionLotsPage"
import StockPage from "../pages/stock/StockPage"
import StockMovementsPage from "../pages/stock/StockMovementsPage"
import SalesPage from "../pages/sales/SalesPage"
import InvoicesPage from "../pages/invoices/InvoicesPage"

// Placeholder pages pour les futures phases
const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <p className="text-muted-foreground mt-2">Page en cours de développement</p>
    </div>
  </div>
)

// Composant de protection des routes
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const userRole = user?.role?.toUpperCase()?.trim() || '';
  let normalizedRole = userRole;
  if (['VENTE', 'VENTES', 'VENDEUR', 'SALES'].includes(userRole)) normalizedRole = 'SALES';
  if (['STOCK', 'MAGASIN', 'MAGASINIER'].includes(userRole)) normalizedRole = 'STOCK';

  if (allowedRoles && !allowedRoles.includes(normalizedRole)) {
    if (normalizedRole === 'SALES') {
      return <Navigate to="/sales" replace />
    }
    if (normalizedRole === 'STOCK') {
      return <Navigate to="/production" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// Redirection après login selon le rôle
function RoleBasedRedirect() {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const userRole = user?.role?.toUpperCase()?.trim() || '';
  const normalizedRole = userRole === 'VENTE' || userRole === 'VENTES' ? 'SALES' : userRole;

  switch (normalizedRole) {
    case 'ADMIN':
      return <Navigate to="/dashboard" replace />
    case 'SALES':
      return <Navigate to="/sales" replace />
    case 'STOCK':
      return <Navigate to="/production" replace />
    default:
      return <Navigate to="/dashboard" replace />
  }
}

export default function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Route de login */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <RoleBasedRedirect /> : <LoginPage />} 
      />

      {/* Route racine */}
      <Route path="/" element={<RoleBasedRedirect />} />

      {/* Routes protégées avec layout dashboard */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard - Admin seulement */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Gestion des utilisateurs - Admin seulement */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <UsersPage />
            </ProtectedRoute>
          }
        />

        {/* Fournisseurs - Admin seulement */}
        <Route
          path="/suppliers"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <SuppliersPage />
            </ProtectedRoute>
          }
        />

        {/* Clients - Admin et Sales */}
        <Route
          path="/clients"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES']}>
              <ClientsPage />
            </ProtectedRoute>
          }
        />

        {/* Articles - Admin et Stock */}
        <Route
          path="/articles"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STOCK']}>
              <ArticlesPage />
            </ProtectedRoute>
          }
        />

        {/* Production - Admin et Stock */}
        <Route
          path="/production"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STOCK']}>
              <ProductionLotsPage />
            </ProtectedRoute>
          }
        />

        {/* Stock - Admin et Stock */}
        <Route
          path="/stock"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STOCK']}>
              <StockPage />
            </ProtectedRoute>
          }
        />

        {/* Mouvements de Stock - Admin et Stock */}
        <Route
          path="/stock/movements"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'STOCK']}>
              <StockMovementsPage />
            </ProtectedRoute>
          }
        />

        {/* Ventes - Admin et Sales */}
        <Route
          path="/sales"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES']}>
              <SalesPage />
            </ProtectedRoute>
          }
        />

        {/* Factures - Admin et Sales */}
        <Route
          path="/invoices"
          element={
            <ProtectedRoute allowedRoles={['ADMIN', 'SALES']}>
              <InvoicesPage />
            </ProtectedRoute>
          }
        />
      </Route>


      {/* Route 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

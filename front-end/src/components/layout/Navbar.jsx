import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { notificationsService } from '../../services/api'
import {
  Menu,
  Bell,
  LogOut,
  User,
  ChevronDown,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info
} from 'lucide-react'
import { cn } from '../../utils/utils'

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    let lastCount = 0
    const unsubscribe = notificationsService.subscribe((data) => {
      setNotifications(data)
      const unread = data.filter(n => !n.isRead)
      if (unread.length > lastCount && unread.length > 0) {
        setToast(unread[0])
        setTimeout(() => setToast(null), 5000)
      }
      lastCount = unread.length
    })
    
    // Initial fetch
    notificationsService.getNotifications().then(setNotifications)

    return () => unsubscribe()
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead).length
  const recentNotifs = notifications.slice(0, 5)

  const markAllAsRead = async () => {
    await notificationsService.markAllAsRead()
  }

  const markAsRead = async (id) => {
    await notificationsService.markAsRead(id)
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const getRoleLabel = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'Administrateur'
      case 'SALES':
        return 'Commercial'
      case 'STOCK':
        return 'Gestionnaire Stock'
      default:
        return role
    }
  }

  return (
    <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <Menu className="w-5 h-5 text-muted-foreground" />
        </button>
        <h2 className="text-lg font-semibold text-card-foreground hidden sm:block">
          HOUATNOUR - Gestion de Stock
        </h2>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full border border-card">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {/* Notification Dropdown */}
          {isNotifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-card rounded-xl border border-border shadow-lg z-50 overflow-hidden flex flex-col">
                <div className="p-3 border-b border-border flex justify-between items-center bg-muted/30">
                  <h3 className="text-sm font-semibold text-card-foreground">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Marquer tout comme lu
                    </button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {recentNotifs.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground italic">Aucune notification</div>
                  ) : (
                    recentNotifs.map(notif => (
                      <div 
                        key={notif.id} 
                        className={`p-3 border-b border-border text-sm flex items-start gap-3 transition-colors cursor-pointer ${notif.isRead ? 'opacity-60 bg-transparent' : 'bg-primary/5 hover:bg-primary/10'}`}
                        onClick={() => markAsRead(notif.id)}
                      >
                        <div className="mt-0.5">
                          {notif.type === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                          {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                          {notif.type === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                          {notif.type === 'info' && <Info className="w-4 h-4 text-primary" />}
                        </div>
                        <div className="flex-1">
                          <p className={`text-card-foreground ${!notif.isRead ? 'font-medium' : ''}`}>{notif.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {new Date(notif.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {!notif.isRead && <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-card-foreground">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-xs text-muted-foreground">
                {getRoleLabel(user?.role)}
              </p>
            </div>
            <ChevronDown className={cn(
              'w-4 h-4 text-muted-foreground transition-transform hidden md:block',
              dropdownOpen && 'transform rotate-180'
            )} />
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-card rounded-xl border border-border shadow-lg z-50">
                <div className="p-4 border-b border-border">
                  <p className="text-sm font-medium text-card-foreground">
                    {user?.prenom} {user?.nom}
                  </p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <div className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Se déconnecter
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Global Toast Component */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-[100] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-card border border-border shadow-2xl rounded-xl p-4 flex items-start gap-3 w-80">
            <div className="mt-0.5">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
              {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-primary" />}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-card-foreground capitalize">
                {toast.type === 'info' ? 'Information' : toast.type === 'warning' ? 'Alerte' : toast.type === 'success' ? 'Succès' : 'Erreur'}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button onClick={() => setToast(null)} className="text-muted-foreground hover:text-foreground hover:bg-muted p-1 rounded-md transition-colors">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  )
}

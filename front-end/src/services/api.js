import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
})

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => Promise.reject(error))

// Handle 401 Unauthenticated
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Don't intercept 401 responses ON the login call itself
      const requestUrl = error.config?.url || ''
      if (!requestUrl.includes('/login')) {
        localStorage.removeItem('token')
        // Use replace to root so React Router's auth guard redirects to /login
        // NEVER use window.location.href = '/login' — that sends GET to Laravel (405!)
        window.location.replace('/')
      }
    }
    return Promise.reject(error)
  }
)

import {
  users,
  suppliers,
  clients,
  articles,
  productionLots,
  stock,
  sales,
  saleItems,
  salesByMonth,
  stockByArticle,
  invoiceStatusData,
  STATUS,
  INVOICE_STATUS,
  SALE_STATUS,
  stockMovements,
} from '../data/mockData'

import { invoicesService as realInvoicesService } from './invoicesService'

// Simule un délai réseau
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

// Génère un ID numérique unique
let idCounter = 1000
const generateId = () => ++idCounter

// Génère un code d'accès
const generateAccessCode = (role = 'USR') => {
  const prefix = role.substring(0, 3).toUpperCase()
  const random = Math.random().toString(36).substring(2, 5).toUpperCase()
  return `${prefix}${random}`
}

// ===== NOTIFICATIONS =====
let notifications = [
  { id: Date.now(), type: 'info', message: 'Système de notifications initialisé', timestamp: new Date().toISOString(), isRead: false }
]
let notificationListeners = []

export const notificationsService = {
  subscribe(listener) {
    notificationListeners.push(listener)
    listener([...notifications])
    return () => {
      notificationListeners = notificationListeners.filter(l => l !== listener)
    }
  },
  notify() {
    const sorted = [...notifications].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    notificationListeners.forEach(listener => listener(sorted))
  },
  async getNotifications() {
    await delay(100)
    return [...notifications].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  },
  async addNotification({ type, message }) {
    await delay(50)
    const newNotif = {
      id: generateId(),
      type, // 'info', 'success', 'warning', 'error'
      message,
      timestamp: new Date().toISOString(),
      isRead: false
    }
    notifications.push(newNotif)
    this.notify()
    return newNotif
  },
  async markAllAsRead() {
    await delay(50)
    notifications = notifications.map(n => ({ ...n, isRead: true }))
    this.notify()
    return true
  },
  async markAsRead(id) {
    await delay(50)
    const index = notifications.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications[index].isRead = true
      this.notify()
    }
    return true
  }
}

// ===== AUTHENTIFICATION =====
export const authService = {
  async login(email, accessCode) {
    await delay()
    const user = users.find(
      u => u.email === email && u.accessCode === accessCode && u.status === STATUS.ACTIVE
    )
    if (user) {
      return { success: true, user }
    }
    return { success: false, message: 'Email ou code d\'accès invalide' }
  },

  async logout() {
    await delay(100)
    return { success: true }
  },
}

// ===== UTILISATEURS =====
let usersData = [...users]

export const usersService = {
  async getAll() {
    await delay()
    return [...usersData]
  },

  async getById(id) {
    await delay()
    return usersData.find(u => u.id === id) || null
  },

  async create(userData) {
    await delay()
    const newUser = {
      ...userData,
      id: generateId(),
      accessCode: generateAccessCode(userData.role),
      dateCreation: new Date().toISOString().split('T')[0],
    }
    usersData.push(newUser)
    return newUser
  },

  async update(id, userData) {
    await delay()
    const index = usersData.findIndex(u => u.id === id)
    if (index !== -1) {
      usersData[index] = { ...usersData[index], ...userData }
      return usersData[index]
    }
    return null
  },

  async delete(id) {
    await delay()
    usersData = usersData.filter(u => u.id !== id)
    return { success: true }
  },

  async generateNewAccessCode(id) {
    await delay()
    const index = usersData.findIndex(u => u.id === id)
    if (index !== -1) {
      usersData[index].accessCode = generateAccessCode(usersData[index].role)
      return usersData[index]
    }
    return null
  },
}

// ===== FOURNISSEURS =====
let suppliersData = [...suppliers]

export const suppliersService = {
  async getAll() {
    await delay()
    return [...suppliersData]
  },

  async getById(id) {
    await delay()
    return suppliersData.find(s => s.id === id) || null
  },

  async create(supplierData) {
    await delay()
    const newSupplier = {
      ...supplierData,
      id: generateId(),
    }
    suppliersData.push(newSupplier)
    return newSupplier
  },

  async update(id, supplierData) {
    await delay()
    const index = suppliersData.findIndex(s => s.id === id)
    if (index !== -1) {
      suppliersData[index] = { ...suppliersData[index], ...supplierData }
      return suppliersData[index]
    }
    return null
  },

  async delete(id) {
    await delay()
    suppliersData = suppliersData.filter(s => s.id !== id)
    return { success: true }
  },
}

// ===== CLIENTS =====
let clientsData = [...clients]

export const clientsService = {
  async getAll() {
    await delay()
    return [...clientsData]
  },

  async getById(id) {
    await delay()
    return clientsData.find(c => c.id === id) || null
  },

  async create(clientData) {
    await delay()
    const newClient = {
      ...clientData,
      id: generateId(),
    }
    clientsData.push(newClient)
    return newClient
  },

  async update(id, clientData) {
    await delay()
    const index = clientsData.findIndex(c => c.id === id)
    if (index !== -1) {
      clientsData[index] = { ...clientsData[index], ...clientData }
      return clientsData[index]
    }
    return null
  },

  async delete(id) {
    await delay()
    clientsData = clientsData.filter(c => c.id !== id)
    return { success: true }
  },
}

// ===== ARTICLES =====
let articlesData = [...articles]

export const articlesService = {
  async getAll() {
    await delay()
    return [...articlesData]
  },

  async getById(id) {
    await delay()
    return articlesData.find(a => a.id === id) || null
  },

  async create(articleData) {
    await delay()
    const newArticle = {
      ...articleData,
      id: generateId(),
    }
    articlesData.push(newArticle)
    return newArticle
  },

  async update(id, articleData) {
    await delay()
    const index = articlesData.findIndex(a => a.id === id)
    if (index !== -1) {
      articlesData[index] = { ...articlesData[index], ...articleData }
      return articlesData[index]
    }
    return null
  },

  async delete(id) {
    await delay()
    articlesData = articlesData.filter(a => a.id !== id)
    return { success: true }
  },
}

// ===== PRODUCTION =====
let productionData = [...productionLots]

export const productionService = {
  async getAll() {
    await delay()
    return [...productionData]
  },

  async getById(id) {
    await delay()
    return productionData.find(p => p.id === id) || null
  },

  async create(lotData) {
    await delay()
    const article = articlesData.find(a => a.id === lotData.articleId)
    const newLot = {
      ...lotData,
      id: generateId(),
      articleNom: article?.nom || '',
      numeroLot: `LOT-${new Date().getFullYear()}-${String(productionData.length + 1).padStart(3, '0')}`,
    }
    productionData.push(newLot)
    return newLot
  },

  async update(id, lotData) {
    await delay()
    const index = productionData.findIndex(p => p.id === id)
    if (index !== -1) {
      productionData[index] = { ...productionData[index], ...lotData }
      return productionData[index]
    }
    return null
  },

  async delete(id) {
    await delay()
    productionData = productionData.filter(p => p.id !== id)
    return { success: true }
  },
}

// ===== STOCK =====
let stockData = [...stock]

export const stockService = {
  async getAll() {
    await delay()
    return [...stockData]
  },

  async getById(id) {
    await delay()
    return stockData.find(s => s.id === id) || null
  },

  async updateQuantity(id, quantite) {
    await delay()
    const index = stockData.findIndex(s => s.id === id)
    if (index !== -1) {
      stockData[index].quantiteDisponible = quantite
      stockData[index].derniereMiseAJour = new Date().toISOString().split('T')[0]
      return stockData[index]
    }
    return null
  },

  async getStock() {
    await delay()
    
    // Calcul dynamique du stock
    // stock = SUM(ENTREE) - SUM(SORTIE)
    
    return articlesData.map(article => {
      const movements = stockMovementsData.filter(m => m.articleId === article.id);
      
      let totalEntrees = 0;
      let totalSorties = 0;
      
      movements.forEach(m => {
        if (m.type === 'ENTREE') totalEntrees += Number(m.quantite);
        if (m.type === 'SORTIE') totalSorties += Number(m.quantite);
      });
      
      const stockActuel = totalEntrees - totalSorties;
      
      return {
        id: article.id,
        articleId: article.id,
        articleNom: article.nom,
        categorie: article.categorie,
        stockActuel: stockActuel,
        seuilMinimum: article.seuilMinimum || 0,
        unite: article.unite
      };
    });
  }
}

// ===== MOUVEMENTS DE STOCK =====
let stockMovementsData = [...stockMovements]

export const stockMovementsService = {
  async getAll() {
    await delay()
    return [...stockMovementsData]
  },

  async getById(id) {
    await delay()
    return stockMovementsData.find(m => m.id === id) || null
  },

  async create(movementData) {
    await delay()
    
    // Backend Validation for SORTIE
    if (movementData.type === 'SORTIE') {
      const stockData = await stockService.getStock()
      const currentStock = stockData.find(s => s.articleId === Number(movementData.articleId))?.stockActuel || 0
      
      if (Number(movementData.quantite) > currentStock) {
        throw new Error('Stock insuffisant')
      }
    }

    const newMovement = {
      ...movementData,
      id: generateId(),
      date: movementData.date || new Date().toISOString().split('T')[0]
    }
    stockMovementsData.push(newMovement)
    return newMovement
  },

  async update(id, movementData) {
    await delay()
    const index = stockMovementsData.findIndex(m => m.id === id)
    if (index !== -1) {
      const oldMovement = stockMovementsData[index]
      
      // Backend Validation for SORTIE
      if (movementData.type === 'SORTIE') {
        const stockData = await stockService.getStock()
        let currentStock = stockData.find(s => s.articleId === Number(movementData.articleId))?.stockActuel || 0
        
        // Compensate current stock by reverting the old movement effect if it's the same article
        if (oldMovement.type === 'SORTIE' && Number(oldMovement.articleId) === Number(movementData.articleId)) {
          currentStock += Number(oldMovement.quantite)
        } else if (oldMovement.type === 'ENTREE' && Number(oldMovement.articleId) === Number(movementData.articleId)) {
          currentStock -= Number(oldMovement.quantite)
        }
        
        if (Number(movementData.quantite) > currentStock) {
          throw new Error('Stock insuffisant')
        }
      }
      
      stockMovementsData[index] = { ...stockMovementsData[index], ...movementData }
      return stockMovementsData[index]
    }
    return null
  },

  async delete(id) {
    await delay()
    stockMovementsData = stockMovementsData.filter(m => m.id !== id)
    return { success: true }
  }
}

// ===== VENTES =====
let salesData = [...sales]
let saleItemsData = [...saleItems]

export const salesService = {
  async getAll() {
    await delay()
    return salesData.filter(Boolean).map(sale => ({
      ...sale,
      status: sale?.status || SALE_STATUS.EN_ATTENTE,
      total: Number(sale?.total || 0),
    }))
  },

  async getById(id) {
    await delay()
    const sale = salesData.find(s => Number(s.id) === Number(id))
    if (sale) {
      const items = saleItemsData.filter(item => Number(item.saleId) === Number(id))
      return { ...sale, items }
    }
    return null
  },

  async create(saleData, items) {
    await delay()
    const client = clientsData.find(c => c.id === saleData.clientId)
    const newSale = {
      ...saleData,
      total: Number(saleData.total || 0),
      id: generateId(),
      numero: `VNT-${new Date().getFullYear()}-${String(salesData.length + 1).padStart(3, '0')}`,
      clientNom: client?.nom || '',
      dateCreation: new Date().toISOString().split('T')[0],
      status: SALE_STATUS.EN_ATTENTE,
    }
    salesData.push(newSale)

    items.forEach(item => {
      const article = articlesData.find(a => a.id === item.articleId)
      saleItemsData.push({
        ...item,
        id: generateId(),
        saleId: newSale.id,
        articleNom: article?.nom || '',
      })
    })

    // Auto-trigger info
    await notificationsService.addNotification({ type: 'info', message: `Nouvelle vente créée : ${newSale.numero}` })

    return newSale
  },

  async updateSaleStatus(id, newStatus) {
    await delay()
    const numId = Number(id)
    const index = salesData.findIndex(s => Number(s.id) === numId)
    if (index === -1) return { success: false, message: 'Vente introuvable' }
    
    const sale = salesData[index]
    if (!sale) return { success: false, message: 'Vente introuvable' }
    sale.status = sale?.status || SALE_STATUS.EN_ATTENTE
    const items = saleItemsData.filter(item => Number(item.saleId) === numId)
    
    // Status Flow validation
    if (sale.status === newStatus) return { success: true, sale }

    // Logic: moving TO VALIDEE
    if (newStatus === SALE_STATUS.VALIDEE) {
      // 1. Validate Stock using single source of truth (stockService)
      const currentStocks = await stockService.getStock()
      
      for (const item of items) {
        const stockInfo = currentStocks.find(s => s.articleId === Number(item.articleId))
        const stockDispo = stockInfo ? stockInfo.stockActuel : 0
        if (Number(item.quantite) > stockDispo) {
          throw new Error(`Stock insuffisant pour l'article ${item.articleNom}`)
        }
      }

      // 2. Create Stock Movements (SORTIE) for each item
      for (const item of items) {
        await stockMovementsService.create({
          articleId: item.articleId,
          type: 'SORTIE',
          quantite: item.quantite,
          motif: 'Vente',
          date: new Date().toISOString().split('T')[0]
        })
      }

      // 3. Auto-create Invoice
      await invoicesService.create({
        saleId: sale.id,
        clientId: sale.clientId,
        montantTotal: Number(sale.total || 0),
        status: INVOICE_STATUS.UNPAID,
      })
      
      // Auto-trigger Success
      await notificationsService.addNotification({ type: 'success', message: `Vente validée avec succès` })

      // Validate Stock Thresholds and Issue Warnings
      for (const item of items) {
        const stockInfo = currentStocks.find(s => s.articleId === Number(item.articleId))
        if (stockInfo && stockInfo.stockActuel <= stockInfo.seuilMinimum) {
          await notificationsService.addNotification({ 
            type: 'warning', 
            message: `Stock faible pour ${item.articleNom} (${stockInfo.stockActuel} res.)` 
          })
        }
      }
    }
    
    // Logic: moving FROM VALIDEE TO ANNULEE (Restoring stock)
    if (sale.status === SALE_STATUS.VALIDEE && newStatus === SALE_STATUS.ANNULEE) {
      // Need to revert the stock by creating ENTREE movements (Retour Vente)
      for (const item of items) {
        await stockMovementsService.create({
          articleId: item.articleId,
          type: 'ENTREE',
          quantite: item.quantite,
          motif: 'Annulation Vente',
          date: new Date().toISOString().split('T')[0]
        })
      }
      // Note: invoices would realistically be cancelled too, but following direct constraints.
    }

    // Update the main object status
    salesData[index].status = newStatus
    return { success: true, sale: salesData[index] }
  },

  async delete(id) {
    await delay()
    const numId = Number(id)
    salesData = salesData.filter(s => Number(s.id) !== numId)
    saleItemsData = saleItemsData.filter(item => Number(item.saleId) !== numId)
    return { success: true }
  },
}

// ===== FACTURES =====

export const invoicesService = realInvoicesService;

// ===== DASHBOARD =====
export const dashboardService = {
  async getStats() {
    const response = await api.get('/dashboard')
    const data = response.data?.data || response.data
    
    // Fallback for fields not yet in backend
    return {
      ...data,
      ventesValideesMois: data.salesValidee || 0,
      valeurStock: data.stockValue || 0,
      alertesStock: data.stocksAlerts || 0,
      commandesEnAttente: data.pendingSales || 0,
      totalClients: data.clientsCount || 0,
      totalArticles: data.articlesCount || 0,
      facturesImpayees: data.unpaidFactures || 0,
      totalFournisseurs: data.supplierCount || 0,
      stockNegatif: 0, // Not yet in backend
      evolutionVentes: [], // Not yet in backend
      repartitionStock: [], // Not yet in backend
      topArticles: [], // Not yet in backend
    }
  },

  async getSalesByMonth() {
    await delay()
    return [...salesByMonth]
  },

  async getStockByArticle() {
    await delay()
    return [...stockByArticle]
  },

  async getInvoiceStatusData() {
    await delay()
    return [...invoiceStatusData]
  },
}

// Export utils
export { generateId, generateAccessCode }


import { api } from './api'
import { SALE_STATUS } from '../data/mockData'

const normalizeStatus = (status) => {
  const s = String(status || '').toLowerCase()
  if (s.startsWith('val')) return SALE_STATUS.VALIDEE
  if (s.startsWith('ann')) return SALE_STATUS.ANNULEE
  return SALE_STATUS.EN_ATTENTE
}

const buildNumero = () => {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `VNT-${yyyy}${mm}${dd}-${rand}`
}

export const saleService = {
  async getAll() {
    const response = await api.get('/sales')
    const data = response.data?.data || response.data || []
    return Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : [])
  },

  async getById(id) {
    let sale = null
    try {
      const response = await api.get(`/sales/${id}`)
      sale = response.data?.data || response.data
    } catch (e) {
      // Fallback: API show endpoint not implemented, pull from list
      const all = await saleService.getAll()
      sale = all.find((s) => Number(s.id) === Number(id)) || null
    }
    if (!sale) return null

    // Map articles with pivot to items for UI consumption
    const items =
      sale.articles?.map((article) => {
        const quantite = Number(article.pivot?.quantite || 0);
        const prixUnitaire = Number(article.pivot?.prix_unitaire || 0);
        const total = article.pivot?.total ? Number(article.pivot.total) : (quantite * prixUnitaire);
        
        return {
          articleId: article.id,
          articleNom: article.nom,
          quantite,
          prixUnitaire,
          total,
        };
      }) || []

    return {
      ...sale,
      items,
      total: sale.montant_total || sale.total || 0,
      status: normalizeStatus(sale.status),
      clientNom: sale.client?.nom || sale.clientNom,
      dateCreation: sale.created_at || sale.date_vente,
    }
  },

  async create(saleData, items) {
    const payload = {
      numero: buildNumero(),
      client_id: saleData.clientId,
      adresse_livraison: saleData.adresseLivraison || '',
      date_livraison: saleData.dateLivraison || null,
      date_vente: saleData.dateLivraison || new Date().toISOString().split('T')[0],
      status: 'En attente',
      articles: items.map((item) => ({
        id: item.articleId,
        quantite: item.quantite,
        prix_unitaire: item.prixUnitaire,
      })),
    }

    const response = await api.post('/sales', payload)
    return response.data?.data || response.data
  },

  async update(id, saleData, items) {
    const payload = {
      numero: saleData.numero,
      client_id: saleData.clientId,
      adresse_livraison: saleData.adresseLivraison || '',
      date_livraison: saleData.dateLivraison || null,
      date_vente: saleData.dateLivraison || new Date().toISOString().split('T')[0],
      status: saleData.status || 'En attente',
      articles: items.map((item) => ({
        id: item.articleId,
        quantite: item.quantite,
        prix_unitaire: item.prixUnitaire,
      })),
    }

    const response = await api.put(`/sales/${id}`, payload)
    return response.data?.data || response.data
  },

  async updateSaleStatus(id, newStatus) {
    if (newStatus === SALE_STATUS.VALIDEE) {
      const response = await api.post(`/sales/${id}/validate`)
      return response.data?.data || response.data
    }
    if (newStatus === SALE_STATUS.ANNULEE) {
      const response = await api.post(`/sales/${id}/cancel`)
      return response.data?.data || response.data
    }
    throw new Error(`Le statut ${newStatus} n'est pas géré par l'API.`)
  },

  async delete(id) {
    return api.delete(`/sales/${id}`)
  },
}

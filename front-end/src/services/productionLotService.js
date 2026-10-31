import { api } from './api';

export const productionLotService = {
  getAll: async () => {
    const response = await api.get('/production_lots');
    const data = response.data?.data || response.data || [];
    return Array.isArray(data) ? data : [];
  },

  create: async (data) => {
    const payload = {
      numero_lot: data.numeroLot || data.numero_lot || `LOT-${Date.now()}`,
      article_id: data.articleId ?? data.article_id,
      quantite: data.quantite,
      status:
        data.status === 'EN_COURS'
          ? 'IN_PROGRESS'
          : data.status === 'TERMINE'
            ? 'COMPLETED'
            : data.status === 'ANNULE'
              ? 'IN_PROGRESS'
              : data.status || 'IN_PROGRESS',
      date_production: data.dateProduction || data.date_production,
      certificat_abattage: data.certificat_abattage || null,
    };
    const response = await api.post('/production_lots', payload);
    return response.data?.data || response.data || [];
  },

  update: async (id, data) => {
    const payload = {
      numero_lot: data.numeroLot || data.numero_lot,
      article_id: data.articleId ?? data.article_id,
      quantite: data.quantite,
      status:
        data.status === 'EN_COURS'
          ? 'IN_PROGRESS'
          : data.status === 'TERMINE'
            ? 'COMPLETED'
            : data.status === 'ANNULE'
              ? 'IN_PROGRESS'
              : data.status,
      date_production: data.dateProduction || data.date_production,
      certificat_abattage: data.certificat_abattage || null,
    };
    const response = await api.put(`/production_lots/${id}`, payload);
    return response.data?.data || response.data || [];
  },

  delete: async (id) => {
    const response = await api.delete(`/production_lots/${id}`);
    return response.data?.data || response.data || [];
  },

  markAsCompleted: async (id) => {
    const response = await api.post(`/production_lots/${id}/complete`);
    return response.data;
  }
};

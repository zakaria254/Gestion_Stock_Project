import { api } from './api';

export const productionLotService = {
  getAll: async () => {
    const response = await api.get('/production_lots');
    return response.data?.data || response.data || [];
  },

  create: async (data) => {
    const response = await api.post('/production_lots', data);
    return response.data?.data || response.data || [];
  },

  update: async (id, data) => {
    const response = await api.put(`/production_lots/${id}`, data);
    return response.data?.data || response.data || [];
  },

  delete: async (id) => {
    const response = await api.delete(`/production_lots/${id}`);
    return response.data?.data || response.data || [];
  }
};


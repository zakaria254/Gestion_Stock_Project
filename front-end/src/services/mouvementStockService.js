import { api } from './api';

export const mouvementStockService = {
  getAll: async () => {
    const response = await api.get('/movements');
    return response.data?.data || response.data || [];
  },

  create: async (data) => {
    const response = await api.post('/movements', data);
    return response.data?.data || response.data || {};
  },

  update: async (id, data) => {
    const response = await api.put(`/movements/${id}`, data);
    return response.data?.data || response.data || {};
  },

  delete: async (id) => {
    await api.delete(`/movements/${id}`);
  },
};

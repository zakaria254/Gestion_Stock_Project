import { api } from './api';

export const invoicesService = {
  getAll: async () => {
    const response = await api.get('/factures');
    return response.data?.data || response.data || [];
  },

  getById: async (id) => {
    const response = await api.get(`/factures/${id}`);
    return response.data?.data || response.data;
  },

  markAsPaid: async (id) => {
    const response = await api.get(`/factures/${id}/paid`);
    return response.data?.data || response.data;
  },

  markAsUnpaid: async (id) => {
    const response = await api.get(`/factures/${id}/unpaid`);
    return response.data?.data || response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/factures/${id}`);
    return response.data;
  }
};

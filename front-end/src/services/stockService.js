import { api } from './api';

export const stockService = {
  getAll: async () => {
    const response = await api.get('/stock');
    return response.data?.data || response.data || [];
  },
};

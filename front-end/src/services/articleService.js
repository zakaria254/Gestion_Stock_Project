import { api } from './api';

export const articleService = {
  getAll: async () => {
    const response = await api.get('/articles');
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/articles', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/articles/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/articles/${id}`);
    return response.data;
  }
};

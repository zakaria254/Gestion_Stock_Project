import { api } from './api';

export const stockService = {
  getAll: async () => {
    const response = await api.get('/stock');
    return response.data?.data || response.data || [];
  },

  // Helper used by SaleForm to display available stock per article
  getStock: async () => {
    const data = await stockService.getAll();
    // Normalize keys to match previous frontend expectations
    return data.map((item) => ({
      articleId: item.article_id || item.articleId,
      stockActuel: item.stock_actuel ?? item.stockActuel ?? 0,
      seuilMinimum: item.seuil_minimun ?? item.seuilMinimum ?? 0,
      articleNom: item.article?.nom,
      unite: item.article?.unite,
    }));
  },
};

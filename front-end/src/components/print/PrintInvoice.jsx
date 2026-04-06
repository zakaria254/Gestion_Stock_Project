// src/components/print/PrintInvoice.jsx
import React from 'react';
import { SALE_STATUS } from '../../data/mockData';

export default function PrintInvoice({ sale }) {
  if (!sale) return null;

  const items = sale.items || [];
  
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatPrice = (price) => {
    return `${Number(price || 0).toFixed(2)} MAD`;
  };

  const getStatusText = (status) => {
    switch(status) {
      case SALE_STATUS.VALIDEE: return 'VALIDÉE';
      case SALE_STATUS.ANNULEE: return 'ANNULÉE';
      case SALE_STATUS.EN_ATTENTE:
      default: return 'EN ATTENTE';
    }
  };

  return (
    <div id="print-area" className="w-full bg-white text-black p-8 font-sans">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-wider text-gray-900">HOUATNOUR</h1>
          <p className="text-gray-500 mt-1">Facture de Vente</p>
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold text-gray-800">Facture N° {sale?.numero || "-"}</h2>
          <p className="text-gray-600 mt-1">Date : {formatDate(sale?.dateCreation || sale?.date)}</p>
        </div>
      </div>

      {/* Client Info */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Informations Client</h3>
        <p className="font-medium text-gray-900">{sale?.client?.name || sale?.clientNom || "-"}</p>
        <p className="text-gray-600 mt-1 whitespace-pre-line">{sale?.adresseLivraison || sale?.client?.adresse || "-"}</p>
      </div>

      {/* Table */}
      <div className="mb-8">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-800">
              <th className="py-3 px-2 font-semibold text-gray-800">Article</th>
              <th className="py-3 px-2 font-semibold text-gray-800 text-center">Quantité</th>
              <th className="py-3 px-2 font-semibold text-gray-800 text-right">Prix unitaire</th>
              <th className="py-3 px-2 font-semibold text-gray-800 text-right">Sous-total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-b border-gray-200">
                <td className="py-3 px-2 text-gray-800">{item.articleNom || "-"}</td>
                <td className="py-3 px-2 text-gray-800 text-center">{item.quantite || 0}</td>
                <td className="py-3 px-2 text-gray-800 text-right">{formatPrice(item.prixUnitaire)}</td>
                <td className="py-3 px-2 text-gray-900 font-medium text-right">{formatPrice(item.total)}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan="4" className="py-4 text-center text-gray-500 italic">Aucun article enregistré pour cette vente.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Total */}
      <div className="flex justify-end mt-12">
        <div className="flex items-center gap-8 w-full max-w-md justify-end">
          <div className="text-right">
            <p className="text-gray-600">Statut de la vente : </p>
            <p className="text-lg font-bold text-gray-800 mt-1">{getStatusText(sale?.status)}</p>
          </div>
          <div className="text-right bg-gray-50 p-6 rounded-lg border border-gray-200 flex-1">
            <p className="text-sm text-gray-600 mb-1">Total général :</p>
            <p className="text-3xl font-bold text-gray-900">{formatPrice(sale?.total)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

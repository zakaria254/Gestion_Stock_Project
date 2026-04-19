// src/pages/invoices/InvoicesPage.jsx
import { useState, useEffect } from 'react'
import { Printer } from 'lucide-react'
import { invoicesService, salesService } from '../../services/api'
import DataTable from '../../components/tables/DataTable'
import { INVOICE_STATUS } from '../../data/mockData'

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true)
      try {
        const data = await invoicesService.getAll()
        const items = Array.isArray(data) ? data : (data?.data || [])
        setInvoices(items)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchInvoices()
  }, [])

  const handleStatusChange = async (id, status) => {
    try {
      if (status === 'PAID') {
        await invoicesService.markAsPaid(id)
      } else {
        await invoicesService.markAsUnpaid(id)
      }
      // Refresh data
      const data = await invoicesService.getAll()
      setInvoices(Array.isArray(data) ? data : (data?.data || []))
    } catch (error) {
      console.error('Erreur changement statut:', error)
    }
  }

  const handlePrint = async (invoice) => {
    try {
      const sale = await salesService.getById(invoice.saleId)
      const items = sale?.items || []
      
      console.log("PRINT INVOICE:", invoice)
      console.log("PRINT ITEMS:", items)

      const formatDate = (dateStr) => {
        if (!dateStr) return "-"
        try {
          const d = new Date(dateStr)
          return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("fr-FR", { day: '2-digit', month: 'long', year: 'numeric' })
        } catch (e) {
          return "-"
        }
      }

      const safeItems = Array.isArray(items) ? items : []
      const subTotal = safeItems.reduce((sum, item) => sum + (Number(item?.quantite || 0) * Number(item?.prixUnitaire || 0)), 0)
      const tva = subTotal * 0.20 // Exemple 20%
      const totalTTC = subTotal + tva

      const itemsHtml = safeItems.length > 0 
        ? safeItems.map(item => `
            <tr>
              <td>${item?.articleNom || "-"}</td>
              <td style="text-align: center;">${Number(item?.quantite || 0)}</td>
              <td style="text-align: right;">${Number(item?.prixUnitaire || 0).toFixed(2)} MAD</td>
              <td style="text-align: right;">${Number(item?.total || (Number(item?.quantite || 0) * Number(item?.prixUnitaire || 0))).toFixed(2)} MAD</td>
            </tr>
          `).join('')
        : `<tr><td colspan="4" style="text-align: center; font-style: italic; color: #666;">Aucun article enregistré pour cette facture.</td></tr>`

      const printWindow = window.open('', '_blank')
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Facture ${invoice?.numero || "-"}</title>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
              .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
              .header>div { flex: 1; }
              .company-info h1 { margin: 0; font-size: 28px; color: #000; text-transform: uppercase; }
              .invoice-info { text-align: right; }
              .invoice-info h2 { margin: 0; font-size: 20px; text-transform: uppercase; margin-bottom: 8px; color: #000; }
              .client-info { margin-bottom: 30px; padding: 15px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 4px; }
              .client-info h3 { margin-top: 0; font-size: 14px; text-transform: uppercase; color: #666; margin-bottom: 8px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 14px; }
              th { background-color: #f2f2f2; font-weight: bold; color: #000; }
              .totals { float: right; width: 300px; border: 1px solid #ddd; padding: 15px; background-color: #f9f9f9; border-radius: 4px; }
              .totals-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
              .totals-row.grand-total { font-weight: bold; font-size: 18px; border-top: 2px solid #000; padding-top: 8px; margin-top: 8px; }
              .clear { clear: both; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="company-info">
                <h1>HOUATNOUR</h1>
                <p>Expertise Logistique<br/>12 Rue du Commerce, 75015 Paris<br/>SIRET: 843 920 182 00012</p>
              </div>
              <div class="invoice-info">
                <h2>Facture Officielle</h2>
                <p><strong>N° : </strong>${invoice?.numero || "-"}</p>
                <p><strong>Émise le : </strong>${formatDate(invoice?.dateEmission)}</p>
                ${invoice?.dateEcheance ? `<p><strong>Échéance : </strong>${formatDate(invoice?.dateEcheance)}</p>` : ''}
              </div>
            </div>

            <div class="client-info">
              <h3>Destinataire</h3>
              <p style="font-size: 18px; font-weight: bold; margin-bottom: 4px; margin-top: 0; color: #000;">${invoice?.clientNom || invoice?.client?.name || "-"}</p>
              <p style="margin: 0;">${invoice?.adresseLivraison || invoice?.client?.adresse || "Adresse de livraison non renseignée"}</p>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Article</th>
                  <th style="text-align: center;">Quantité</th>
                  <th style="text-align: right;">Prix unitaire HT</th>
                  <th style="text-align: right;">Sous-total HT</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="totals">
              <div class="totals-row">
                <span>Total HT:</span>
                <span>${subTotal.toFixed(2)} MAD</span>
              </div>
              <div class="totals-row">
                <span>TVA (20%):</span>
                <span>${tva.toFixed(2)} MAD</span>
              </div>
              <div class="totals-row grand-total">
                <span>Total TTC:</span>
                <span>${totalTTC.toFixed(2)} MAD</span>
              </div>
            </div>
            <div class="clear"></div>
          </body>
        </html>
      `)

      printWindow.document.close()

      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)

    } catch (error) {
      console.error("Print Error:", error)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case INVOICE_STATUS.PAID:
        return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-800 border border-emerald-200">PAYÉE</span>
      case INVOICE_STATUS.UNPAID:
        return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-100 text-rose-800 border border-rose-200">IMPAYÉE</span>
      default:
        return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-800 border border-amber-200">ATTENTE</span>
    }
  }

  const columns = [
    { key: 'numero', label: 'RÉFÉRENCE', render: (item) => <span className="font-mono font-bold text-slate-900">{item.numero}</span> },
    { key: 'clientNom', label: 'CLIENT', render: (item) => <span className="font-semibold text-slate-700">{item.client?.nom || item.clientNom || "-"}</span> },
    { key: 'created_at', label: "DATE D'ÉMISSION", render: (item) => <span className="text-slate-500 font-medium">{item.created_at ? new Date(item.created_at).toLocaleDateString("fr-FR") : "-"}</span> },
    { key: 'montant_total', label: 'MONTANT TTC', render: (item) => <span className="font-black text-slate-900">{Number(item.montant_total || 0).toFixed(2)} MAD</span> },
    { key: 'status', label: 'STATUT', render: (item) => getStatusBadge(item.status) },
  ]

  const renderActions = (invoice) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handlePrint(invoice)}
        className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all"
        title="Imprimer"
      >
        <Printer className="w-3.5 h-3.5" />
      </button>
      
      {invoice.status === 'PENDING' && (
        <>
          <button
            onClick={() => handleStatusChange(invoice.id, 'PAID')}
            className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-all shadow-sm"
          >
            PAYER
          </button>
          <button
            onClick={() => handleStatusChange(invoice.id, 'UNPAID')}
            className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-xs font-bold hover:bg-rose-600 transition-all shadow-sm"
          >
            NON PAYÉ
          </button>
        </>
      )}
    </div>
  )

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestion des Factures</h1>
          <p className="text-slate-500 mt-2 font-medium">Consultez, téléchargez et gérez vos documents comptables <span className="text-primary font-bold">HOUATNOUR</span></p>
        </div>
        <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center">
          <Printer className="text-primary w-6 h-6" />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={invoices}
        isLoading={isLoading}
        searchPlaceholder="Rechercher par numéro ou client..."
        searchKeys={['numero', 'clientNom']}
        renderActions={renderActions}
        emptyMessage="Aucune facture générée pour le moment"
      />
    </div>
  )
}

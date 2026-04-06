// src/pages/sales/SalesPage.jsx
import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Trash2,
  Printer,
} from "lucide-react";
import { saleService } from "../../services/saleService";
import { clientService } from "../../services/clientService";
import { articleService } from "../../services/articleService";
import { notificationsService } from "../../services/api";
import DataTable from "../../components/tables/DataTable";
import SaleForm from "../../components/forms/SaleForm";
import PrintInvoice from "../../components/print/PrintInvoice";
import { SALE_STATUS } from "../../data/mockData";

export default function SalesPage() {
  const [sales, setSales] = useState([]);
  const [clients, setClients] = useState([]);
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [saleToPrint, setSaleToPrint] = useState(null);

  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clientFilter, setClientFilter] = useState("all");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [salesData, clientsData, articlesData] = await Promise.all([
        saleService.getAll(),
        clientService.getAll(),
        articleService.getAll(),
      ]);
      const safeSalesData = Array.isArray(salesData) ? salesData : [];
      const sortedSales = [...safeSalesData].sort(
        (a, b) =>
          new Date(b?.dateCreation || 0) - new Date(a?.dateCreation || 0),
      );
      setSales(sortedSales);
      setClients(clientsData || []);
      setArticles(articlesData || []);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des données.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePrint = async (sale) => {
    try {
      // If articles are already loaded (index endpoint eager loads them), reuse them
      let fullSale = sale;
      if (!sale?.articles) {
        fullSale = await saleService.getById(sale.id);
      }
      if (fullSale) {
        setSaleToPrint(fullSale);
        setTimeout(() => {
          window.print();
        }, 100); // Small delay to let React render the print component
      }
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des détails pour l'impression.");
    }
  };

  const handleCreate = async (saleData, items) => {
    setIsSubmitting(true);
    setError("");
    try {
      await saleService.create(saleData, items);
      await notificationsService.addNotification({
        type: "info",
        message: "Nouvelle vente créée avec le formulaire",
      });
      await fetchData();
      setIsFormOpen(false);
    } catch (err) {
      setError(err.message || "Erreur lors de la création.");
      await notificationsService.addNotification({
        type: "error",
        message: err.message || "Erreur lors de la création.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    if (!id) return;
    const label = newStatus === SALE_STATUS.VALIDEE ? "valider" : "annuler";
    if (!window.confirm(`Êtes-vous sûr de vouloir ${label} cette vente ?`))
      return;
    setError("");
    try {
      await saleService.updateSaleStatus(Number(id), newStatus);
      if (newStatus === SALE_STATUS.ANNULEE) {
        await notificationsService.addNotification({
          type: "success",
          message: "Vente annulée avec succès",
        });
      }
      await fetchData();
    } catch (err) {
      setError(err.message || "Erreur lors de la modification du statut.");
      await notificationsService.addNotification({
        type: "error",
        message: err.message || "Erreur statut",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette vente ?"))
      return;
    setError("");
    try {
      await saleService.delete(Number(id));
      await fetchData();
      await notificationsService.addNotification({
        type: "success",
        message: "Vente supprimée",
      });
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression.");
      await notificationsService.addNotification({
        type: "error",
        message: "Erreur de suppression",
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case SALE_STATUS.VALIDEE:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Validée
          </span>
        );
      case SALE_STATUS.ANNULEE:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Annulée
          </span>
        );
      case "EN_ATTENTE":
      case SALE_STATUS.EN_ATTENTE:
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            En attente
          </span>
        );
    }
  };

  const columns = [
    { key: "numero", label: "Numéro" },
    {
      key: "clientNom",
      label: "Client",
      render: (row) => row?.client?.name || row?.clientNom || "-",
    },
    {
      key: "dateCreation",
      label: "Date",
      render: (row) =>
        new Date(
          row?.dateCreation || row?.date || new Date(),
        ).toLocaleDateString("fr-FR"),
    },
    {
      key: "total",
      label: "Total",
      render: (row) => `${Number(row?.total || 0).toFixed(2)} MAD`,
    },
    {
      key: "status",
      label: "Statut",
      render: (row) => getStatusBadge(row?.status || "EN_ATTENTE"),
    },
  ];

  const renderActions = (sale) => {
    const status = sale?.status || "EN_ATTENTE";
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => handlePrint(sale)}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors print:hidden"
          title="Imprimer"
        >
          <Printer className="w-4 h-4" />
        </button>
        {status === SALE_STATUS.EN_ATTENTE && (
          <>
            <button
              onClick={() => handleStatusChange(sale?.id, SALE_STATUS.VALIDEE)}
              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Valider la vente"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleStatusChange(sale?.id, SALE_STATUS.ANNULEE)}
              className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
              title="Annuler la vente"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </>
        )}
        {status !== SALE_STATUS.VALIDEE && (
          <button
            onClick={() => handleDelete(sale?.id)}
            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer la vente"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  };

  console.log("SALES DATA:", sales);

  if (!sales) return <div>Chargement...</div>;

  // NORMALIZE DATA BEFORE RENDERING (CRITICAL CHECK & SAFE RENDERING)
  const normalizeStatus = (status) => {
    if (!status) return SALE_STATUS.EN_ATTENTE;
    const s = String(status).toLowerCase();
    if (s.startsWith("val")) return SALE_STATUS.VALIDEE;
    if (s.startsWith("ann")) return SALE_STATUS.ANNULEE;
    return SALE_STATUS.EN_ATTENTE;
  };

  const safeSales = (sales || []).map((sale) => ({
    ...sale,
    id: sale?.id ? Number(sale.id) : 0,
    client: sale?.client || { name: sale?.clientNom || "-" },
    clientNom: sale?.client?.nom || sale?.clientNom || "-",
    total: Number(sale?.montant_total || sale?.total || 0),
    status: normalizeStatus(sale?.status),
    dateCreation: sale?.created_at || sale?.date_vente || sale?.dateCreation || sale?.date || "",
    items:
      sale?.articles?.map((a) => ({
        articleId: a.id,
        articleNom: a.nom,
        quantite: a.pivot?.quantite || 0,
        prixUnitaire: a.pivot?.prix_unitaire || 0,
        total:
          a.pivot?.total ||
          (a.pivot?.quantite || 0) * (a.pivot?.prix_unitaire || 0),
      })) || sale?.items,
  }));

  const uniqueClients = [
    ...new Set(
      (sales || [])
        .map((sale) => sale?.clientNom || sale?.client?.name)
        .filter(Boolean),
    ),
  ];

  const filteredSales = safeSales.filter((sale) => {
    // Check Client
    if (
      clientFilter !== "all" &&
      (sale?.clientNom || sale?.client?.name) !== clientFilter
    )
      return false;

    // Check Status
    if (statusFilter !== "all" && sale.status !== statusFilter) return false;

    // Check Dates
    if (dateFrom || dateTo) {
      const saleDate = new Date(sale.dateCreation || sale.date);
      saleDate.setHours(0, 0, 0, 0);

      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (saleDate < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (saleDate > to) return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Ventes</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos ventes et commandes clients
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Vente
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Du
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full h-10 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Au
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full h-10 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Client
          </label>
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="w-full h-10 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          >
            <option value="all">Tous les clients</option>
            {uniqueClients.map((client) => (
              <option key={client} value={client}>
                {client}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Statut
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          >
            <option value="all">Tous les statuts</option>
            <option value={SALE_STATUS.EN_ATTENTE}>En attente</option>
            <option value={SALE_STATUS.VALIDEE}>Validée</option>
            <option value={SALE_STATUS.ANNULEE}>Annulée</option>
          </select>
        </div>
      </div>

      {/* SAFE RENDERING FAILSAFE */}
      {safeSales && (
        <DataTable
          columns={columns}
          data={filteredSales}
          isLoading={isLoading}
          searchPlaceholder="Rechercher une vente..."
          searchKeys={["numero", "clientNom"]}
          renderActions={renderActions}
          emptyMessage={
            filteredSales.length === 0 && safeSales.length > 0
              ? "Aucun résultat pour ces filtres"
              : "Aucune vente trouvée"
          }
        />
      )}

      {/* Composant d'impression invisible à l'écran normal, visible à l'impression */}
      <div className="hidden print:block">
        <PrintInvoice sale={saleToPrint} />
      </div>

      <SaleForm
        isOpen={isFormOpen}
        onClose={() => !isSubmitting && setIsFormOpen(false)}
        onSubmit={handleCreate}
        clients={clients}
        articles={articles}
        isLoading={isSubmitting}
      />
    </div>
  );
}

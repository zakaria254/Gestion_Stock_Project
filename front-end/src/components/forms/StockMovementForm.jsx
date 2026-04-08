// src/components/forms/StockMovementForm.jsx
import { useState, useEffect } from "react";
import { X } from "lucide-react";

const TYPES = [
  { value: "in", label: "Entrée ( + )" },
  { value: "out", label: "Sortie ( - )" },
];

const MOTIFS = [
  "Achat",
  "Vente",
  "Production",
  "Perte",
  "Ajustement d'inventaire",
  "Retour client",
];

export default function StockMovementForm({
  isOpen,
  onClose,
  onSubmit,
  movement = null,
  stocks = [],
  isLoading = false,
}) {
  const [formData, setFormData] = useState({
    stock_id: "",
    type: "in",
    quantite: "",
    motif: "Achat",
  });

  const [errors, setErrors] = useState({});
  const [currentStock, setCurrentStock] = useState(null);

  // Track current stock instantly from props
  useEffect(() => {
    if (formData.stock_id && stocks.length > 0) {
      const selectedStock = stocks.find(
        (s) => s.id === Number(formData.stock_id),
      );
      setCurrentStock(selectedStock ? selectedStock.stock_actuel : 0);
    } else {
      setCurrentStock(null);
    }
  }, [formData.stock_id, stocks]);

  useEffect(() => {
    if (movement) {
      setFormData({
        stock_id: movement.stock?.id || "",
        type: movement.type || "in",
        quantite: movement.quantite || "",
        motif: movement.motif || "Achat",
      });
    } else {
      setFormData({
        stock_id: stocks.length > 0 ? stocks[0].id : "",
        type: "in",
        quantite: "",
        motif: "Achat",
      });
    }
    setErrors({});
  }, [movement, isOpen, stocks]);

  const validate = () => {
    const newErrors = {};
    if (!formData.stock_id)
      newErrors.stock_id = "Veuillez sélectionner un article";
    if (!formData.quantite) newErrors.quantite = "La quantité est requise";
    else if (
      isNaN(Number(formData.quantite)) ||
      Number(formData.quantite) <= 0
    ) {
      newErrors.quantite = "La quantité doit être supérieure à 0";
    }
    if (!formData.motif) newErrors.motif = "Le motif est requis";

    // Stock validation using Net Change logic (matches Backend Observer)
    if (!newErrors.quantite && currentStock !== null) {
      const oldSigned = movement ? (movement.type === 'in' ? Number(movement.quantite) : -Number(movement.quantite)) : 0;
      const newSigned = formData.type === 'in' ? Number(formData.quantite) : -Number(formData.quantite);
      const netChange = newSigned - oldSigned;

      // If the edit results in a net DECREASE in stock (negative change)
      if (netChange < 0) {
        const reductionAmount = Math.abs(netChange);
        if (reductionAmount > currentStock) {
          newErrors.quantite = `Stock insuffisant. Cette modification nécessite de retirer ${reductionAmount} unités, mais le stock actuel est de ${currentStock}.`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Accept backend 422 validation errors
  const setBackendErrors = (error) => {
    if (
      error.response &&
      error.response.status === 422 &&
      error.response.data?.errors
    ) {
      const backendErrors = {};
      Object.entries(error.response.data.errors).forEach(
        ([field, messages]) => {
          backendErrors[field] = Array.isArray(messages)
            ? messages[0]
            : messages;
        },
      );
      setErrors((prev) => ({ ...prev, ...backendErrors }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const quantiteNum = parseFloat(formData.quantite);
      onSubmit(
        {
          ...formData,
          stock_id: Number(formData.stock_id),
          quantite: quantiteNum.toFixed(2), // decimal:0,2 format for backend
        },
        setBackendErrors,
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (!isOpen) return null;
  const isReadOnly = movement?.is_generated;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-card rounded-xl border border-border shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            {movement ? (isReadOnly ? 'Mouvement Automatique' : 'Modifier le Mouvement') : 'Nouveau Mouvement de Stock'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {isReadOnly && (
          <div className="mx-4 mt-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-xs text-center">
            Ce mouvement a été généré automatiquement par le système. Il ne peut pas être modifié manuellement.
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Article
            </label>
            <select
              name="stock_id"
              value={formData.stock_id}
              onChange={handleChange}
              disabled={isReadOnly}
              className={`w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 ${errors.stock_id ? "border-destructive" : "border-border"}`}
            >
              <option value="">Sélectionner un article...</option>
              {stocks.map((stock) => (
                <option key={stock.id} value={stock.id}>
                  {stock.article?.nom} ({stock.article?.reference || "Sans ref"})
                </option>
              ))}
            </select>
            {currentStock !== null && (
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                Stock actuel :{" "}
                <span className={currentStock > 0 ? "text-green-600" : "text-red-500"}>
                  {currentStock}
                </span>
              </p>
            )}
            {errors.stock_id && (
              <p className="mt-1 text-xs text-destructive">{errors.stock_id}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Type de Mouvement
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={isReadOnly}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              >
                {TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Quantité
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                name="quantite"
                value={formData.quantite}
                onChange={handleChange}
                readOnly={isReadOnly}
                className={`w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary ${errors.quantite ? "border-destructive" : "border-border"} ${isReadOnly ? 'opacity-50' : ''}`}
                placeholder="Ex: 50.00"
              />
              {errors.quantite && (
                <p className="mt-1 text-xs text-destructive">
                  {errors.quantite}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Motif
            </label>
            <select
              name="motif"
              value={formData.motif}
              onChange={handleChange}
              disabled={isReadOnly}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
            >
              <option value="">Sélectionner un motif...</option>
              {MOTIFS.map((motif) => (
                <option key={motif} value={motif}>
                  {motif}
                </option>
              ))}
            </select>
            {errors.motif && (
              <p className="mt-1 text-xs text-destructive">{errors.motif}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || isReadOnly}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {isLoading
                ? "Enregistrement..."
                : movement
                  ? (isReadOnly ? "Verrouillé" : "Modifier")
                  : "Créer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

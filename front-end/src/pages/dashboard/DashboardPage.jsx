// src/pages/dashboard/DashboardPage.jsx
import { useState, useEffect } from 'react'
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import {
  TrendingUp, Package, AlertTriangle, Clock,
  ShoppingCart, Euro, Users, FileWarning,
} from 'lucide-react'
import { dashboardService } from '../../services/api'

const PIE_COLORS = ['#16a34a', '#eab308', '#ef4444', '#3b82f6', '#8b5cf6', '#f97316']

function KpiCard({ icon: Icon, label, value, sub, color = 'text-primary', bg = 'bg-primary/10', alert = false }) {
  return (
    <div className={`bg-card border ${alert ? 'border-red-400' : 'border-border'} rounded-xl p-5 flex items-start gap-4 shadow-sm`}>
      <div className={`p-3 rounded-xl ${bg} shrink-0`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`text-2xl font-bold mt-1 ${alert ? 'text-red-500' : 'text-foreground'}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await dashboardService.getStats()
        setStats(data)
      } catch (error) {
        console.error('Erreur lors du chargement du tableau de bord:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  const tooltipStyle = {
    backgroundColor: 'hsl(var(--card))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '8px',
    color: 'hsl(var(--card-foreground))',
    fontSize: 13,
  }

  const hasStockNegatif = (stats?.stockNegatif || 0) > 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Tableau de Bord &mdash; HOUATNOUR</h1>
        <p className="text-muted-foreground mt-1">Vue d&apos;ensemble de votre activité</p>
      </div>

      {/* Negative stock banner */}
      {hasStockNegatif && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-300 rounded-xl text-red-700">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">
            ⚠️ {stats.stockNegatif} article(s) en stock négatif détecté(s). Veuillez vérifier les mouvements de stock.
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={TrendingUp}
          label="Ventes Validées (Mois)"
          value={`${Number(stats?.ventesValideesMois || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`}
          sub="Ventes VALIDÉE ce mois"
          color="text-green-600"
          bg="bg-green-100"
        />
        <KpiCard
          icon={Package}
          label="Valeur du Stock"
          value={`${Number(stats?.valeurStock || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`}
          sub="Prix × Quantité disponible"
          color="text-blue-600"
          bg="bg-blue-100"
        />
        <KpiCard
          icon={AlertTriangle}
          label="Alertes Stock"
          value={stats?.alertesStock || 0}
          sub="Articles sous le seuil minimum"
          color="text-amber-600"
          bg="bg-amber-100"
          alert={(stats?.alertesStock || 0) > 0}
        />
        <KpiCard
          icon={Clock}
          label="Commandes en Attente"
          value={stats?.commandesEnAttente || 0}
          sub="En attente de validation"
          color="text-purple-600"
          bg="bg-purple-100"
        />
      </div>

      {/* Secondary KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Users}
          label="Clients"
          value={stats?.totalClients || 0}
          color="text-primary"
          bg="bg-primary/10"
        />
        <KpiCard
          icon={ShoppingCart}
          label="Articles Catalogue"
          value={stats?.totalArticles || 0}
          color="text-cyan-600"
          bg="bg-cyan-100"
        />
        <KpiCard
          icon={FileWarning}
          label="Factures Impayées"
          value={stats?.facturesImpayees || 0}
          color="text-red-600"
          bg="bg-red-100"
          alert={(stats?.facturesImpayees || 0) > 0}
        />
        <KpiCard
          icon={Euro}
          label="Fournisseurs"
          value={stats?.totalFournisseurs || 0}
          color="text-indigo-600"
          bg="bg-indigo-100"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - 7 day sales evolution */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Évolution des Ventes (7 jours)</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.evolutionVentes || []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="jour" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={{ stroke: 'hsl(var(--border))' }} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} axisLine={{ stroke: 'hsl(var(--border))' }} tickFormatter={v => v > 0 ? `${(v / 1000).toFixed(0)}k` : '0'} />
                <Tooltip contentStyle={tooltipStyle} formatter={v => [`${Number(v).toLocaleString('fr-FR')} €`, 'Ventes']} />
                <Line type="monotone" dataKey="ventes" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart - Stock by category */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Répartition du Stock par Catégorie</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={(stats?.repartitionStock || []).filter(d => d.quantite > 0)}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                  dataKey="quantite"
                  nameKey="categorie"
                  label={({ percent }) => percent > 0.04 ? `${(percent * 100).toFixed(0)}%` : ''}
                  labelLine={false}
                >
                  {(stats?.repartitionStock || []).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => [`${v} unités`, name]} />
                <Legend verticalAlign="bottom" height={36} formatter={val => <span className="text-xs text-muted-foreground">{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Articles + Bar Chart row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart - top 5 articles */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Top 5 Articles Vendus</h2>
          {(stats?.topArticles || []).length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              Aucune vente validée enregistrée
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topArticles} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                  <YAxis type="category" dataKey="nom" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} width={80} />
                  <Tooltip contentStyle={tooltipStyle} formatter={v => [`${v} unités`, 'Vendus']} />
                  <Bar dataKey="quantite" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Stock alerts list */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-card-foreground mb-4">Résumé Rapide</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Commandes validées (mois)</span>
              <span className="font-semibold text-foreground">
                {(stats?.ventesValideesMois || 0) > 0
                  ? `${Number(stats.ventesValideesMois).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €`
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Commandes en attente</span>
              <span className={`font-semibold ${(stats?.commandesEnAttente || 0) > 0 ? 'text-amber-600' : 'text-foreground'}`}>
                {stats?.commandesEnAttente || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Articles en alerte stock</span>
              <span className={`font-semibold ${(stats?.alertesStock || 0) > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                {stats?.alertesStock || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Stock négatif</span>
              <span className={`font-semibold ${(stats?.stockNegatif || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {(stats?.stockNegatif || 0) > 0 ? `⚠ ${stats.stockNegatif} article(s)` : '✓ Aucun'}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Factures impayées</span>
              <span className={`font-semibold ${(stats?.facturesImpayees || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {stats?.facturesImpayees || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
              <span className="text-muted-foreground">Valeur totale du stock</span>
              <span className="font-semibold text-blue-600">
                {Number(stats?.valeurStock || 0).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

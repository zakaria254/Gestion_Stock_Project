<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Client;
use App\Models\Facture;
use App\Models\Sale;
use App\Models\Stock;
use App\Models\Supplier;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function statistic() {
        $salesValidee = Sale::where('status', 'Validee')->sum('montant_total');

        $stockValue = 0;
        Stock::with('article:id,prix')->chunk(100, function ($stocks) use (&$stockValue) {
            foreach ($stocks as $stock) {
                $stockValue += ($stock->article->prix * $stock->stock_actuel);
            }
        });

        $stocksAlerts = Stock::whereColumn('stock_actuel', '<=', 'seuil_minimun')->count();

        $pendingSales = Sale::where('status', 'En attente')->count();

        $clientsCount = Client::count();
        $supplierCount = Supplier::count();
        $articlesCount = Article::count();

        $unpaidFactures = Facture::where('status', 'UNPAID')->count();

        // 1. Évolution des Ventes (7 derniers jours)
        $evolutionVentes = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $total = Sale::where('status', 'Validee')
                         ->whereDate('created_at', $date)
                         ->sum('montant_total');
            
            $evolutionVentes[] = [
                'jour' => now()->subDays($i)->format('d/m'),
                'ventes' => (float)$total
            ];
        }

        // 2. Répartition du Stock par Catégorie
        $repartitionStock = Article::join('stocks', 'articles.id', '=', 'stocks.article_id')
            ->select('articles.categorie', \DB::raw('SUM(stocks.stock_actuel) as quantite'))
            ->groupBy('articles.categorie')
            ->get();

        // 3. Top 5 Articles Vendus
        $topArticles = Article::join('sale_article', 'articles.id', '=', 'sale_article.article_id')
            ->join('sales', 'sales.id', '=', 'sale_article.sale_id')
            ->where('sales.status', 'Validee')
            ->select('articles.nom', \DB::raw('SUM(sale_article.quantite) as quantite'))
            ->groupBy('articles.id', 'articles.nom')
            ->orderByDesc('quantite')
            ->take(5)
            ->get();

        return response()->json([
            'data' => [
               'salesValidee' => $salesValidee,
               'stockValue' => $stockValue,
               'stocksAlerts' => $stocksAlerts,
               'pendingSales' => $pendingSales,
               'clientsCount' => $clientsCount,
               'supplierCount' => $supplierCount,
               'articlesCount' => $articlesCount,
               'unpaidFactures' => $unpaidFactures,
               'evolutionVentes' => $evolutionVentes,
               'repartitionStock' => $repartitionStock,
               'topArticles' => $topArticles,
            ]
        ], 200);

    }
}

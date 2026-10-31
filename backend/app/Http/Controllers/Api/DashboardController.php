<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Article;
use App\Models\Client;
use App\Models\Facture;
use App\Models\Sale;
use App\Models\Stock;
use App\Models\Supplier;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function statistic()
    {
        $stockValue = Stock::join('articles', 'articles.id', '=', 'stocks.article_id')
            ->sum(DB::raw('articles.prix * stocks.stock_actuel'));

        return response()->json([
            'data' => [
                'salesValidee' => Sale::where('status', Sale::STATUS_VALIDEE)->sum('montant_total'),
                'stockValue' => (float) $stockValue,
                'stocksAlerts' => Stock::whereColumn('stock_actuel', '<=', 'seuil_minimun')->count(),
                'pendingSales' => Sale::where('status', Sale::STATUS_EN_ATTENTE)->count(),
                'clientsCount' => Client::count(),
                'supplierCount' => Supplier::count(),
                'articlesCount' => Article::count(),
                'unpaidFactures' => Facture::where('status', Facture::STATUS_UNPAID)->count(),
                'evolutionVentes' => $this->salesLastSevenDays(),
                'repartitionStock' => $this->stockByCategory(),
                'topArticles' => $this->topArticles(),
            ],
        ]);
    }

    /**
     * Validated sales per day, one query, days without sales filled with 0.
     */
    private function salesLastSevenDays(): array
    {
        $start = now()->subDays(6)->startOfDay();

        $totals = Sale::where('status', Sale::STATUS_VALIDEE)
            ->where('created_at', '>=', $start)
            ->selectRaw('DATE(created_at) as day, SUM(montant_total) as total')
            ->groupBy('day')
            ->pluck('total', 'day');

        return collect(range(0, 6))->map(function ($offset) use ($start, $totals) {
            $day = $start->copy()->addDays($offset);

            return [
                'jour' => $day->format('d/m'),
                'ventes' => (float) ($totals[$day->format('Y-m-d')] ?? 0),
            ];
        })->all();
    }

    private function stockByCategory()
    {
        return Article::join('stocks', 'articles.id', '=', 'stocks.article_id')
            ->select('articles.categorie', DB::raw('SUM(stocks.stock_actuel) as quantite'))
            ->groupBy('articles.categorie')
            ->get();
    }

    private function topArticles()
    {
        return Article::join('sale_article', 'articles.id', '=', 'sale_article.article_id')
            ->join('sales', 'sales.id', '=', 'sale_article.sale_id')
            ->where('sales.status', Sale::STATUS_VALIDEE)
            ->select('articles.nom', DB::raw('SUM(sale_article.quantite) as quantite'))
            ->groupBy('articles.id', 'articles.nom')
            ->orderByDesc('quantite')
            ->take(5)
            ->get();
    }
}

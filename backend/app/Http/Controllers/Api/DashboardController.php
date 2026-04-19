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
            ]
        ], 200);

    }
}

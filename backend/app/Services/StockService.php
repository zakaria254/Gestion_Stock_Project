<?php

namespace App\Services;

use App\Models\Stock;

class StockService
{
    /**
     * Create a new class instance.
     */
    public function __construct()
    {
        //
    }

    public function decrement($article_id, $quantite)
    {
        $stock = Stock::where('article_id', $article_id)->first();

        if (!$stock) {
            throw new \RuntimeException("stock record not found for Article ID: {$article_id}");
        }

        if ($stock->stock_actuel  < $quantite) {
            throw new \RuntimeException("Insufficient stock for Article ID: {$article_id}. Available: {$stock->stock_actuel}, Requested: {$quantite}");
        }

        return $stock->decrement('stock_actuel', $quantite);
    }

    public function increment($article_id, $quantite)
    {
        $stock = Stock::where('article_id', $article_id)->first();
        if (!$stock) {
            throw new \RuntimeException("Stock record not found for Article ID: {$article_id}");
        }

        return $stock->increment('stock_actuel', $quantite);
    }
}

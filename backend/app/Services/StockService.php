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

    public function decrement ($article_id, $quantite) 
    {
        $stock = Stock::where('article_id', $article_id)->first();
        
        if ($stock && $stock->stock_actuel >= $quantite) 
        {
            return $stock->decrement('stock_actuel',$quantite);
        }

        return false;
    }

    public function increment ($article_id, $quantite) 
    {
        $stock = Stock::where('article_id', $article_id)->first();
        if ($stock) 
        {
            return $stock->increment('stock_actuel', $quantite);
        }

        return false;
    }
}

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
        $stock = Stock::where('article_id', $article_id)->get();
        
        if ($stock->stock_actuel >= $quantite) 
        {
            return $stock->decrement('stock_actuel',$quantite);
        }
    }

    public function inrecment ($article_id, $quantite) 
    {
        return Stock::where('article_id', $article_id)->inrecment('stock_actuel', $quantite);
    }
}

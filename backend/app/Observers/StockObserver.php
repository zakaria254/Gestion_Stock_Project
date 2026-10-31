<?php

namespace App\Observers;

use App\Models\Stock;

class StockObserver
{
    /**
     * Runs before every save and sets the status from the current quantity.
     */
    public function saving(Stock $stock): void
    {
        if ($stock->stock_actuel <= 0) {
            $stock->status = Stock::STATUS_RUPTURE;
        } elseif ($stock->stock_actuel <= $stock->seuil_minimun) {
            $stock->status = Stock::STATUS_FAIBLE;
        } else {
            $stock->status = Stock::STATUS_DISPONIBLE;
        }
    }
}

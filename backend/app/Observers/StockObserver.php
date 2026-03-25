<?php

namespace App\Observers;

use App\Models\Stock;

class StockObserver
{
    /**
     * Handle the Stock "created" event.
     */
    public function created(Stock $stock): void
    {
        
    }

    /**
     * Handle the Stock "updated" event.
     */
    public function updated(Stock $stock): void
    {
        //
    }

    /**
     * Handle the Stock "deleted" event.
     */
    public function deleted(Stock $stock): void
    {
        //
    }

    /**
     * Handle the Stock "restored" event.
     */
    public function restored(Stock $stock): void
    {
        //
    }

    /**
     * Handle the Stock "force deleted" event.
     */
    public function forceDeleted(Stock $stock): void
    {
        //
    }

    //this runs before the data is saved to the database and sets the status automatically
    public function saving (Stock $stock) : void
    {
        if ($stock->stock_actuel <= 0) {
            $stock->status = 'Rupture';
        } elseif ($stock->stock_actuel <= $stock->seuil_minimun ) {
            $stock->status = 'Faible';
        } else {
            $stock->status = 'Disponible';
        }
    }
}

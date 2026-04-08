<?php

namespace App\Observers;

use App\Models\ProductionLot;
use App\Models\StockMovement;


class ProductionLotObserver
{
    /**
     * Handle the ProductionLot "created" event.
     */
    public function created(ProductionLot $productionLot): void
    {
        if ($productionLot->status === "COMPLETED")
        {
            $stock = $productionLot->article->stock;
            if ($stock) {
                StockMovement::create([
                    'stock_id' => $stock->id,
                    'type' => 'in',
                    'quantite' => $productionLot->quantite,
                    'is_generated' => true,
                    'motif' => 'Production',
                ]);
            }
        }
    }

    /**
     * Handle the ProductionLot "updated" event.
     */
    public function updated(ProductionLot $productionLot): void
    {
        $new_status = $productionLot->status ;
        $new_quantite = $productionLot->quantite; 
        

        if ($productionLot->wasChanged('status') && $new_status === 'COMPLETED')
        {
            $stock = $productionLot->article->stock;
            if ($stock) {
                StockMovement::create([
                    'stock_id' => $stock->id,
                    'type' => 'in',
                    'quantite' => $new_quantite,
                    'is_generated' => true,
                    'motif' => 'Production',
                ]);
            }

            return;
        }
    }

    /**
     * Handle the ProductionLot "deleted" event.
     */
    public function deleted(ProductionLot $productionLot): void
    {
        //
    }

    /**
     * Handle the ProductionLot "restored" event.
     */
    public function restored(ProductionLot $productionLot): void
    {
        //
    }

    /**
     * Handle the ProductionLot "force deleted" event.
     */
    public function forceDeleted(ProductionLot $productionLot): void
    {
        //
    }
}

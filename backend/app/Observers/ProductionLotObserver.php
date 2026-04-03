<?php

namespace App\Observers;

use App\Models\ProductionLot;
use App\Models\Stock;
use App\Services\StockService;

class ProductionLotObserver
{
    /**
     * Handle the ProductionLot "created" event.
     */
    public function created(ProductionLot $productionLot): void
    {
        if ($productionLot->status === "COMPLETED")
        {
            $service = new StockService;
            $service->increment($productionLot->article_id, $productionLot->quantite);          
        }
    }

    /**
     * Handle the ProductionLot "updated" event.
     */
    public function updated(ProductionLot $productionLot): void
    {
        $service = new StockService;
        $old_status = $productionLot->getOriginal('status');
        $new_status = $productionLot->status ;
        $old_quantite = $productionLot->getOriginal('quantite');
        $new_quantite = $productionLot->quantite; 
        $article_id = $productionLot->article_id;
        if ($productionLot->waschenged('status') && $new_status === 'COMPLETED')
        {
            $service->increment($article_id, $new_quantite);

            return;
        }

        if ($new_status === 'COMPLETED' && $productionLot->wasChanged('quantite')) {
            if ($old_quantite < $new_quantite) {
                $quantite_diff = $new_quantite - $old_quantite;
                $service->increment($article_id, $quantite_diff);
            } else {
                 $quantite_diff = $old_quantite - $new_quantite ;
                 $service->decrement($article_id, $quantite_diff);
            }
            
            return;
        }

        if ($productionLot->wasChanged('status') && $old_status === 'COMPLETED') {
            $service->decrement($article_id, $new_quantite);
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

    // public function saving (ProductionLot $productionLot) 
    // {
    //     if ($productionLot->status === 'COMPLETED')
    //     {
    //         $service = new StockService ;
    //         $service->increment($productionLot->article_id, $productionLot->quantite);            
    //     }
    // }
}

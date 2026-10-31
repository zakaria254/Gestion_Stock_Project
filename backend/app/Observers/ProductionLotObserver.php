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
        if ($productionLot->status === ProductionLot::STATUS_COMPLETED) {
            $this->addProductionToStock($productionLot);
        }
    }

    /**
     * Handle the ProductionLot "updated" event.
     */
    public function updated(ProductionLot $productionLot): void
    {
        if ($productionLot->wasChanged('status') && $productionLot->status === ProductionLot::STATUS_COMPLETED) {
            $this->addProductionToStock($productionLot);
        }
    }

    private function addProductionToStock(ProductionLot $productionLot): void
    {
        $stock = $productionLot->article->stock;

        if ($stock) {
            StockMovement::create([
                'stock_id' => $stock->id,
                'type' => StockMovement::TYPE_IN,
                'quantite' => $productionLot->quantite,
                'is_generated' => true,
                'motif' => 'Production',
            ]);
        }
    }
}

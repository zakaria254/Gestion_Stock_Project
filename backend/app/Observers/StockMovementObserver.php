<?php

namespace App\Observers;

use App\Models\StockMovement;
use App\Services\StockService;

class StockMovementObserver
{
    /**
     * Handle the StockMovement "created" event.
     */
    public function created(StockMovement $stockMovement): void
    {
        $article_id = $stockMovement->stock->article_id;

        $this->applyStockChange($stockMovement->type, $article_id, $stockMovement->quantite);
        // $stock_service = new StockService;
        // if ($stockMovement->type === 'in') {
        //     $stock_service->increment($stockMovement->article_id, $stockMovement->quantite);
        // } else {
        //     $stock_service->decrement($stockMovement->article_id, $stockMovement->quantite);
        // }
    }

    /**
     * Handle the StockMovement "updated" event.
     */
    public function updated(StockMovement $stockMovement): void
    {
        if (!$stockMovement->wasChanged(['quantite', 'type'])) return;
        $article_id = $stockMovement->stock->article_id;
        $new_type = $stockMovement->type;
        $old_type = $stockMovement->getOriginal('type');
        $new_quantite = $stockMovement->quantite;
        $old_quantite = $stockMovement->getOriginal('quantite');
        $reverse_type = $old_type === 'in' ? 'out' : 'in';
        // what was applyed to the stock when the movement was first created
        $old_movement = $old_type === 'in' ? $old_quantite : -$old_quantite;
        // what should applyed to the stock after the edite 
        $new_movement = $new_type === 'in' ? $new_quantite : -$new_quantite;

        $net_change = $new_movement - $old_movement;

        if ($net_change > 0) {
            $this->applyStockChange('in', $article_id, $net_change);
        } else {
            $this->applyStockChange('out', $article_id, abs($net_change));
        }

        return;
    }

    public function applyStockChange(string $type, int $article_id, float $quantite)
    {
        $stock_service = new StockService;
        $method = $type === 'in' ? 'increment' : 'decrement';
        
        $stock_service->$method($article_id, $quantite);
    }

    /**
     * Handle the StockMovement "deleted" event.
     */
    public function deleted(StockMovement $stockMovement): void
    {
        //
    }

    /**
     * Handle the StockMovement "restored" event.
     */
    public function restored(StockMovement $stockMovement): void
    {
        //
    }

    /**
     * Handle the StockMovement "force deleted" event.
     */
    public function forceDeleted(StockMovement $stockMovement): void
    {
        //
    }
}

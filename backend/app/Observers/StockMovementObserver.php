<?php

namespace App\Observers;

use App\Models\StockMovement;
use App\Services\StockService;

/**
 * Keeps stocks.stock_actuel in sync with the movements.
 * Callers must wrap the movement write in a transaction so a refused
 * stock change also rolls back the movement row.
 */
class StockMovementObserver
{
    public function __construct(private StockService $stockService) {}

    /**
     * Handle the StockMovement "created" event.
     */
    public function created(StockMovement $stockMovement): void
    {
        $this->stockService->apply($stockMovement->stock_id, $stockMovement->type, $stockMovement->quantite);
    }

    /**
     * Handle the StockMovement "updated" event.
     */
    public function updated(StockMovement $stockMovement): void
    {
        if (! $stockMovement->wasChanged(['quantite', 'type', 'stock_id'])) {
            return;
        }

        $oldStockId = (int) $stockMovement->getOriginal('stock_id');
        $oldEffect = $this->signed($stockMovement->getOriginal('type'), $stockMovement->getOriginal('quantite'));
        $newEffect = $this->signed($stockMovement->type, $stockMovement->quantite);

        if ($oldStockId === (int) $stockMovement->stock_id) {
            $this->applyDelta($stockMovement->stock_id, $newEffect - $oldEffect);

            return;
        }

        // moved to another stock: undo on the old one, apply on the new one
        $this->applyDelta($oldStockId, -$oldEffect);
        $this->applyDelta($stockMovement->stock_id, $newEffect);
    }

    /**
     * Handle the StockMovement "deleted" event.
     */
    public function deleted(StockMovement $stockMovement): void
    {
        $this->stockService->revert($stockMovement->stock_id, $stockMovement->type, $stockMovement->quantite);
    }

    private function signed(string $type, float $quantite): float
    {
        return $type === StockMovement::TYPE_IN ? $quantite : -$quantite;
    }

    private function applyDelta(int $stockId, float $delta): void
    {
        if ($delta > 0) {
            $this->stockService->increase($stockId, $delta);
        } elseif ($delta < 0) {
            $this->stockService->decrease($stockId, -$delta);
        }
    }
}

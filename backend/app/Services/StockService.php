<?php

namespace App\Services;

use App\Exceptions\InsufficientStockException;
use App\Models\Stock;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;

class StockService
{
    public function increase(int $stockId, float $quantite): Stock
    {
        return $this->change($stockId, $quantite);
    }

    /**
     * @throws InsufficientStockException
     */
    public function decrease(int $stockId, float $quantite): Stock
    {
        return $this->change($stockId, -$quantite);
    }

    /**
     * Apply (or undo) the effect of a movement of the given type.
     */
    public function apply(int $stockId, string $type, float $quantite): Stock
    {
        return $type === StockMovement::TYPE_IN
            ? $this->increase($stockId, $quantite)
            : $this->decrease($stockId, $quantite);
    }

    public function revert(int $stockId, string $type, float $quantite): Stock
    {
        return $type === StockMovement::TYPE_IN
            ? $this->decrease($stockId, $quantite)
            : $this->increase($stockId, $quantite);
    }

    /**
     * The row is locked so concurrent movements can't both pass the availability check,
     * and saved through Eloquent so StockObserver recomputes the status.
     */
    private function change(int $stockId, float $delta): Stock
    {
        return DB::transaction(function () use ($stockId, $delta) {
            $stock = Stock::whereKey($stockId)->lockForUpdate()->firstOrFail();

            $newQuantity = round((float) $stock->stock_actuel + $delta, 2);

            if ($newQuantity < 0) {
                throw new InsufficientStockException($stock, abs($delta));
            }

            $stock->stock_actuel = $newQuantity;
            $stock->save();

            return $stock;
        });
    }
}

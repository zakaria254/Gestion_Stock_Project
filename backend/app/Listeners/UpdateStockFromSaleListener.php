<?php

namespace App\Listeners;

use App\Events\SaleValidatedEvent;
use App\Models\StockMovement;
use Illuminate\Contracts\Queue\ShouldQueue;

class UpdateStockFromSaleListener implements ShouldQueue
{
    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(SaleValidatedEvent $event): void
    {
        $sale = $event->sale;

        foreach ($sale->articles as $article) {
            $stock = $article->stock;
            $quantite = $article->pivot->quantite;
            StockMovement::create([
                'stock_id' => $stock->id,
                'type' => 'out',
                'quantite' => $quantite,
                'motif' => 'Vente',
            ]);
        }
    }
}

<?php

namespace App\Listeners;

use App\Events\SaleValidatedEvent;
use App\Services\StockService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;

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
        $service = new StockService ;

        foreach ($sale->articles as $article)
        {
            $service->decrement($article->id, $article->pivot->quantite);
        }
    }
}

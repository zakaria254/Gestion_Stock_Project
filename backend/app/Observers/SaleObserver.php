<?php

namespace App\Observers;

use App\Models\Facture;
use App\Models\Sale;

class SaleObserver
{
    /**
     * Handle the Sale "created" event.
     */
    public function created(Sale $sale): void
    {
        //
    }

    /**
     * Handle the Sale "updated" event.
     */
    public function updated(Sale $sale): void
    {
        if ($sale->wasChanged('status') && $sale->status === 'Validee') {
            $montant_total = $sale->montant_total * 0.2 + $sale->montant_total;
            Facture::create([
                'numero' => 'FAC-'. date('Ymd') . '-' . random_int(1000,9999),
                'sale_id' => $sale->id,
                'status' => 'PENDING',
                'montant_total' => $montant_total,
            ]);
        }
    }

    /**
     * Handle the Sale "deleted" event.
     */
    public function deleted(Sale $sale): void
    {
        //
    }

    /**
     * Handle the Sale "restored" event.
     */
    public function restored(Sale $sale): void
    {
        //
    }

    /**
     * Handle the Sale "force deleted" event.
     */
    public function forceDeleted(Sale $sale): void
    {
        //
    }
}

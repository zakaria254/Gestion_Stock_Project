<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\InvalidStatusTransitionException;
use App\Http\Controllers\Controller;
use App\Http\Resources\FactureResource;
use App\Models\Facture;
use Illuminate\Support\Facades\DB;

class FactureController extends Controller
{
    private const RELATIONS = ['sale.client', 'sale.articles'];

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $factures = Facture::with(self::RELATIONS)->latest()->paginate(12);

        return FactureResource::collection($factures);
    }

    /**
     * Display the specified resource.
     */
    public function show(Facture $facture)
    {
        return new FactureResource($facture->load(self::RELATIONS));
    }

    /**
     * A pending or unpaid invoice can be paid.
     */
    public function markPaid(Facture $facture)
    {
        $facture = $this->transition($facture, [Facture::STATUS_PENDING, Facture::STATUS_UNPAID], [
            'status' => Facture::STATUS_PAID,
            'date_payment' => now(),
        ]);

        return new FactureResource($facture->load(self::RELATIONS));
    }

    public function markUnpaid(Facture $facture)
    {
        $facture = $this->transition($facture, [Facture::STATUS_PENDING], [
            'status' => Facture::STATUS_UNPAID,
        ]);

        return new FactureResource($facture->load(self::RELATIONS));
    }

    private function transition(Facture $facture, array $from, array $changes): Facture
    {
        return DB::transaction(function () use ($facture, $from, $changes) {
            $locked = Facture::whereKey($facture->id)->lockForUpdate()->firstOrFail();

            if (! in_array($locked->status, $from)) {
                throw new InvalidStatusTransitionException("This invoice is {$locked->status} and can not be changed to {$changes['status']}.");
            }

            $locked->update($changes);

            return $locked;
        });
    }
}

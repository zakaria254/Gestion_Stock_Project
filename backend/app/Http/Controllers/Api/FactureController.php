<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FactureResource;
use App\Models\Facture;
use Illuminate\Http\Request;

class FactureController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $factures = Facture::with('sale', 'sale.client', 'sale.articles')->latest()->paginate(12);

        return FactureResource::collection($factures);
    }

    public function facturePaid (Facture $facture)
    {
        if ($facture->status === 'PENDING') {
            $facture->update([
                'status' => 'PAID',
            ]);
             
            return new FactureResource($facture);
        }

        return response()->json([
            'message' => 'this facture can not be paid'
        ], 403);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}

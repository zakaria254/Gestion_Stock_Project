<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUpdateSaleRequest;
use App\Http\Resources\SaleResource;
use App\Models\Sale;

class SaleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $sales = Sale::with(['client', 'articles', 'user'])->latest()->paginate(12);

        return SaleResource::collection($sales);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUpdateSaleRequest $request)
    {
        $validated = $request->validated();
        $sale = Sale::create($validated);
        $sale->load(['client', 'articles', 'user']);

        return (new SaleResource($sale))->response()->setStatusCode(201);
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
    public function update(StoreUpdateSaleRequest $request, Sale $sale)
    {
        $validated = $request->validated();
        $sale->update($validated);
        $sale->load(['client', 'articles', 'user']);

        return new SaleResource($sale);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sale $sale)
    {
        $sale->delete();

        return response()->noContent();
    }
}

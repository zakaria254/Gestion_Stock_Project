<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUpdateProductionLotRequest;
use App\Http\Resources\ProductionLotResource;
use App\Models\ProductionLot;


class ProductionLotController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $lots = ProductionLot::with('article')->latest()->paginate(12);

        return ProductionLotResource::collection($lots);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUpdateProductionLotRequest $request)
    {
        $validated = $request->validated();
        $lot = ProductionLot::create($validated);
        $lot->load('article');


        return (new ProductionLotResource($lot))->response()->setStatusCode(201);
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
    public function update(StoreUpdateProductionLotRequest $request, ProductionLot $production_lot)
    {
        if ($production_lot->status !== 'COMPLETED') {
            $validated = $request->validated();
            $production_lot->update($validated);
            $production_lot->load('article');

            return new ProductionLotResource($production_lot);
        } else {
            return response()->json([
                'message' => 'this action is denied'
            ], 403);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductionLot $production_lot)
    {
        $production_lot->delete();

        return response()->noContent();
    }
}

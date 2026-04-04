<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUpdateStockMovementRequest;
use App\Http\Resources\StockMovementResource;
use App\Models\StockMovement;
use Illuminate\Http\Request;

class StockMovementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //first load the stock then for each stock load its associated article (Nested Eager Loading)
        $movments = StockMovement::with('stock.article')->latest()->paginate(12);

        return StockMovementResource::collection($movments);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUpdateStockMovementRequest $request)
    {
        $validated = $request->validated();
        $movement = StockMovement::create($validated);
        $movement->load('stock.article');

        return (new StockMovementResource($movement))->response()->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreUpdateStockMovementRequest $request, StockMovement $movement)
    {
        $validated = $request->validated();
        $movement->update($validated);
        $movement->load('stock.article');

        return new StockMovementResource($movement);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(StockMovement $movement)
    {
        $movement->delete();

        return response()->noContent();
    }
}

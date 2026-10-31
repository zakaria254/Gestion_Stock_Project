<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUpdateProductionLotRequest;
use App\Http\Resources\ProductionLotResource;
use App\Models\ProductionLot;
use Illuminate\Support\Facades\DB;

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
        $lot = DB::transaction(fn () => ProductionLot::create($request->validated()));
        $lot->load('article');

        return (new ProductionLotResource($lot))->response()->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(ProductionLot $production_lot)
    {
        return new ProductionLotResource($production_lot->load('article'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreUpdateProductionLotRequest $request, ProductionLot $production_lot)
    {
        if ($production_lot->status === ProductionLot::STATUS_COMPLETED) {
            return $this->completedLotResponse();
        }

        $production_lot->update($request->validated());

        return new ProductionLotResource($production_lot->load('article'));
    }

    public function complete(ProductionLot $production_lot)
    {
        $completed = DB::transaction(function () use ($production_lot) {
            // re-read under lock so two concurrent calls can't both add the production to stock
            $lot = ProductionLot::whereKey($production_lot->id)->lockForUpdate()->first();

            if ($lot->status === ProductionLot::STATUS_COMPLETED) {
                return false;
            }

            $lot->update(['status' => ProductionLot::STATUS_COMPLETED]);

            return true;
        });

        if (! $completed) {
            return response()->json([
                'message' => 'This lot is already COMPLETED.',
            ], 409);
        }

        return response()->json([
            'message' => 'The lot status is set to COMPLETED.',
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductionLot $production_lot)
    {
        if ($production_lot->status === ProductionLot::STATUS_COMPLETED) {
            return $this->completedLotResponse();
        }

        $production_lot->delete();

        return response()->noContent();
    }

    private function completedLotResponse()
    {
        return response()->json([
            'message' => 'A COMPLETED lot is already in stock and can not be changed.',
        ], 409);
    }
}

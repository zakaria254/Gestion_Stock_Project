<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUpdateSaleRequest;
use App\Http\Resources\SaleResource;
use App\Models\Sale;
use App\Services\SaleService;

class SaleController extends Controller
{
    private const RELATIONS = ['client', 'articles', 'user'];

    public function __construct(private SaleService $sales) {}

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $sales = Sale::with(self::RELATIONS)->latest()->paginate(12);

        return SaleResource::collection($sales);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreUpdateSaleRequest $request)
    {
        $sale = $this->sales->create($request->validated(), $request->user());

        return (new SaleResource($sale->load(self::RELATIONS)))->response()->setStatusCode(201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Sale $sale)
    {
        return new SaleResource($sale->load(self::RELATIONS));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(StoreUpdateSaleRequest $request, Sale $sale)
    {
        $sale = $this->sales->update($sale, $request->validated());

        return new SaleResource($sale->load(self::RELATIONS));
    }

    public function validateSale(Sale $sale)
    {
        return new SaleResource($this->sales->validate($sale)->load(self::RELATIONS));
    }

    public function cancel(Sale $sale)
    {
        return new SaleResource($this->sales->cancel($sale)->load(self::RELATIONS));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sale $sale)
    {
        if ($sale->status !== Sale::STATUS_ANNULEE) {
            return response()->json([
                'message' => 'Only a canceled sale can be deleted.',
            ], 409);
        }

        $sale->delete();

        return response()->noContent();
    }
}

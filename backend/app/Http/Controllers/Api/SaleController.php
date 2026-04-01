<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUpdateSaleRequest;
use App\Http\Resources\SaleResource;
use App\Models\Sale;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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
        //start a transaction
        return DB::transaction(function () use ($request) {
            $validated = $request->validated();
            //convert articles array into a collection and use the sum method to calculate montant_total
            $montant_total = collect($validated['articles'])->sum(function ($item) {
                return $item['quantite'] * $item['prix_unitaire'];
            });

            //create the sale record
            $sale = Sale::create([
                 'numero' => $validated['numero'],
                 'client_id' => $validated['client_id'],
                 'user_id' => Auth::id(),
                 'montant_total' => $montant_total,
                 'adresse_livraison' => $validated['adresse_livraison'],
                 'date_livraison' => $validated['date_livraison'],
                 'status' => $validated['status'] ?? 'En attente',
                 'date_vente' => $validated['date_vente'] ?? date('Y-m-d H:i:s'),
            ]);

            foreach ($validated['articles'] as $article) {
                $sale->articles()->attach($article['id'], [
                    'quantite' => $article['quantite'],
                    'prix_unitaire' => $article['prix_unitaire'],
                    'total' => $article['quantite'] * $article['prix_unitaire']
                ]);
            }

            $sale->load(['client', 'articles', 'user']);
        
            return (new SaleResource($sale))->response()->setStatusCode(201);
        });
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
        // $validated = $request->validated();
        // $sale->update($validated);
        // $sale->load(['client', 'articles', 'user']);

        // return new SaleResource($sale);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sale $sale)
    {
        if ($sale->status === 'Annulee') {
           $sale->delete();

            return response()->noContent(); 
        }
    }
}

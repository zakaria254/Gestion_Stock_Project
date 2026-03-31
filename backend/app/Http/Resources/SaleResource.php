<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SaleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'numero' => $this->numero,
            'client' => new ClientResource($this->whenLoaded('client')),
            'article' => new ArticleResource($this->whenLoaded('article')),
            'quantite' => $this->quantite,
            'prix_unitaire' => $this->prix_unitaire,
            'montant_total' => $this->montant_total,
            'status' => $this->status,
            'date_vente' => $this->date_vente,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}

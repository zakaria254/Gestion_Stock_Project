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
            'user' => new UserResource($this->whenLoaded('user')),
            'articles' => ArticleResource::collection($this->whenLoaded('articles')),
            'montant_total' => $this->montant_total,
            'adresse_livraison' => $this->adresse_livraison,
            'status' => $this->status,
            'date_vente' => $this->date_vente?->format('Y-m-d H:i:s'),
            'date_livraison' => $this->date_livraison?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}

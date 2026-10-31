<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductionLotResource extends JsonResource
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
            'numero_lot' => $this->numero_lot,
            'article_id' => $this->article_id,
            // format the articles using ArticleResource and safely ignore it when loading fails
            'article' => new ArticleResource($this->whenLoaded('article')),
            'quantite' => $this->quantite,
            'status' => $this->status,
            'date_production' => $this->date_production,
            'certificat_abattage' => $this->certificat_abattage,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ArticleResource extends JsonResource
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
            'reference' => $this->reference,
            'nom' => $this->nom,
            'prix' => $this->prix,
            'unite' => $this->unite,
            'categorie' => $this->categorie,
            'seuil_minimum' => $this->seuil_minimum,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
            // When returned inside a sale relationship, expose pivot values
            'pivot' => $this->whenPivotLoaded('sale_article', function () {
                return [
                    'quantite' => $this->pivot->quantite,
                    'prix_unitaire' => $this->pivot->prix_unitaire,
                    'total' => $this->pivot->total,
                ];
            }),
        ];
    }
}
